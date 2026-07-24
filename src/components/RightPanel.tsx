import React, { useState, useEffect, useRef } from 'react';
import { MoveHistoryItem, CapturedPieces, EngineAnalysis, ChatMessage } from '../types';
import { PieceSvg } from './PieceSvg';
import { getTranslation } from '../utils/translations';
import { BoneyardSkeleton } from './BoneyardSkeleton';
import { OpeningExplorer } from './OpeningExplorer';

interface RightPanelProps {
  moveHistory: MoveHistoryItem[];
  capturedPieces: CapturedPieces;
  materialAdvantage: number; // Positive means white is up, negative means black is up
  activeMoveIndex: number; // currently reviewed move index (-1 if active)
  onReviewMove: (index: number) => void;
  engineAnalysis: EngineAnalysis;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isEngineThinking: boolean;
  language: string;
  onMakeMove?: (san: string) => void;
  currentFen?: string;
  gameMode?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  moveHistory,
  capturedPieces,
  materialAdvantage,
  activeMoveIndex,
  onReviewMove,
  engineAnalysis,
  chatMessages,
  onSendMessage,
  isEngineThinking,
  language,
  onMakeMove,
  currentFen,
  gameMode,
}) => {
  const [activeTab, setActiveTab] = useState<'moves' | 'captured' | 'analysis' | 'chat'>('moves');
  const [chatInput, setChatInput] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat & clear thinking state
  useEffect(() => {
    setIsCoachThinking(false);
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setIsCoachThinking(true);
    onSendMessage(chatInput);
    setChatInput('');
  };

  // Group moves by pairs for standard PGN table layout
  const getMovePairs = () => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        moveNum: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1] || null,
        whiteIdx: i,
        blackIdx: i + 1,
      });
    }
    return pairs;
  };

  const movePairs = getMovePairs();

  // Helper to render tiny captured piece lists
  const renderCapturedPieceList = (list: string[], color: 'w' | 'b') => {
    return (
      <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-950/40 border border-neutral-800/40 rounded-xl min-h-[52px] items-center">
        {list.length === 0 ? (
          <span className="text-xs text-neutral-500 italic px-2">{getTranslation(language, 'noneCapturedYet')}</span>
        ) : (
          list.map((p, idx) => (
            <div key={idx} className="w-7 h-7 bg-neutral-800/60 rounded-lg p-0.5 flex items-center justify-center border border-neutral-700/30 hover:scale-115 transition duration-150">
              <PieceSvg type={p} color={color} />
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div id="right-dashboard-tabs-panel" className="bg-neutral-900 border border-neutral-800/60 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
      
      {/* Premium Tab Navigation Bar (Material Design 3 style) */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1.5 gap-1 select-none">
        {[
          { id: 'moves', label: getTranslation(language, 'movesTab'), icon: 'list_alt' },
          { id: 'captured', label: getTranslation(language, 'capturedTab'), icon: 'swords' },
          { id: 'analysis', label: getTranslation(language, 'analysisTab'), icon: 'psychology' },
          { id: 'chat', label: getTranslation(language, 'coachChatTab'), icon: 'forum' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              id={`tab-select-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition duration-150 ${
                isSelected
                  ? 'bg-neutral-800 text-blue-400 border border-neutral-700/50 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels content area */}
      <div className="flex-grow overflow-y-auto p-4 flex flex-col min-h-0">
        
        {/* TAB 1: MOVE HISTORY */}
        {activeTab === 'moves' && (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{getTranslation(language, 'notationList')}</span>
              <span className="text-[11px] text-neutral-500 italic">{getTranslation(language, 'clickMovesReview')}</span>
            </div>
            
            <div className="flex-grow overflow-y-auto border border-neutral-800/50 bg-neutral-950/20 rounded-xl p-2 max-h-[360px]">
              {movePairs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                  <span className="material-symbols-outlined text-neutral-600 text-4xl mb-2">sports_esports</span>
                  <p className="text-sm font-medium text-neutral-400">{getTranslation(language, 'noMovesPlayed')}</p>
                  <p className="text-xs text-neutral-500 mt-1">{getTranslation(language, 'startMovingPieces')}</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800 text-xs">
                      <th className="py-2 px-3 font-medium w-16">#</th>
                      <th className="py-2 px-3 font-medium">{getTranslation(language, 'whiteHeader')}</th>
                      <th className="py-2 px-3 font-medium">{getTranslation(language, 'blackHeader')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movePairs.map((pair) => (
                      <tr 
                        key={pair.moveNum} 
                        className="border-b border-neutral-800/30 hover:bg-neutral-800/10"
                      >
                        <td className="py-2 px-3 text-neutral-500 font-mono text-xs">{pair.moveNum}.</td>
                        <td className="py-1 px-1">
                          <button
                            id={`move-history-btn-${pair.whiteIdx}`}
                            onClick={() => onReviewMove(pair.whiteIdx)}
                            className={`w-full text-left py-1.5 px-2 rounded-lg font-mono font-medium transition cursor-pointer ${
                              activeMoveIndex === pair.whiteIdx
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            {pair.white.san}
                          </button>
                        </td>
                        <td className="py-1 px-1">
                          {pair.black ? (
                            <button
                              id={`move-history-btn-${pair.blackIdx}`}
                              onClick={() => onReviewMove(pair.blackIdx)}
                              className={`w-full text-left py-1.5 px-2 rounded-lg font-mono font-medium transition cursor-pointer ${
                                activeMoveIndex === pair.blackIdx
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                  : 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                              }`}
                            >
                              {pair.black.san}
                            </button>
                          ) : (
                            <span className="text-neutral-600 font-mono text-xs px-2">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PGN Actions */}
            {movePairs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-neutral-800/40 flex gap-2">
                <button
                  id="nav-review-start"
                  onClick={() => onReviewMove(-2)} // Go to starting position
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-neutral-300 text-xs font-semibold transition flex items-center justify-center cursor-pointer"
                  title={language === 'es' ? 'Primera jugada' : 'First Move'}
                >
                  <span className="material-symbols-outlined text-sm">first_page</span>
                </button>
                <button
                  id="nav-review-prev"
                  onClick={() => onReviewMove(Math.max(-2, activeMoveIndex === -1 ? moveHistory.length - 2 : activeMoveIndex - 1))}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-neutral-300 text-xs font-semibold transition flex items-center justify-center cursor-pointer"
                  title={language === 'es' ? 'Anterior' : 'Previous'}
                >
                  <span className="material-symbols-outlined text-sm">navigate_before</span>
                </button>
                <button
                  id="nav-review-next"
                  onClick={() => {
                    if (activeMoveIndex === -1) return;
                    if (activeMoveIndex === moveHistory.length - 1) {
                      onReviewMove(-1); // resume live position
                    } else if (activeMoveIndex === -2) {
                      onReviewMove(0);
                    } else {
                      onReviewMove(activeMoveIndex + 1);
                    }
                  }}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-neutral-300 text-xs font-semibold transition flex items-center justify-center cursor-pointer"
                  title={language === 'es' ? 'Siguiente' : 'Next'}
                >
                  <span className="material-symbols-outlined text-sm">navigate_next</span>
                </button>
                <button
                  id="nav-review-end"
                  onClick={() => onReviewMove(-1)} // Resume live
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl text-neutral-300 text-xs font-semibold transition flex items-center justify-center cursor-pointer"
                  title={language === 'es' ? 'Última jugada (Reanudar)' : 'Last Move (Resume)'}
                >
                  <span className="material-symbols-outlined text-sm">last_page</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CAPTURED PIECES & MATERIAL ADVANTAGE */}
        {activeTab === 'captured' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-5">
              
              {/* Captured by White */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white border border-neutral-600" />
                  {getTranslation(language, 'capturedByWhite')}
                </h4>
                {renderCapturedPieceList(capturedPieces.b, 'b')}
              </div>

              {/* Captured by Black */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-700" />
                  {getTranslation(language, 'capturedByBlack')}
                </h4>
                {renderCapturedPieceList(capturedPieces.w, 'w')}
              </div>

              {/* Material Advantage Display */}
              <div className="p-4 bg-neutral-950/30 border border-neutral-800/60 rounded-xl flex items-center justify-between mt-4">
                <div>
                  <h5 className="text-xs font-semibold text-neutral-400">{getTranslation(language, 'advantageScore')}</h5>
                  <p className="text-sm text-neutral-300 font-medium mt-1">{getTranslation(language, 'calculatedWeights')}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
                  materialAdvantage > 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : materialAdvantage < 0 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {materialAdvantage === 0 ? 'compare_arrows' : 'trending_up'}
                  </span>
                  <span>
                    {materialAdvantage === 0 
                      ? getTranslation(language, 'equalMaterial') 
                      : materialAdvantage > 0 
                      ? `${getTranslation(language, 'whiteHeader')} +${materialAdvantage}` 
                      : `${getTranslation(language, 'blackHeader')} +${Math.abs(materialAdvantage)}`}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-3 bg-neutral-950/20 rounded-xl border border-neutral-800/40 text-center text-xs text-neutral-500 mt-6">
              {language === 'es' ? 'Peón (1) • Caballo (3) • Alfil (3) • Torre (5) • Dama (9)' : 'Pawn (1) • Knight (3) • Bishop (3) • Rook (5) • Queen (9)'}
            </div>
          </div>
        )}

        {/* TAB 3: ENGINE ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="flex flex-col h-full justify-between">
            
            <div className="space-y-4">
              
              {/* Eval Score Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{getTranslation(language, 'engineEvaluation')}</span>
                  {isEngineThinking ? (
                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      {getTranslation(language, 'thinking')}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {getTranslation(language, 'stockfishLocal')}
                    </span>
                  )}
                </div>

                {/* Vertical/Horizontal Eval Bar */}
                <div className="relative w-full h-5 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center font-mono text-[11px] font-bold">
                  {/* Fill percentage for white */}
                  {/* Evaluation scale from -10 to +10 mapped to 0% to 100% */}
                  {(() => {
                    const score = engineAnalysis.evalScore;
                    const percentage = Math.max(5, Math.min(95, ((score + 10) / 20) * 100));
                    return (
                      <>
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-neutral-100 transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="z-10 mix-blend-difference text-white">
                          {score > 0 ? `+${score.toFixed(1)}` : score < 0 ? score.toFixed(1) : `0.0 (${getTranslation(language, 'deadEqual')})`}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Accuracy Badge */}
              <div className="p-3 bg-neutral-950/40 border border-neutral-800 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">{getTranslation(language, 'lastMoveAccuracy')}</span>
                {(() => {
                  const acc = engineAnalysis.moveAccuracy;
                  let colorClass = 'bg-neutral-800 text-neutral-300';
                  let icon = 'info';
                  let label = acc;
                  if (acc === 'book') { 
                    colorClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20'; 
                    icon = 'menu_book'; 
                    label = language === 'es' ? 'Libro' : 'book';
                  }
                  else if (acc === 'best') { 
                    colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; 
                    icon = 'star'; 
                    label = language === 'es' ? 'Mejor' : 'best';
                  }
                  else if (acc === 'excellent') { 
                    colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; 
                    icon = 'sentiment_satisfied'; 
                    label = language === 'es' ? 'Excelente' : 'excellent';
                  }
                  else if (acc === 'good') { 
                    colorClass = 'bg-sky-500/10 text-sky-400 border border-sky-500/20'; 
                    icon = 'thumb_up'; 
                    label = language === 'es' ? 'Buena' : 'good';
                  }
                  else if (acc === 'inaccuracy') { 
                    colorClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'; 
                    icon = 'warning'; 
                    label = language === 'es' ? 'Imprecisión' : 'inaccuracy';
                  }
                  else if (acc === 'mistake') { 
                    colorClass = 'bg-orange-500/10 text-orange-400 border border-orange-500/20'; 
                    icon = 'error'; 
                    label = language === 'es' ? 'Error' : 'mistake';
                  }
                  else if (acc === 'blunder') { 
                    colorClass = 'bg-red-500/10 text-red-400 border border-red-500/20'; 
                    icon = 'dangerous'; 
                    label = language === 'es' ? 'Error Grave' : 'blunder';
                  }
                  
                  return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${colorClass}`}>
                      <span className="material-symbols-outlined text-xs">{icon}</span>
                      {label}
                    </span>
                  );
                })()}
              </div>

              {/* Best continuation */}
              <div className="p-3.5 bg-neutral-950/20 border border-neutral-800/60 rounded-xl space-y-2">
                <h5 className="text-xs font-semibold text-neutral-300 uppercase tracking-tight">{getTranslation(language, 'bestContinuation')}</h5>
                <div className="flex flex-wrap gap-2">
                  {engineAnalysis.bestContinuation.length === 0 ? (
                    <span className="text-xs text-neutral-500 italic">{getTranslation(language, 'noContinuationLines')}</span>
                  ) : (
                    engineAnalysis.bestContinuation.map((move, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onMakeMove && onMakeMove(move)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/50 hover:border-blue-500/50 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1"
                        title={language === 'es' ? `Ejecutar jugada ${move} en el tablero` : `Play move ${move} on board`}
                      >
                        <span>{i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{move}</span>
                        <span className="material-symbols-outlined text-[10px] text-blue-400">play_arrow</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic Opening Explorer Component */}
              <OpeningExplorer
                moveHistorySan={moveHistory.map((m) => m.san)}
                currentFen={currentFen || ''}
                onMakeMove={(san) => onMakeMove && onMakeMove(san)}
                language={language}
                isDarkMode={true}
              />

            </div>

            <div className="p-3 bg-neutral-950/20 rounded-xl border border-neutral-800/40 text-xs text-neutral-500 text-center leading-normal">
              {getTranslation(language, 'analyzingDepthText')}
            </div>
          </div>
        )}

        {/* TAB 4: COACH CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full min-h-0 justify-between">
            
            {/* Chat message box */}
            <div className="flex-grow overflow-y-auto space-y-3 p-1 mb-4 max-h-[290px] border border-neutral-800/30 bg-neutral-950/10 rounded-xl p-2.5">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <span className="material-symbols-outlined text-neutral-600 text-3xl mb-1.5">chat_bubble</span>
                  <p className="text-xs font-medium text-neutral-400">{getTranslation(language, 'coachReady')}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{getTranslation(language, 'coachWillAnalyze')}</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-normal ${
                      msg.isSystem
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 self-center max-w-[95%] text-center'
                        : msg.sender === 'Coach AI'
                        ? 'bg-neutral-800 text-neutral-100 border border-neutral-700/40 self-start rounded-tl-none'
                        : 'bg-blue-600 text-white self-end rounded-tr-none'
                    }`}
                  >
                    {!msg.isSystem && (
                      <span className={`font-bold uppercase tracking-wide text-[9px] mb-1 block ${
                        msg.sender === 'Coach AI' ? 'text-blue-400' : 'text-neutral-300'
                      }`}>
                        {msg.sender === 'Coach AI' ? getTranslation(language, 'coachAdvise') : msg.sender}
                      </span>
                    )}
                    <span className="font-medium">{msg.text}</span>
                    <span className="text-[9px] text-neutral-400 mt-1 self-end">{msg.timestamp}</span>
                  </div>
                ))
              )}
              {isCoachThinking && (
                <BoneyardSkeleton loading={true} variant="chat" count={1} className="pt-1" />
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat submit form */}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                id="chat-text-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={getTranslation(language, 'askCoachAI')}
                className="flex-grow bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition duration-150"
              />
              <button
                id="chat-send-btn"
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white p-2.5 rounded-xl transition duration-150 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
};
