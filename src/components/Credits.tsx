import React from 'react';
import { ArrowLeft, ExternalLink, Heart, Sparkles, Star } from 'lucide-react';
import { Language } from '../types';
import { playScrollSound } from '../utils/sound';

interface CreditsProps {
  onBackToMenu: () => void;
  language: Language;
}

export const Credits: React.FC<CreditsProps> = ({ onBackToMenu, language }) => {
  const creditsList = [
    { title: 'DIRECTOR & DIRECCIÓN DE ARTE', name: 'Solayer & Team Webiando', desc: 'Creadores de Viernes Noche Webiando y Easter Eggs' },
    { title: 'SPRITES Y ARTE GRÁFICO', name: 'FNF Community Artists', desc: 'Spritesheets, Banners, Banderas y Siluetas' },
    { title: 'MÚSICA & RITMO', name: 'Kawai Sprite & Webiando Audio', desc: 'BPM 102 Funkin Beats y Efectos de Sonido' },
    { title: 'PROGRAMACIÓN & MOTOR', name: 'React + Vite AI Studio Engine', desc: 'Desarrollo Frontend y Animaciones Canvas Sprite' },
    { title: 'COLABORACIÓN ESPECIAL', name: 'Pedro Pascal (ZUMBAO)', desc: 'Easter Egg Messenger 15 Clics Logo' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between">
      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b-4 border-black">
        <button
          onClick={() => {
            playScrollSound();
            onBackToMenu();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-fnf text-lg border-2 border-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ESP' ? 'VOLVER AL MENÚ' : 'BACK TO MENU'}</span>
        </button>

        <div className="font-fnf text-2xl md:text-3xl text-emerald-400 fnf-text-shadow">
          {language === 'ESP' ? 'CRÉDITOS Y AGRADECIMIENTOS' : 'CREDITS & THANKS'}
        </div>

        <img
          src="/assets/aistudio/NG_f034a96b.png"
          alt="Newgrounds Badge"
          className="w-10 h-10 object-contain hover:scale-110 transition-transform cursor-pointer"
          onClick={() => window.open('https://www.newgrounds.com', '_blank')}
        />
      </header>

      {/* CREDITS LIST */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full my-auto space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="text-center mb-2">
          <img
            src="/assets/aistudio/Logo_3ead0a99.png"
            alt="Logo"
            className="w-64 h-auto mx-auto object-contain filter drop-shadow-lg"
          />
        </div>

        {creditsList.map((cred, idx) => (
          <div
            key={idx}
            className="w-full bg-slate-900/90 border-2 border-emerald-500/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left hover:border-emerald-400 transition-colors shadow-lg"
          >
            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{cred.title}</div>
              <div className="font-fnf text-2xl text-yellow-300 fnf-text-shadow">{cred.name}</div>
              <div className="text-xs text-slate-400">{cred.desc}</div>
            </div>

            <Star className="w-6 h-6 text-yellow-400 shrink-0 hidden md:block" />
          </div>
        ))}
      </main>

      <footer className="relative z-20 px-6 py-3 bg-black/90 border-t-2 border-slate-800 text-center text-xs text-slate-400">
        GRACIAS POR JUGAR VIERNES NOCHE WEBIANDO · NEWGROUNDS FNF EDITION
      </footer>
    </div>
  );
};
