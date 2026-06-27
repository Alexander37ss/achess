import { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <-- Inyección i18n

// Refactorización: Reemplazamos el string duro por la clave de traducción
const DIFFICULTY_LEVELS = {
  FACIL: { key: 'diff_easy', depth: 1 },
  MEDIO: { key: 'diff_medium', depth: 5 },
  ALTO: { key: 'diff_hard', depth: 10 },
  IMBATIBLE: { key: 'diff_max', depth: 15 },
} as const;

type DifficultyKey = keyof typeof DIFFICULTY_LEVELS;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

export default function PlayAI() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("global"); // <-- Hook inicializado
  
  const playerColor = location.state?.color || 'w';

  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS.MEDIO);
  const [isThinking, setIsThinking] = useState(false);

  const goHome = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) {
      if (!window.confirm(t("game.confirm_leave"))) return;
    }
    navigate('/');
  };

  const handleDifficultyChange = (newLevelKey: DifficultyKey) => {
    const newDifficulty = DIFFICULTY_LEVELS[newLevelKey];
    if (newDifficulty.depth === difficulty.depth) return;

    // Uso de interpolación para el mensaje de confirmación
    if (window.confirm(t("game.confirm_difficulty", { level: t(`game.${newDifficulty.key}`) }))) {
      setDifficulty(newDifficulty);
    }
  };

  const getMaterialData = () => {
    const starting = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentW: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const currentB: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    let wScore = 0, bScore = 0;
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

    game.current.board().forEach(row => {
      row.forEach(piece => {
        if (piece) {
          if (piece.color === 'w') {
            currentW[piece.type]++;
            wScore += values[piece.type];
          } else {
            currentB[piece.type]++;
            bScore += values[piece.type];
          }
        }
      });
    });

    return { 
      score: { w: Math.max(0, wScore - bScore), b: Math.max(0, bScore - wScore) },
      captured: { 
        w: { p: starting.p - currentB.p, n: starting.n - currentB.n, b: starting.b - currentB.b, r: starting.r - currentB.r, q: starting.q - currentB.q },
        b: { p: starting.p - currentW.p, n: starting.n - currentW.n, b: starting.b - currentW.b, r: starting.r - currentW.r, q: starting.q - currentW.q }
      }
    };
  };

  const renderCapturedPieces = (capturedCount: Record<string, number>, capturedColor: 'w' | 'b') => {
    const pieceOrder = ['p', 'n', 'b', 'r', 'q'];
    const pieceSymbols: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
    const pieces: string[] = [];
    pieceOrder.forEach(type => {
      for (let i = 0; i < capturedCount[type]; i++) {
        pieces.push(pieceSymbols[type]);
      }
    });

    return pieces.map((symbol, index) => (
      <span key={index} className={`text-xl -ml-1.5 ${capturedColor === 'w' ? 'text-white' : 'text-slate-950'}`} style={{ WebkitTextStroke: capturedColor === 'w' ? '1px #333' : '1px #64748b', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        {symbol}
      </span>
    ));
  };

  const makeAMove = (move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.current.move(move);
      setFen(game.current.fen());
      return result;
    } catch (e) {
      return null;
    }
  };

  const makeAIMove = async () => {
    const possibleMoves = game.current.moves();
    if (game.current.isGameOver() || game.current.isDraw() || possibleMoves.length === 0) return;

    setIsThinking(true);
    try {
      const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(game.current.fen())}&depth=${difficulty.depth}`);
      const data = await response.json();

      if (data.success && data.bestmove) {
        const moveString = data.bestmove.split(' ')[1];
        const from = moveString.substring(0, 2);
        const to = moveString.substring(2, 4);
        const promotion = moveString.length > 4 ? moveString[4] : undefined;
        makeAMove({ from, to, promotion });
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      makeAMove(possibleMoves[randomIndex]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (playerColor === 'b' && game.current.history().length === 0) {
      timer = setTimeout(makeAIMove, 300);
    }
    return () => clearTimeout(timer);
  }, []); 

  const onDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;
    if (game.current.turn() !== playerColor) return false;

    const isPromotion =
      (piece.pieceType === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
      (piece.pieceType === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1');

    const move = makeAMove({ from: sourceSquare, to: targetSquare, promotion: isPromotion ? 'q' : undefined });
    
    if (move === null) return false;
    if (!game.current.isGameOver()) {
      setTimeout(makeAIMove, 300);
    }
    return true;
  };

  const resetGame = () => {
    game.current = new Chess();
    setFen(game.current.fen());
    if (playerColor === 'b') {
      setTimeout(makeAIMove, 300);
    }
  };

  const handleManualReset = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) {
      if (!window.confirm(t("game.confirm_reset"))) return;
    }
    resetGame();
  };

  const materialData = getMaterialData();
  
  // Lógica de traducción para el estado del juego
  let gameStatus = t("game.turn_of", { color: game.current.turn() === 'w' ? t("game.white") : t("game.black") });
  if (game.current.isGameOver()) {
    gameStatus = game.current.isCheckmate() 
      ? t("game.checkmate_win", { winner: game.current.turn() === 'w' ? t("game.black") : t("game.white") })
      : t("game.draw");
  }

  const topColor = playerColor === 'b' ? 'w' : 'b';
  const bottomColor = topColor === 'w' ? 'b' : 'w';

  const currentDifficultyKey = (Object.keys(DIFFICULTY_LEVELS) as DifficultyKey[]).find(
    key => DIFFICULTY_LEVELS[key].depth === difficulty.depth
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[550px] bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl">
        
        <div className="flex justify-between w-full mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all border border-slate-700 hover:border-cyan-500/50 shadow-sm" onClick={goHome}>
            <ArrowLeft size={18} />
            {t("game.btn_back")}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all border border-slate-700 hover:border-cyan-500/50 shadow-sm" onClick={handleManualReset}>
            <RotateCcw size={16} />
            {t("game.btn_reset")}
          </button>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {t("game.title_ai")}
        </h1>

        <div className="w-full mb-6 flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
          <BrainCircuit size={20} className="text-cyan-400" />
          <span className="font-semibold text-slate-300 text-sm">{t("game.ai_level")}</span>
          <select 
            value={currentDifficultyKey}
            onChange={(e) => handleDifficultyChange(e.target.value as DifficultyKey)}
            className="bg-slate-950 text-slate-200 text-sm font-semibold rounded-md px-3 py-1.5 outline-none border border-slate-700 focus:border-cyan-500 cursor-pointer"
          >
            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
              <option key={key} value={key}>{t(`game.${level.key}`)}</option>
            ))}
          </select>
          {isThinking && (
            <span className="text-xs text-cyan-400 animate-pulse ml-auto font-bold tracking-wider uppercase">
              {t("game.processing")}
            </span>
          )}
        </div>

        <div className="w-full mb-6">
          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-t-lg border border-slate-700/50 mb-2">
            <div className="flex items-center gap-3">
              <span>{topColor === 'b' ? t("game.black") : t("game.white")} ({t("game.ai")})</span>
              <div className="flex items-center">
                <div className="flex">
                  {renderCapturedPieces(materialData.captured[topColor], topColor === 'w' ? 'b' : 'w')}
                </div>
                {materialData.score[topColor] > 0 && (
                  <span className="ml-2 text-sm px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">+{materialData.score[topColor]}</span>
                )}
              </div>
            </div>
          </div>

          <div className={`shadow-2xl rounded-lg overflow-hidden border transition-colors duration-300 ${isThinking ? 'border-cyan-500/50' : 'border-slate-700'}`}>
            <Chessboard
              options={{
                position: fen, 
                onPieceDrop: onDrop, 
                boardOrientation: playerColor === 'b' ? 'black' : 'white', 
                boardStyle: { borderRadius: '0px' },
                darkSquareStyle: { backgroundColor: '#475569' }, 
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                dropSquareStyle: { boxShadow: 'inset 0 0 1px 6px rgba(6, 182, 212, 0.8)', backgroundColor: 'rgba(6, 182, 212, 0.2)' }
              }}
            />
          </div>

          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-b-lg border border-slate-700/50 mt-2">
            <div className="flex items-center gap-3">
              <span>{bottomColor === 'w' ? t("game.white") : t("game.black")} ({t("game.you")})</span>
              <div className="flex items-center">
                <div className="flex">
                  {renderCapturedPieces(materialData.captured[bottomColor], bottomColor === 'w' ? 'b' : 'w')}
                </div>
                {materialData.score[bottomColor] > 0 && (
                  <span className="ml-2 text-sm px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">+{materialData.score[bottomColor]}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-2 w-full p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <h2 className="text-xl font-bold" style={{ color: game.current.isGameOver() ? '#ef4444' : '#e2e8f0' }}>{gameStatus}</h2>
        </div>
        
      </div>
    </div>
  );
}