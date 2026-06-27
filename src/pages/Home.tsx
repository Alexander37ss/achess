import { Link, useNavigate } from 'react-router-dom';
import { Bot, Users, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("global");

  const startAIGame = (color: 'w' | 'b') => {
    navigate('/ai', { state: { color } });
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 font-sans p-6 relative overflow-hidden">
      
      {/* Control de Idioma */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-cyan-400 rounded-full border border-cyan-900/50 hover:border-cyan-500/50 transition-all shadow-lg backdrop-blur-md text-sm font-bold uppercase tracking-wider"
        >
          <Globe size={16} />
          {i18n.language === 'es' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
        
        {/* Sección de Texto (Hero) */}
        <div className="text-left space-y-6">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            {t("home.title_part1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {t("home.title_part2")}
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-md">
            {t("home.description")}
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
                <span className="block font-bold text-white text-lg">{t("home.local_title")}</span>
                <span className="text-sm text-slate-400">{t("home.local_desc")}</span>
              </div>
            </div>
          </Link>

          <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950 rounded-lg text-slate-300">
                <Bot size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-white text-lg">{t("home.ai_title")}</span>
                <span className="text-sm text-slate-400">{t("home.ai_desc")}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => startAIGame('w')} 
                className="flex-1 py-3 bg-slate-200 hover:bg-white text-slate-900 rounded-lg font-bold transition-colors shadow-sm"
              >
                {t("home.btn_white")}
              </button>
              <button 
                onClick={() => startAIGame('b')} 
                className="flex-1 py-3 bg-slate-950 hover:bg-black text-white rounded-lg font-bold transition-colors border border-slate-700 hover:border-cyan-500/50 shadow-sm"
              >
                {t("home.btn_black")}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}