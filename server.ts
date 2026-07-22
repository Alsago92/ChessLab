import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface PlayerSession {
  nickname: string;
  ws: WebSocket;
  isOffline?: boolean;
  graceTimer?: any;
}

interface GameSession {
  gameId: string;
  white: PlayerSession | null;
  black: PlayerSession | null;
  fen: string;
  moves: string[];
}

interface MatchmakingPlayer {
  nickname: string;
  ws: WebSocket;
}

const games = new Map<string, GameSession>();
let matchmakingQueue: MatchmakingPlayer[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeGames: games.size });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket connection upgrade
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // Helper to generate a random 5-character alphanumeric match code
  function generateGameId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O/0/I/1
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // Heartbeat interval to keep mobile sockets alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          // ignore
        }
      }
    });
  }, 12000);

  wss.on('connection', (ws: WebSocket) => {
    const sessionState = {
      playerGameId: null as string | null,
      playerColor: null as 'w' | 'b' | null,
    };
    (ws as any).sessionState = sessionState;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          }

          case 'pong': {
            break;
          }

          case 'rejoin-game': {
            const { gameId, nickname, playerColor } = data;
            const targetGameId = (gameId || '').trim().toUpperCase();
            const game = games.get(targetGameId);

            if (!game) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Partida no encontrada o expirada.',
              }));
              return;
            }

            // Determine assigned color
            let assignedColor: 'w' | 'b' | null = null;
            if (playerColor === 'w' || playerColor === 'b') {
              assignedColor = playerColor;
            } else if (game.white && game.white.nickname === nickname) {
              assignedColor = 'w';
            } else if (game.black && game.black.nickname === nickname) {
              assignedColor = 'b';
            }

            if (!assignedColor) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'No perteneces a esta partida.',
              }));
              return;
            }

            // Clear grace timer if running
            const existingSession = assignedColor === 'w' ? game.white : game.black;
            if (existingSession && existingSession.graceTimer) {
              clearTimeout(existingSession.graceTimer);
              existingSession.graceTimer = null;
            }

            const newSession: PlayerSession = {
              nickname,
              ws,
              isOffline: false,
              graceTimer: null,
            };

            if (assignedColor === 'w') {
              game.white = newSession;
            } else {
              game.black = newSession;
            }

            sessionState.playerGameId = targetGameId;
            sessionState.playerColor = assignedColor;

            // Send full restored state to rejoining player
            ws.send(JSON.stringify({
              type: 'game-rejoined',
              gameId: targetGameId,
              playerColor: assignedColor,
              fen: game.fen,
              moves: game.moves,
              whiteNickname: game.white?.nickname || '',
              blackNickname: game.black?.nickname || '',
            }));

            // Notify opponent
            const opponent = assignedColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'opponent-reconnected',
                nickname,
              }));
            }
            break;
          }
          case 'join-matchmaking': {
            const { nickname } = data;
            
            // Clean up queue: remove self (same ws or same nickname) and closed sockets
            matchmakingQueue = matchmakingQueue.filter(p => p.ws !== ws && p.nickname !== nickname && p.ws.readyState === WebSocket.OPEN);

            // If player was hosting an empty waiting private room, clean it up
            if (sessionState.playerGameId) {
              const oldGame = games.get(sessionState.playerGameId);
              if (oldGame && (!oldGame.white || !oldGame.black)) {
                games.delete(sessionState.playerGameId);
              }
              sessionState.playerGameId = null;
            }

            // Find valid opponent in queue who is NOT the same socket and NOT the same nickname
            const validOpponentIndex = matchmakingQueue.findIndex(p => p.ws !== ws && p.nickname !== nickname && p.ws.readyState === WebSocket.OPEN);

            if (validOpponentIndex !== -1) {
              const [opponent] = matchmakingQueue.splice(validOpponentIndex, 1);
              const gameId = generateGameId();

              // Random colors
              const isHostWhite = Math.random() < 0.5;
              const hostColor: 'w' | 'b' = isHostWhite ? 'w' : 'b';
              const guestColor: 'w' | 'b' = isHostWhite ? 'b' : 'w';

              const hostSession: PlayerSession = { nickname: opponent.nickname, ws: opponent.ws };
              const guestSession: PlayerSession = { nickname, ws };

              const newGame: GameSession = {
                gameId,
                white: hostColor === 'w' ? hostSession : guestSession,
                black: hostColor === 'b' ? hostSession : guestSession,
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                moves: [],
              };

              games.set(gameId, newGame);

              const opponentState = (opponent.ws as any).sessionState;
              if (opponentState) {
                opponentState.playerGameId = gameId;
                opponentState.playerColor = hostColor;
              }
              sessionState.playerGameId = gameId;
              sessionState.playerColor = guestColor;

              // Send game-joined to both
              const payloadHost = JSON.stringify({
                type: 'game-joined',
                gameId,
                playerColor: hostColor,
                whiteNickname: newGame.white?.nickname || '',
                blackNickname: newGame.black?.nickname || '',
                fen: newGame.fen,
              });

              const payloadGuest = JSON.stringify({
                type: 'game-joined',
                gameId,
                playerColor: guestColor,
                whiteNickname: newGame.white?.nickname || '',
                blackNickname: newGame.black?.nickname || '',
                fen: newGame.fen,
              });

              opponent.ws.send(payloadHost);
              ws.send(payloadGuest);
            } else {
              matchmakingQueue.push({ nickname, ws });
              ws.send(JSON.stringify({
                type: 'matchmaking-queued',
              }));
            }
            break;
          }

          case 'leave-matchmaking': {
            matchmakingQueue = matchmakingQueue.filter(p => p.ws !== ws);
            ws.send(JSON.stringify({
              type: 'matchmaking-cancelled',
            }));
            break;
          }

          case 'create-game': {
            const { nickname, preferredColor } = data;

            // Remove from matchmaking queue if present
            matchmakingQueue = matchmakingQueue.filter(p => p.ws !== ws);

            // Clean up old waiting private room if any
            if (sessionState.playerGameId) {
              const oldGame = games.get(sessionState.playerGameId);
              if (oldGame && (!oldGame.white || !oldGame.black)) {
                games.delete(sessionState.playerGameId);
              }
            }

            const gameId = generateGameId();
            
            // Determine color
            let assignedColor: 'w' | 'b' = 'w';
            if (preferredColor === 'b') assignedColor = 'b';
            else if (preferredColor === 'random') {
              assignedColor = Math.random() < 0.5 ? 'w' : 'b';
            }

            const session: PlayerSession = { nickname, ws };
            const newGame: GameSession = {
              gameId,
              white: assignedColor === 'w' ? session : null,
              black: assignedColor === 'b' ? session : null,
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              moves: [],
            };

            games.set(gameId, newGame);
            sessionState.playerGameId = gameId;
            sessionState.playerColor = assignedColor;

            ws.send(JSON.stringify({
              type: 'game-created',
              gameId,
              playerColor: assignedColor,
            }));
            break;
          }

          case 'join-game': {
            const { gameId, nickname } = data;
            const targetGameId = (gameId || '').trim().toUpperCase();
            const game = games.get(targetGameId);

            if (!game) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'No se encontró la partida con ese código.',
              }));
              return;
            }

            // Check if player is already in this game
            if ((game.white && game.white.ws === ws) || (game.black && game.black.ws === ws)) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Ya estás en esta partida como anfitrión.',
              }));
              return;
            }

            // Determine open slot
            let assignedColor: 'w' | 'b' | null = null;
            if (!game.white) assignedColor = 'w';
            else if (!game.black) assignedColor = 'b';

            if (!assignedColor) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Esta partida ya está llena. / This game is already full.',
              }));
              return;
            }

            const session: PlayerSession = { nickname, ws };
            if (assignedColor === 'w') {
              game.white = session;
            } else {
              game.black = session;
            }

            sessionState.playerGameId = targetGameId;
            sessionState.playerColor = assignedColor;

            // Notify joiner
            ws.send(JSON.stringify({
              type: 'game-joined',
              gameId: targetGameId,
              playerColor: assignedColor,
              whiteNickname: game.white?.nickname || '',
              blackNickname: game.black?.nickname || '',
              fen: game.fen,
            }));

            // Notify opponent if connected
            const opponent = assignedColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'opponent-joined',
                opponentNickname: nickname,
                whiteNickname: game.white?.nickname || '',
                blackNickname: game.black?.nickname || '',
              }));
            }
            break;
          }

          case 'make-move': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const { move, fen } = data;
            game.fen = fen;
            if (move) {
              game.moves.push(move);
            }

            // Broadcast move to opponent
            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'opponent-moved',
                move,
                fen,
              }));
            }
            break;
          }

          case 'resign': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'opponent-resigned',
              }));
            }
            break;
          }

          case 'offer-draw': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'draw-offered',
              }));
            }
            break;
          }

          case 'respond-draw': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const { accepted } = data;
            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'draw-responded',
                accepted,
              }));
            }
            break;
          }

          case 'offer-rematch': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'rematch-offered',
              }));
            }
            break;
          }

          case 'respond-rematch': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const { accepted } = data;
            if (accepted) {
              game.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
              game.moves = [];
            }

            const opponent = sessionState.playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'rematch-responded',
                accepted,
              }));
            }
            break;
          }

          case 'chat-message': {
            if (!sessionState.playerGameId) return;
            const game = games.get(sessionState.playerGameId);
            if (!game) return;

            const { text, nickname } = data;
            const payload = JSON.stringify({
              type: 'chat-message',
              nickname,
              text,
            });

            if (game.white && game.white.ws.readyState === WebSocket.OPEN) {
              game.white.ws.send(payload);
            }
            if (game.black && game.black.ws.readyState === WebSocket.OPEN) {
              game.black.ws.send(payload);
            }
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      // Remove from matchmaking queue if present
      matchmakingQueue = matchmakingQueue.filter(p => p.ws !== ws);

      if (sessionState.playerGameId) {
        const game = games.get(sessionState.playerGameId);
        if (game) {
          const isWhite = sessionState.playerColor === 'w';
          const playerSession = isWhite ? game.white : game.black;
          const opponentSession = isWhite ? game.black : game.white;

          if (playerSession) {
            playerSession.isOffline = true;

            if (playerSession.graceTimer) {
              clearTimeout(playerSession.graceTimer);
            }

            // Send temporary offline alert to opponent
            if (opponentSession && opponentSession.ws && opponentSession.ws.readyState === WebSocket.OPEN) {
              opponentSession.ws.send(JSON.stringify({
                type: 'opponent-offline',
                message: 'El oponente se desconectó temporalmente. Esperando reconexión...',
                graceSeconds: 45,
              }));
            }

            // Start grace period timer (45 seconds) before declaring permanent forfeit
            playerSession.graceTimer = setTimeout(() => {
              if (playerSession.isOffline) {
                if (isWhite) game.white = null;
                else game.black = null;

                if (opponentSession && opponentSession.ws && opponentSession.ws.readyState === WebSocket.OPEN) {
                  opponentSession.ws.send(JSON.stringify({
                    type: 'opponent-disconnected',
                    message: 'El oponente no regresó a tiempo (tiempo de gracia agotado).',
                  }));
                }

                if ((!game.white || game.white.isOffline) && (!game.black || game.black.isOffline)) {
                  games.delete(sessionState.playerGameId!);
                }
              }
            }, 45000);
          }
        }
      }
    });
  });

  // Vite development / static production setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Material Chess Server] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
