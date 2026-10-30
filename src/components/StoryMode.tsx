import React, { useState } from 'react';
import { ArrowLeft, Play, Zap, Flame, ShieldAlert, Award } from 'lucide-react';
import { Language } from '../types';
import { playConfirmSound, playScrollSound } from '../utils/sound';

interface StoryModeProps {
  onBackToMenu: () => void;
  language: Language;
}

export const StoryMode: React.FC<StoryModeProps> = ({ onBackToMenu, language }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD' | 'WEBIANDO'>('NORMAL');

  const weeks = [
    {
      id: 1,
      titleEsp: 'SEMANA 1: VIERNES NOCHE',
      titleEng: 'WEEK 1: FRIDAY NIGHT',
      opponent: 'Boyfriend vs Daddy Dearest',
      tracks: ['Webiando', 'Sabor Latino', 'Ritmo Urbano'],
      bgColor: 'bg-indigo-900',
      bannerImg: '/assets/aistudio/1_91a677a3.png',
    },
    {
      id: 2,
      titleEsp: 'SEMANA 2: CHILE FESTIVAL',
      titleEng: 'WEEK 2: CHILE FESTIVAL',
      opponent: 'Boyfriend vs Pico & Friends',
      tracks: ['Empanada Funk', 'Terremoto', 'Fonda Jam'],
      bgColor: 'bg-red-900',
      bannerImg: '/assets/aistudio/3_219dd18a.png',
    },
    {
      id: 3,
      titleEsp: 'SEMANA 3: SOLAYER ZUMBAO',
      titleEng: 'WEEK 3: SOLAYER ZUMBAO',
      opponent: 'Boyfriend vs Pedro Pascal',
      tracks: ['Pedro Dance', 'Messenger Vibe', 'ZUMBAO Supreme'],
      bgColor: 'bg-purple-900',
      bannerImg: '/assets/aistudio/10_8a0a1af6.png',
    },
  ];

  const currentWeek = weeks[selectedWeek];

  return (
    <div className={`relative w-full h-screen overflow-hidden ${currentWeek.bgColor} text-white select-none flex flex-col justify-between transition-colors duration-500`}>
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

        <div className="font-fnf text-2xl md:text-3xl text-yellow-300 fnf-text-shadow">
          {language === 'ESP' ? 'MODO HISTORIA' : 'STORY MODE'}
        </div>

        <div className="font-fnf text-sm bg-yellow-400 text-black px-3 py-1 rounded-lg border-2 border-black">
          WEEK {currentWeek.id}
        </div>
      </header>

      {/* WEEK SELECTOR CAROUSEL */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-6xl mx-auto w-full">
        {/* WEEK BANNER CARD */}
        <div className="w-full bg-slate-900/90 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-6 my-auto">
          {/* LEFT: WEEK INFO */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-fnf text-3xl md:text-4xl text-yellow-300 fnf-text-shadow">
                {language === 'ESP' ? currentWeek.titleEsp : currentWeek.titleEng}
              </span>
            </div>

            <p className="text-lg text-slate-300 font-bold">
              {currentWeek.opponent}
            </p>

            {/* TRACKLIST */}
            <div className="bg-black/60 p-4 rounded-2xl border-2 border-slate-700">
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-2">
                {language === 'ESP' ? 'CANCIONES DE LA SEMANA:' : 'WEEK TRACKLIST:'}
              </div>
              <ul className="space-y-1">
                {currentWeek.tracks.map((track, idx) => (
                  <li key={track} className="flex items-center gap-2 font-fnf text-xl text-yellow-200">
                    <span className="text-yellow-400">{idx + 1}.</span> {track}
                  </li>
                ))}
              </ul>
            </div>

            {/* DIFFICULTY SELECTOR */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                {language === 'ESP' ? 'SELECCIONA DIFICULTAD:' : 'SELECT DIFFICULTY:'}
              </div>

              <div className="flex flex-wrap gap-2">
                {(['EASY', 'NORMAL', 'HARD', 'WEBIANDO'] as const).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        playScrollSound();
                        setSelectedDifficulty(diff);
                      }}
                      className={`px-4 py-2 rounded-xl font-fnf text-sm md:text-base border-2 transition-all ${
                        isSelected
                          ? 'bg-yellow-400 text-black border-black scale-105 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: CHARACTER ILLUSTRATION & START BUTTON */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-48 h-48 md:w-64 md:h-64 bg-black/40 rounded-2xl p-4 border-2 border-white/20 flex items-center justify-center overflow-hidden">
              <img
                src={currentWeek.bannerImg}
                alt="Character Banner"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* PLAY WEEK BUTTON */}
            <button
              onClick={() => {
                playConfirmSound();
                alert(`¡Empezando ${currentWeek.titleEsp} en dificultad ${selectedDifficulty}!`);
              }}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-fnf text-2xl rounded-2xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-8 h-8 fill-black" />
              <span>{language === 'ESP' ? '¡JUGAR SEMANA!' : 'PLAY WEEK!'}</span>
            </button>
          </div>
        </div>

        {/* CAROUSEL SWITCHER BUTTONS */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => {
              playScrollSound();
              setSelectedWeek((prev) => (prev > 0 ? prev - 1 : weeks.length - 1));
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fnf text-xl rounded-xl border-2 border-white/20"
          >
            ← {language === 'ESP' ? 'ANTERIOR' : 'PREVIOUS'}
          </button>
          <span className="font-fnf text-lg text-yellow-300">
            {selectedWeek + 1} / {weeks.length}
          </span>
          <button
            onClick={() => {
              playScrollSound();
              setSelectedWeek((prev) => (prev < weeks.length - 1 ? prev + 1 : 0));
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-fnf text-xl rounded-xl border-2 border-white/20"
          >
            {language === 'ESP' ? 'SIGUIENTE' : 'NEXT'} →
          </button>
        </div>
      </main>
    </div>
  );
};
