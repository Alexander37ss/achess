import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <-- Inyección i18n

export default function PlayLocal() {
  const navigate = useNavigate();
  const { t } = useTranslation("global"); // <-- Hook inicializado

  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());

  const goHome = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) {
      if (!window.confirm(t("game.confirm_leave"))) return;
    }
    navigate('/');
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

  const onDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;

    const isPromotion =
      (piece.pieceType === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
      (piece.pieceType === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1');

    const move = makeAMove({ from: sourceSquare, to: targetSquare, promotion: isPromotion ? 'q' : undefined });
    return move !== null;
  };

  const resetGame = () => {
    game.current = new Chess();
    setFen(game.current.fen());
  };

  const handleManualReset = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) {
      if (!window.confirm(t("game.confirm_reset"))) return;
    }
    resetGame();
  };

  const materialData = getMaterialData();
  
  let gameStatus = t("game.turn_of", { color: game.current.turn() === 'w' ? t("game.white") : t("game.black") });
  if (game.current.isGameOver()) {
    gameStatus = game.current.isCheckmate() 
      ? t("game.checkmate_win", { winner: game.current.turn() === 'w' ? t("game.black") : t("game.white") })
      : t("game.draw");
  }

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
        
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {t("game.title_local")}
        </h1>

        <div className="w-full mb-6">
          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-t-lg border border-slate-700/50 mb-2">
            <div className="flex items-center gap-3">
              <span>{t("game.black")}</span>
              <div className="flex items-center">
                <div className="flex">
                  {renderCapturedPieces(materialData.captured.b, 'w')}
                </div>
                {materialData.score.b > 0 && (
                  <span className="ml-2 text-sm px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">+{materialData.score.b}</span>
                )}
              </div>
            </div>
          </div>

          <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-700">
            <Chessboard
              options={{
                position: fen, 
                onPieceDrop: onDrop, 
                boardOrientation: 'white', 
                boardStyle: { borderRadius: '0px' },
                darkSquareStyle: { backgroundColor: '#475569' }, 
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                dropSquareStyle: { boxShadow: 'inset 0 0 1px 6px rgba(6, 182, 212, 0.8)', backgroundColor: 'rgba(6, 182, 212, 0.2)' }
              }}
            />
          </div>

          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-b-lg border border-slate-700/50 mt-2">
            <div className="flex items-center gap-3">
              <span>{t("game.white")}</span>
              <div className="flex items-center">
                <div className="flex">
                  {renderCapturedPieces(materialData.captured.w, 'b')}
                </div>
                {materialData.score.w > 0 && (
                  <span className="ml-2 text-sm px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">+{materialData.score.w}</span>
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