import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Disc, Settings, Music2, Award, HelpCircle } from 'lucide-react';
import { GameState, Language } from '../types';
import { playConfirmSound, playScrollSound, subscribeBeat } from '../utils/sound';

interface MainMenuProps {
  onSelectOption: (state: GameState) => void;
  onBackToTitle: () => void;
  language: Language;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectOption,
  onBackToTitle,
  language,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [beatPulse, setBeatPulse] = useState(false);

  const menuItems: { id: GameState; labelEsp: string; labelEng: string; icon: React.ReactNode; color: string }[] = [
    { id: 'STORY_MODE', labelEsp: 'STORY MODE (MODO HISTORIA)', labelEng: 'STORY MODE', icon: <Play className="w-8 h-8" />, color: 'from-amber-500 to-yellow-400' },
    { id: 'FREEPLAY', labelEsp: 'FREEPLAY (MODO LIBRE)', labelEng: 'FREEPLAY', icon: <Disc className="w-8 h-8" />, color: 'from-pink-500 to-rose-400' },
    { id: 'OPTIONS', labelEsp: 'OPCIONES (AJUSTES)', labelEng: 'OPTIONS', icon: <Settings className="w-8 h-8" />, color: 'from-cyan-500 to-blue-400' },
    { id: 'SOUND_TEST', labelEsp: 'SOUND TEST (PRUEBA DE SONIDO)', labelEng: 'SOUND TEST', icon: <Music2 className="w-8 h-8" />, color: 'from-purple-500 to-indigo-400' },
    { id: 'CREDITS', labelEsp: 'CRÉDITOS Y MÁS', labelEng: 'CREDITS & MORE', icon: <Award className="w-8 h-8" />, color: 'from-emerald-500 to-teal-400' },
  ];

  // 102 BPM Beat Pulse
  useEffect(() => {
    const unsubscribe = subscribeBeat(() => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 200);
    });
    return unsubscribe;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        playScrollSound();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        playScrollSound();
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playConfirmSound();
        onSelectOption(menuItems[selectedIndex].id);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        playScrollSound();
        onBackToTitle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelectOption, onBackToTitle, menuItems]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-amber-400 select-none flex flex-col justify-between">
      {/* FLASHING YELLOW / PURPLE FNF MENU BACKGROUND */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          beatPulse ? 'bg-amber-300' : 'bg-yellow-500'
        }`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]" />
      </div>

      {/* HEADER BAR */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b-4 border-black text-white">
        <button
          onClick={onBackToTitle}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-fnf text-lg border-2 border-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ESP' ? 'VOLVER AL TÍTULO' : 'BACK TO TITLE'}</span>
        </button>

        <div className="font-fnf text-2xl md:text-3xl text-yellow-300 fnf-text-shadow">
          {language === 'ESP' ? 'MENÚ PRINCIPAL' : 'MAIN MENU'}
        </div>

        {/* NEWGROUNDS LOGO BADGE */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/NG_f034a96b.png"
            alt="Newgrounds Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-md hover:scale-110 transition-transform cursor-pointer"
            onClick={() => window.open('https://www.newgrounds.com', '_blank')}
            title="Visitar Newgrounds"
          />
        </div>
      </header>

      {/* MENU ITEMS LIST (FNF SLANTED STYLE) */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 max-w-4xl mx-auto w-full gap-3 md:gap-4 my-auto">
        {menuItems.map((item, index) => {
          const isSelected = index === selectedIndex;
          const label = language === 'ESP' ? item.labelEsp : item.labelEng;

          return (
            <div
              key={item.id}
              onClick={() => {
                playConfirmSound();
                onSelectOption(item.id);
              }}
              onMouseEnter={() => {
                if (index !== selectedIndex) {
                  playScrollSound();
                  setSelectedIndex(index);
                }
              }}
              className={`w-full max-w-xl cursor-pointer transition-all duration-200 transform ${
                isSelected
                  ? 'scale-110 -rotate-2 z-30 shadow-[0_15px_30px_rgba(0,0,0,0.6)]'
                  : 'scale-95 hover:scale-100 opacity-80 z-10'
              }`}
            >
              <div
                className={`flex items-center justify-between px-6 py-3 md:py-4 rounded-2xl border-4 border-black text-white bg-gradient-to-r ${item.color} ${
                  isSelected ? 'ring-4 ring-white animate-pulse' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/30 rounded-xl border border-white/30">
                    {item.icon}
                  </div>
                  <span className="font-fnf text-2xl md:text-3xl text-white fnf-text-shadow tracking-wide">
                    {label}
                  </span>
                </div>

                {isSelected && (
                  <div className="font-fnf text-xl bg-yellow-300 text-black px-3 py-1 rounded-lg border-2 border-black animate-bounce">
                    ¡ENTER!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* BOTTOM INSTRUCTION BAR */}
      <footer className="relative z-20 px-6 py-3 bg-black/90 border-t-4 border-black text-white text-center font-fnf text-sm md:text-base flex justify-between items-center">
        <div className="flex items-center gap-2 text-yellow-300">
          <HelpCircle className="w-4 h-4" />
          <span>
            {language === 'ESP'
              ? 'Navega con [↑ / ↓] y confirma con [ENTER]. Presiona [ESC] para salir.'
              : 'Navigate with [↑ / ↓] and select with [ENTER]. Press [ESC] to back.'}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          FNF WEBIANDO v1.5
        </div>
      </footer>
    </div>
  );
};
