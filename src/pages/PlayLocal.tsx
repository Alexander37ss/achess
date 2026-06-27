import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function PlayLocal() {
  const navigate = useNavigate();
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen()); //[cite: 4]

  const goHome = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) { //[cite: 4]
      if (!window.confirm('Hay una partida en curso. ¿Seguro que quiere abandonarla?')) return; //[cite: 4]
    }
    navigate('/'); //[cite: 4]
  };

  const getMaterialData = () => {
    const starting = { p: 8, n: 2, b: 2, r: 2, q: 1 }; //[cite: 4]
    const currentW: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 }; //[cite: 4]
    const currentB: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 }; //[cite: 4]
    let wScore = 0, bScore = 0; //[cite: 4]
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }; //[cite: 4]

    game.current.board().forEach(row => {
      row.forEach(piece => {
        if (piece) {
          if (piece.color === 'w') { //[cite: 4]
            currentW[piece.type]++; //[cite: 4]
            wScore += values[piece.type]; //[cite: 4]
          } else {
            currentB[piece.type]++; //[cite: 4]
            bScore += values[piece.type]; //[cite: 4]
          }
        }
      });
    });

    return { 
      score: { w: Math.max(0, wScore - bScore), b: Math.max(0, bScore - wScore) }, //[cite: 4]
      captured: { 
        w: { p: starting.p - currentB.p, n: starting.n - currentB.n, b: starting.b - currentB.b, r: starting.r - currentB.r, q: starting.q - currentB.q }, //[cite: 4]
        b: { p: starting.p - currentW.p, n: starting.n - currentW.n, b: starting.b - currentW.b, r: starting.r - currentW.r, q: starting.q - currentW.q } //[cite: 4]
      }
    };
  };

  const renderCapturedPieces = (capturedCount: Record<string, number>, capturedColor: 'w' | 'b') => {
    const pieceOrder = ['p', 'n', 'b', 'r', 'q']; //[cite: 4]
    const pieceSymbols: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' }; //[cite: 4]

    const pieces: string[] = []; //[cite: 4]
    pieceOrder.forEach(type => {
      for (let i = 0; i < capturedCount[type]; i++) { //[cite: 4]
        pieces.push(pieceSymbols[type]); //[cite: 4]
      }
    });

    return pieces.map((symbol, index) => (
      <span
        key={index}
        // Ajustado para la paleta slate en lugar de #1A1A1A
        className={`text-xl -ml-1.5 ${capturedColor === 'w' ? 'text-white' : 'text-slate-950'}`}
        style={{ 
          WebkitTextStroke: capturedColor === 'w' ? '1px #333' : '1px #64748b',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)' //[cite: 4]
        }}
      >
        {symbol}
      </span>
    ));
  };

  const makeAMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.current.move(move); //[cite: 4]
      setFen(game.current.fen()); //[cite: 4]
      return result; //[cite: 4]
    } catch (e) {
      return null; //[cite: 4]
    }
  };

  const onDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false; //[cite: 4]

    const isPromotion =
      (piece.pieceType === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') || //[cite: 4]
      (piece.pieceType === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1'); //[cite: 4]

    const move = makeAMove({ from: sourceSquare, to: targetSquare, promotion: isPromotion ? 'q' : undefined }); //[cite: 4]
    return move !== null; //[cite: 4]
  };

  const handleManualReset = () => {
    if (game.current.history().length > 0 && !game.current.isGameOver()) { //[cite: 4]
      if (!window.confirm('Hay una partida en curso. ¿Seguro que quiere reiniciar?')) return; //[cite: 4]
    }
    game.current = new Chess(); //[cite: 4]
    setFen(game.current.fen()); //[cite: 4]
  };

  const materialData = getMaterialData(); //[cite: 4]
  let gameStatus = `Turno de: ${game.current.turn() === 'w' ? 'Blancas' : 'Negras'}`; //[cite: 4]
  if (game.current.isGameOver()) { //[cite: 4]
    gameStatus = game.current.isCheckmate() //[cite: 4]
      ? `¡Jaque Mate! Ganan las ${game.current.turn() === 'w' ? 'Negras' : 'Blancas'} 🏆` //[cite: 4]
      : '¡Empate! 🤝'; //[cite: 4]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans p-4 relative overflow-hidden">
      {/* Resplandor Neon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[550px] bg-slate-900/80 backdrop-blur-md border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl">
        
        <div className="flex justify-between w-full mb-6">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all border border-slate-700 hover:border-cyan-500/50 shadow-sm" 
            onClick={goHome}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all border border-slate-700 hover:border-cyan-500/50 shadow-sm" 
            onClick={handleManualReset}
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Modo Local
        </h1>

        <div className="w-full mb-6">
          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-t-lg border border-slate-700/50 mb-2">
            <div className="flex items-center gap-3">
              <span>Negras</span>
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
              boardStyle: { borderRadius: '0px' },
              
              /* -- Paleta Corregida para Alto Contraste -- */
              darkSquareStyle: { backgroundColor: '#475569' },  /* slate-600: Lo bastante claro para que resalten las piezas negras */
              lightSquareStyle: { backgroundColor: '#cbd5e1' }, /* slate-300: Contraste perfecto para las piezas blancas */
              
              /* Brillo cian al arrastrar una pieza (se mantiene) */
              dropSquareStyle: { 
                boxShadow: 'inset 0 0 1px 6px rgba(6, 182, 212, 0.8)', 
                backgroundColor: 'rgba(6, 182, 212, 0.2)' 
              }
            }}
          />
          </div>

          <div className="flex justify-between items-center px-4 py-3 font-bold text-lg text-slate-300 bg-slate-800/50 rounded-b-lg border border-slate-700/50 mt-2">
            <div className="flex items-center gap-3">
              <span>Blancas</span>
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