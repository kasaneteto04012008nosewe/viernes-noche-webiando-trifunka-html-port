import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, Play, RefreshCw, Trophy, Volume2 } from 'lucide-react';
import { Language } from '../types';
import { playConfirmSound, playScrollSound } from '../utils/sound';

interface FreeplayProps {
  onBackToMenu: () => void;
  language: Language;
}

interface Note {
  id: number;
  dir: 0 | 1 | 2 | 3; // 0: Left, 1: Down, 2: Up, 3: Right
  y: number; // percentage from top
  hit: boolean;
}

export const Freeplay: React.FC<FreeplayProps> = ({ onBackToMenu, language }) => {
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [isPlayingMiniGame, setIsPlayingMiniGame] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastRating, setLastRating] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);

  const songs = [
    { name: 'Webiando', bpm: 102, opponent: 'Boyfriend', difficulty: 'HARD', color: 'from-blue-600 to-indigo-700', icon: '🎤' },
    { name: 'Sabor Latino', bpm: 120, opponent: 'Daddy Dearest', difficulty: 'NORMAL', color: 'from-purple-600 to-pink-700', icon: '💃' },
    { name: 'Pedro Dance', bpm: 128, opponent: 'Solayer Pedro', difficulty: 'WEBIANDO', color: 'from-yellow-500 to-amber-700', icon: '😎' },
    { name: 'Empanada Funk', bpm: 115, opponent: 'Pico', difficulty: 'HARD', color: 'from-green-600 to-teal-700', icon: '🥟' },
    { name: 'Terremoto', bpm: 140, opponent: 'Whitty', difficulty: 'WEBIANDO', color: 'from-red-600 to-rose-800', icon: '⚡' },
  ];

  const currentSong = songs[selectedSongIdx];

  // Start rhythm mini-game
  const startSong = () => {
    playConfirmSound();
    setIsPlayingMiniGame(true);
    setScore(0);
    setCombo(0);
    setLastRating('');
    setNotes([]);
  };

  // Generate scrolling notes when in mini-game
  useEffect(() => {
    if (!isPlayingMiniGame) return;

    const interval = setInterval(() => {
      const randomDir = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
      setNotes((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), dir: randomDir, y: 100, hit: false },
      ]);
    }, 600);

    const updateInterval = setInterval(() => {
      setNotes((prev) =>
        prev
          .map((n) => ({ ...n, y: n.y - 3 }))
          .filter((n) => n.y > -10)
      );
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(updateInterval);
    };
  }, [isPlayingMiniGame]);

  // Handle arrow key inputs in mini-game
  useEffect(() => {
    if (!isPlayingMiniGame) return;

    const keyMap: Record<string, 0 | 1 | 2 | 3> = {
      ArrowLeft: 0,
      a: 0,
      A: 0,
      ArrowDown: 1,
      s: 1,
      S: 1,
      ArrowUp: 2,
      w: 2,
      W: 2,
      ArrowRight: 3,
      d: 3,
      D: 3,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keyMap) {
        e.preventDefault();
        const dir = keyMap[e.key];

        // Find nearest note in target zone (y between 10 and 35)
        const targetNote = notes.find((n) => !n.hit && n.dir === dir && n.y >= 5 && n.y <= 35);
        if (targetNote) {
          playScrollSound();
          targetNote.hit = true;
          const diff = Math.abs(targetNote.y - 20);
          let rating = 'GOOD!';
          let pts = 250;

          if (diff < 5) {
            rating = '¡SICK!';
            pts = 500;
          } else if (diff < 10) {
            rating = '¡PERFECT!';
            pts = 350;
          }

          setLastRating(rating);
          setScore((s) => s + pts);
          setCombo((c) => c + 1);
        } else {
          setCombo(0);
          setLastRating('MISS!');
        }
      } else if (e.key === 'Escape') {
        setIsPlayingMiniGame(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingMiniGame, notes]);

  const arrowColors = ['text-purple-400', 'text-cyan-400', 'text-emerald-400', 'text-red-400'];
  const arrowIcons = ['←', '↓', '↑', '→'];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between">
      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b-4 border-black">
        <button
          onClick={() => {
            if (isPlayingMiniGame) {
              setIsPlayingMiniGame(false);
            } else {
              playScrollSound();
              onBackToMenu();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl font-fnf text-lg border-2 border-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{isPlayingMiniGame ? (language === 'ESP' ? 'SALIR DE LA CANCIÓN' : 'EXIT SONG') : (language === 'ESP' ? 'VOLVER' : 'BACK')}</span>
        </button>

        <div className="font-fnf text-2xl md:text-3xl text-pink-400 fnf-text-shadow">
          {isPlayingMiniGame ? currentSong.name : (language === 'ESP' ? 'MODO LIBRE (FREEPLAY)' : 'FREEPLAY')}
        </div>

        <div className="flex items-center gap-2 font-fnf text-sm text-yellow-300">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>SCORE: {score}</span>
        </div>
      </header>

      {/* BODY */}
      {!isPlayingMiniGame ? (
        /* SONG SELECTION VIEW */
        <main className="relative z-20 flex-1 flex flex-col md:flex-row items-center justify-center px-6 gap-8 max-w-6xl mx-auto w-full my-auto">
          {/* SONG LIST */}
          <div className="flex-1 w-full space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {songs.map((song, idx) => {
              const isSelected = idx === selectedSongIdx;
              return (
                <div
                  key={song.name}
                  onClick={() => {
                    playScrollSound();
                    setSelectedSongIdx(idx);
                  }}
                  className={`p-4 rounded-2xl border-4 cursor-pointer transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${song.color} border-yellow-300 scale-105 shadow-xl`
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{song.icon}</span>
                      <div>
                        <div className="font-fnf text-2xl text-white fnf-text-shadow">
                          {song.name}
                        </div>
                        <div className="text-xs text-slate-300">
                          {song.opponent} · {song.bpm} BPM
                        </div>
                      </div>
                    </div>

                    <div className="font-fnf text-xs bg-black/50 text-yellow-300 px-3 py-1 rounded-lg border border-yellow-400/50">
                      {song.difficulty}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PLAY SONG DETAILS CARD */}
          <div className="w-full md:w-80 bg-slate-900/90 border-4 border-pink-500 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
            <div className="text-6xl my-2 animate-pulse">{currentSong.icon}</div>
            <div className="font-fnf text-3xl text-yellow-300 fnf-text-shadow">
              {currentSong.name}
            </div>

            <div className="text-sm text-slate-300 space-y-1 bg-black/40 p-3 rounded-xl border border-white/10">
              <div>BPM: <span className="font-bold text-yellow-400">{currentSong.bpm}</span></div>
              <div>Oponente: <span className="font-bold text-pink-400">{currentSong.opponent}</span></div>
            </div>

            <button
              onClick={startSong}
              className="w-full py-4 bg-pink-500 hover:bg-pink-400 text-white font-fnf text-2xl rounded-2xl border-4 border-black shadow-[0_8px_0_#000] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-7 h-7 fill-white" />
              <span>¡JUGAR!</span>
            </button>
          </div>
        </main>
      ) : (
        /* PLAYABLE RHYTHM MINI-GAME VIEW */
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 w-full my-auto">
          <div className="relative w-full max-w-lg h-[450px] bg-slate-900/90 border-4 border-pink-500 rounded-3xl p-4 overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* TARGET RECEIVER ZONE (TOP) */}
            <div className="absolute top-12 inset-x-8 flex justify-between z-10 border-b-2 border-white/20 pb-2">
              {[0, 1, 2, 3].map((dir) => (
                <div
                  key={dir}
                  className={`w-14 h-14 rounded-2xl border-4 border-white/80 bg-black/60 flex items-center justify-center font-fnf text-3xl ${arrowColors[dir]}`}
                >
                  {arrowIcons[dir]}
                </div>
              ))}
            </div>

            {/* SCROLLING NOTES */}
            <div className="absolute inset-x-8 top-12 bottom-4 overflow-hidden pointer-events-none">
              {notes.map((note) => {
                if (note.hit) return null;
                const leftPositions = ['0%', '30%', '60%', '90%'];
                return (
                  <div
                    key={note.id}
                    style={{
                      top: `${note.y}%`,
                      left: leftPositions[note.dir],
                    }}
                    className={`absolute w-14 h-14 rounded-2xl border-4 border-black bg-gradient-to-br from-white to-slate-200 flex items-center justify-center font-fnf text-3xl shadow-lg transition-transform ${arrowColors[note.dir]}`}
                  >
                    {arrowIcons[note.dir]}
                  </div>
                );
              })}
            </div>

            {/* RATING & COMBO POPUP */}
            <div className="absolute bottom-8 inset-x-0 flex flex-col items-center pointer-events-none">
              {lastRating && (
                <div className="font-fnf text-4xl text-yellow-300 fnf-text-shadow animate-bounce">
                  {lastRating}
                </div>
              )}
              {combo > 1 && (
                <div className="font-fnf text-xl text-pink-400">
                  {combo} COMBO!
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400 font-bold tracking-wider">
            USA LAS TECLAS [← ↓ ↑ →] O [W A S D] PARA TOCAR LAS NOTAS AL RITMO
          </div>
        </main>
      )}
    </div>
  );
};
