import React from 'react';
import { ArrowLeft, Globe, Volume2, VolumeX, Zap, Sparkles } from 'lucide-react';
import { GameSettings, Language } from '../types';
import { playConfirmSound, playScrollSound, setSoundMuted, setSoundVolume } from '../utils/sound';

interface OptionsProps {
  onBackToMenu: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const Options: React.FC<OptionsProps> = ({
  onBackToMenu,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white select-none flex flex-col justify-between">
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
          <span>{settings.language === 'ESP' ? 'VOLVER AL MENÚ' : 'BACK TO MENU'}</span>
        </button>

        <div className="font-fnf text-2xl md:text-3xl text-cyan-400 fnf-text-shadow">
          {settings.language === 'ESP' ? 'OPCIONES Y AJUSTES' : 'SETTINGS & OPTIONS'}
        </div>

        <div className="text-xs font-bold text-slate-400">
          PREFERENCIAS
        </div>
      </header>

      {/* OPTIONS LIST */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-6 max-w-2xl mx-auto w-full my-auto space-y-4">
        {/* LANGUAGE SETTING */}
        <div className="w-full bg-slate-800/90 border-4 border-black rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-7 h-7 text-cyan-400" />
            <div>
              <div className="font-fnf text-2xl text-white">IDIOMA (LANGUAGE)</div>
              <div className="text-xs text-slate-400">Español / English</div>
            </div>
          </div>

          <button
            onClick={() => {
              playScrollSound();
              onUpdateSettings({ language: settings.language === 'ESP' ? 'ENG' : 'ESP' });
            }}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-fnf text-xl rounded-xl border-2 border-black"
          >
            {settings.language}
          </button>
        </div>

        {/* VOLUME SETTING */}
        <div className="w-full bg-slate-800/90 border-4 border-black rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-7 h-7 text-yellow-400" />
            <div>
              <div className="font-fnf text-2xl text-white">VOLUMEN (VOLUME)</div>
              <div className="text-xs text-slate-400">Nivel de audio principal</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setSoundVolume(vol);
                onUpdateSettings({ volume: vol });
              }}
              className="w-32 accent-yellow-400 cursor-pointer"
            />
            <span className="font-fnf text-lg text-yellow-300 w-12 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
        </div>

        {/* FLASHING LIGHTS TOGGLE */}
        <div className="w-full bg-slate-800/90 border-4 border-black rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            <div>
              <div className="font-fnf text-2xl text-white">LUCES PARPADEANTES</div>
              <div className="text-xs text-slate-400">Efectos de destello en pantalla</div>
            </div>
          </div>

          <button
            onClick={() => {
              playScrollSound();
              onUpdateSettings({ flashingLights: !settings.flashingLights });
            }}
            className={`px-6 py-2 font-fnf text-xl rounded-xl border-2 border-black ${
              settings.flashingLights
                ? 'bg-emerald-500 text-black'
                : 'bg-red-500 text-white'
            }`}
          >
            {settings.flashingLights ? 'ACTIVADO' : 'DESACTIVADO'}
          </button>
        </div>

        {/* EASTER EGG STATUS */}
        <div className="w-full bg-slate-800/90 border-4 border-black rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <div>
              <div className="font-fnf text-2xl text-white">EASTER EGG SOLAYER</div>
              <div className="text-xs text-slate-400">Especial 15 Clics Logo</div>
            </div>
          </div>

          <span
            className={`px-4 py-1.5 font-fnf text-sm rounded-lg border border-white/20 ${
              settings.easterEggUnlocked
                ? 'bg-purple-600 text-yellow-300'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {settings.easterEggUnlocked ? '¡DESBLOQUEADO!' : 'OCULTO (15 CLICS)'}
          </span>
        </div>
      </main>
    </div>
  );
};
