import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { startBGM, stopBGM, setSoundMuted, setSoundVolume } from './utils/sound';
import { TitleScreen } from './components/TitleScreen';
import { PlayState } from './components/PlayState';

export default function App() {
  const [screen, setScreen] = useState<'title' | 'tutorial'>('title');
  const [language, setLanguage] = useState<Language>('ESP');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // Start freakyMenu.ogg BGM audio on first user click or key press on title screen
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (screen === 'title') {
        startBGM();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [screen]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setSoundVolume(newVol);
  };

  const handleStartTutorial = () => {
    stopBGM();
    setScreen('tutorial');
  };

  const handleReturnToMenu = () => {
    setScreen('title');
    startBGM();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {screen === 'title' ? (
        <TitleScreen
          language={language}
          onLanguageChange={(lang) => setLanguage(lang)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onStartTutorial={handleStartTutorial}
        />
      ) : (
        <PlayState
          onReturnToMenu={handleReturnToMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          volume={volume}
        />
      )}
    </div>
  );
}
