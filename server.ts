import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface PlayerSession {
  nickname: string;
  ws: WebSocket;
}

interface GameSession {
  gameId: string;
  white: PlayerSession | null;
  black: PlayerSession | null;
  fen: string;
  moves: string[];
}

const games = new Map<string, GameSession>();

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

  wss.on('connection', (ws: WebSocket) => {
    let playerGameId: string | null = null;
    let playerColor: 'w' | 'b' | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'create-game': {
            const { nickname, preferredColor } = data;
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
            playerGameId = gameId;
            playerColor = assignedColor;

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
                message: 'No se encontró la partida con ese código. / Match code not found.',
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

            playerGameId = targetGameId;
            playerColor = assignedColor;

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
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const { move, fen } = data;
            game.fen = fen;
            if (move) {
              game.moves.push(move);
            }

            // Broadcast move to opponent
            const opponent = playerColor === 'w' ? game.black : game.white;
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
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const opponent = playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'opponent-resigned',
              }));
            }
            break;
          }

          case 'offer-draw': {
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const opponent = playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'draw-offered',
              }));
            }
            break;
          }

          case 'respond-draw': {
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const { accepted } = data;
            const opponent = playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'draw-responded',
                accepted,
              }));
            }
            break;
          }

          case 'offer-rematch': {
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const opponent = playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'rematch-offered',
              }));
            }
            break;
          }

          case 'respond-rematch': {
            if (!playerGameId) return;
            const game = games.get(playerGameId);
            if (!game) return;

            const { accepted } = data;
            if (accepted) {
              game.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
              game.moves = [];
            }

            const opponent = playerColor === 'w' ? game.black : game.white;
            if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
              opponent.ws.send(JSON.stringify({
                type: 'rematch-responded',
                accepted,
              }));
            }
            break;
          }

          case 'chat-message': {
            if (!playerGameId) return;
            const game = games.get(playerGameId);
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
      if (playerGameId) {
        const game = games.get(playerGameId);
        if (game) {
          // Remove disconnecting player from session
          if (playerColor === 'w') {
            game.white = null;
          } else if (playerColor === 'b') {
            game.black = null;
          }

          // Notify the other player
          const opponent = playerColor === 'w' ? game.black : game.white;
          if (opponent && opponent.ws.readyState === WebSocket.OPEN) {
            opponent.ws.send(JSON.stringify({
              type: 'opponent-disconnected',
              message: 'El oponente se ha desconectado. / Opponent disconnected.',
            }));
          }

          // Clean up game if both players are gone
          if (!game.white && !game.black) {
            games.delete(playerGameId);
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
