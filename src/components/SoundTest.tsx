import React, { useState } from 'react';
import { ArrowLeft, Music, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { playConfirmSound, playMsnSound, playScrollSound } from '../utils/sound';
import { MsnPopup } from './MsnPopup';
import { BowAnimation } from './BowAnimation';

interface SoundTestProps {
  onBackToMenu: () => void;
  language: Language;
}

export const SoundTest: React.FC<SoundTestProps> = ({ onBackToMenu, language }) => {
  const [pcmValue, setPcmValue] = useState(0);
  const [daValue, setDaValue] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');

  const testSecretCode = () => {
    playConfirmSound();
    if (pcmValue === 15 || daValue === 15) {
      setSecretUnlocked(true);
      setSecretMessage('¡CÓDIGO SECRETO SOLAYER 15 ZUMBAO!');
      playMsnSound();
    } else if (pcmValue === 666 || daValue === 666) {
      setSecretMessage('¡MODO SPOOKY ACTIVADO!');
    } else if (pcmValue === 69 || daValue === 69) {
      setSecretMessage('¡MODO FUNNY UNLOCKED!');
    } else {
      setSecretMessage(`REPRODUCIENDO SONIDO [PCM: ${pcmValue} | DA: ${daValue}]`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-purple-950 text-white select-none flex flex-col justify-between">
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

        <div className="font-fnf text-2xl md:text-3xl text-purple-300 fnf-text-shadow">
          SOUND TEST (PRUEBA DE SONIDO)
        </div>

        <div className="font-pixel text-xs text-yellow-300">
          SEGA / FNF MENU
        </div>
      </header>

      {/* SOUND TEST CONTROLS */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6 max-w-xl mx-auto w-full my-auto space-y-6 text-center">
        <div className="bg-slate-900/90 border-4 border-purple-500 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <div className="font-pixel text-xl text-yellow-300 animate-pulse">
            INPUT SOUND CODE
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* PCM NUMBER */}
            <div className="bg-black/60 p-4 rounded-2xl border-2 border-purple-400">
              <div className="font-fnf text-xl text-purple-300 mb-2">PCM NO.</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    playScrollSound();
                    setPcmValue((v) => Math.max(0, v - 1));
                  }}
                  className="w-10 h-10 bg-purple-700 hover:bg-purple-600 rounded-lg font-fnf text-xl"
                >
                  -
                </button>
                <span className="font-pixel text-2xl text-yellow-400 w-12">{pcmValue}</span>
                <button
                  onClick={() => {
                    playScrollSound();
                    setPcmValue((v) => v + 1);
                  }}
                  className="w-10 h-10 bg-purple-700 hover:bg-purple-600 rounded-lg font-fnf text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* DA NUMBER */}
            <div className="bg-black/60 p-4 rounded-2xl border-2 border-purple-400">
              <div className="font-fnf text-xl text-purple-300 mb-2">DA NO.</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    playScrollSound();
                    setDaValue((v) => Math.max(0, v - 1));
                  }}
                  className="w-10 h-10 bg-purple-700 hover:bg-purple-600 rounded-lg font-fnf text-xl"
                >
                  -
                </button>
                <span className="font-pixel text-2xl text-yellow-400 w-12">{daValue}</span>
                <button
                  onClick={() => {
                    playScrollSound();
                    setDaValue((v) => v + 1);
                  }}
                  className="w-10 h-10 bg-purple-700 hover:bg-purple-600 rounded-lg font-fnf text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={testSecretCode}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-fnf text-2xl rounded-2xl border-4 border-black shadow-[0_6px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Music className="w-6 h-6" />
            <span>{language === 'ESP' ? 'PROBAR SONIDO' : 'TEST SOUND'}</span>
          </button>

          {secretMessage && (
            <div className="p-3 bg-purple-950/80 border border-purple-400 rounded-xl font-fnf text-lg text-yellow-300 animate-bounce">
              {secretMessage}
            </div>
          )}
        </div>
      </main>

      {secretUnlocked && (
        <>
          <MsnPopup onClose={() => setSecretUnlocked(false)} />
          <div className="fixed bottom-4 left-4 z-50">
            <BowAnimation className="w-48 h-auto" />
          </div>
        </>
      )}
    </div>
  );
};
