import { Link, useNavigate } from 'react-router-dom';
import { Crown, Bot, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const startAIGame = (color: 'w' | 'b') => {
    navigate('/ai', { state: { color } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans p-6 relative overflow-hidden">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
        
        {/* Sección de Texto (Hero) */}
        <div className="text-left space-y-6">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Alexander's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Chess.
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-md">
            Demuestra tu nivel táctico. Humilla a un amigo en la misma pantalla o enfréntate a nuestro motor de Inteligencia Artificial.
          </p>
        </div>

        {/* Sección de Controles */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          
          <Link
            to="/local"
            className="group flex items-center justify-between p-5 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all duration-300 border border-slate-700 hover:border-cyan-500/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950 rounded-lg group-hover:text-cyan-400 transition-colors">
                <Users size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-white text-lg">PVP Local</span>
                <span className="text-sm text-slate-400">Juega contra un amigo</span>
              </div>
            </div>
          </Link>

          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950 rounded-lg text-slate-300">
                <Bot size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-white text-lg">vs Inteligencia Artificial</span>
                <span className="text-sm text-slate-400">Selecciona tu color para iniciar</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => startAIGame('w')} 
                className="flex-1 py-3 bg-slate-200 hover:bg-white text-slate-900 rounded-lg font-bold transition-colors shadow-sm"
              >
                ♔ Blancas
              </button>
              <button 
                onClick={() => startAIGame('b')} 
                className="flex-1 py-3 bg-slate-950 hover:bg-black text-white rounded-lg font-bold transition-colors border border-slate-700 hover:border-cyan-500/50 shadow-sm"
              >
                ♚ Negras
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}