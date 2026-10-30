import React, { useState, useEffect, useRef } from 'react';
import { FNFSprite } from './FNFSprite';
import { HealthIcon } from './HealthIcon';
import { StrumNote } from './StrumNote';
import { ComboDisplay } from './ComboDisplay';
import { loadSongChart, loadLyrics, ChartNote, LyricSubtitle } from '../utils/chartParser';
import {
  initSongAudio,
  playSongAudio,
  pauseSongAudio,
  stopSongAudio,
  getCurrentSongTimeMs,
  setSongAudioMuted,
  setSongAudioVolume,
  isSongFinished,
} from '../utils/songAudio';
import { playCountdownSound, playMissSound } from '../utils/gameAudio';
import { Pause, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PlayStateProps {
  onReturnToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
}

const ARROW_KEYS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'];
const DFJK_KEYS = ['d', 'f', 'j', 'k'];
const DIR_NAMES = ['LEFT', 'DOWN', 'UP', 'RIGHT'];

export const PlayState: React.FC<PlayStateProps> = ({
  onReturnToMenu,
  isMuted,
  onToggleMute,
  volume,
}) => {
  const [songTime, setSongTime] = useState(0); // in ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [health, setHealth] = useState(50); // 0 to 100
  const [hitsCount, setHitsCount] = useState(0);

  // Song metadata
  const [songSpeed, setSongSpeed] = useState(1.5);
  const [chartNotes, setChartNotes] = useState<ChartNote[]>([]);
  const [lyrics, setLyrics] = useState<LyricSubtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');

  // Countdown state: 3, 2, 1, 0 (GO), -1 (Playing)
  const [countdown, setCountdown] = useState<number>(3);

  // Poses
  const [bfAnim, setBfAnim] = useState<string>('idle');
  const [oppAnim, setOppAnim] = useState<string>('Both_idles');
  const [gfAnim, setGfAnim] = useState<string>('danceLeft');

  // Key press states for strums
  const [pressedStrums, setPressedStrums] = useState<boolean[]>([false, false, false, false]);
  const [oppPressedStrums, setOppPressedStrums] = useState<boolean[]>([false, false, false, false]);

  // Judgement rating combo popups
  const [lastJudgement, setLastJudgement] = useState<{
    image: string;
    combo: number;
    id: number;
  } | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  // Initialize song chart, lyrics & dual audio
  useEffect(() => {
    initSongAudio();

    loadSongChart().then((chartData) => {
      setSongSpeed(chartData.speed);
      setChartNotes(chartData.notes);
    });

    loadLyrics().then((lyricData) => {
      setLyrics(lyricData);
    });

    return () => {
      stopSongAudio();
    };
  }, []);

  // Update volume / mute settings
  useEffect(() => {
    setSongAudioMuted(isMuted);
    setSongAudioVolume(volume);
  }, [isMuted, volume]);

  // Countdown sequence
  useEffect(() => {
    if (countdown > -1) {
      playCountdownSound(3 - countdown, isMuted ? 0 : volume);
      const timer = setTimeout(() => {
        if (countdown === 0) {
          setCountdown(-1);
          setIsPlaying(true);
          playSongAudio();
        } else {
          setCountdown(countdown - 1);
        }
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [countdown, isMuted, volume]);

  // Main game loop (Syncs audio currentTime to songTime & notes)
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;

    const updateLoop = () => {
      const curMs = getCurrentSongTimeMs();
      setSongTime(curMs);

      // Check lyrics / subtitles
      if (lyrics.length > 0) {
        const activeSub = lyrics.slice().reverse().find((l) => curMs >= l.time);
        if (activeSub && activeSub.text) {
          setCurrentSubtitle(activeSub.text);
        } else {
          setCurrentSubtitle('');
        }
      }

      // Check for song finish
      if (isSongFinished()) {
        setIsPlaying(false);
      }

      // Process notes: Opponent hits & Player misses
      setChartNotes((prevNotes) => {
        return prevNotes.map((note) => {
          if (note.hit || note.missed) return note;

          // Opponent Note Hit
          if (!note.isPlayer && curMs >= note.time) {
            const poseName = `sing${DIR_NAMES[note.dir]}`;
            setOppAnim('Both_idles');
            setGfAnim(poseName); // GF is the opponent singing!

            setOppPressedStrums((prev) => {
              const next = [...prev];
              next[note.dir] = true;
              return next;
            });

            setTimeout(() => {
              setOppPressedStrums((prev) => {
                const next = [...prev];
                next[note.dir] = false;
                return next;
              });
              setGfAnim('danceLeft');
            }, 300);

            return { ...note, hit: true };
          }

          // Player Note Missed (passed strumline by >150ms)
          if (note.isPlayer && curMs - note.time > 150) {
            const missPose = `msing${DIR_NAMES[note.dir]}`;
            setBfAnim(missPose);
            if (!isMuted) playMissSound(volume * 0.6);

            setMisses((m) => m + 1);
            setCombo(0);
            setHealth((h) => {
              const nextH = Math.max(0, h - 8);
              if (nextH <= 0) setIsGameOver(true);
              return nextH;
            });

            setLastJudgement({
              image: '/assets/aistudio/shit_9da27129.png',
              combo: 0,
              id: Date.now(),
            });

            setTimeout(() => setBfAnim('idle'), 400);
            return { ...note, missed: true };
          }

          return note;
        });
      });

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isPaused, isGameOver, lyrics, isMuted, volume]);

  // Key input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) {
        if (e.key.toLowerCase() === 'r') restartGame();
        if (e.key === 'Escape') onReturnToMenu();
        return;
      }

      if (e.key === 'Escape') {
        setIsPaused((p) => {
          if (!p) pauseSongAudio();
          else playSongAudio();
          return !p;
        });
        return;
      }

      if (isPaused || !isPlaying) return;

      const key = e.key.toLowerCase();
      let dirIdx = -1;

      if (ARROW_KEYS.includes(e.key)) {
        dirIdx = ARROW_KEYS.indexOf(e.key);
      } else if (DFJK_KEYS.includes(key)) {
        dirIdx = DFJK_KEYS.indexOf(key);
      }

      if (dirIdx !== -1) {
        e.preventDefault();

        // Light up strum
        setPressedStrums((prev) => {
          const next = [...prev];
          next[dirIdx] = true;
          return next;
        });

        // Find closest target note
        const dir = dirIdx as 0 | 1 | 2 | 3;
        let bestNoteIdx = -1;
        let minDiff = Infinity;

        chartNotes.forEach((note, idx) => {
          if (note.isPlayer && !note.hit && !note.missed && note.dir === dir) {
            const diff = Math.abs(songTime - note.time);
            if (diff < 160 && diff < minDiff) {
              minDiff = diff;
              bestNoteIdx = idx;
            }
          }
        });

        if (bestNoteIdx !== -1) {
          // HIT!
          const note = chartNotes[bestNoteIdx];
          const diff = Math.abs(songTime - note.time);

          setChartNotes((prev) => {
            const copy = [...prev];
            copy[bestNoteIdx] = { ...copy[bestNoteIdx], hit: true };
            return copy;
          });

          // Play BF sing animation
          const poseName = `sing${DIR_NAMES[dir]}`;
          setBfAnim(poseName);

          let pts = 350;
          let ratingImg = '/assets/aistudio/sick_d371083e.png';

          if (diff < 45) {
            pts = 350;
            ratingImg = '/assets/aistudio/sick_d371083e.png';
          } else if (diff < 85) {
            pts = 200;
            ratingImg = '/assets/aistudio/good_39b411e8.png';
          } else {
            pts = 100;
            ratingImg = '/assets/aistudio/bad_e91af17b.png';
          }

          setScore((s) => s + pts);
          setCombo((c) => c + 1);
          setHitsCount((h) => h + 1);
          setHealth((h) => Math.min(100, h + 4));

          setLastJudgement({
            image: ratingImg,
            combo: combo + 1,
            id: Date.now(),
          });

          setTimeout(() => setBfAnim('idle'), 350);
        } else {
          // Ghost miss
          if (!isMuted) playMissSound(volume * 0.4);
          const missPose = `msing${DIR_NAMES[dir]}`;
          setBfAnim(missPose);
          setHealth((h) => {
            const nextH = Math.max(0, h - 3);
            if (nextH <= 0) setIsGameOver(true);
            return nextH;
          });
          setTimeout(() => setBfAnim('idle'), 300);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      let dirIdx = -1;

      if (ARROW_KEYS.includes(e.key)) {
        dirIdx = ARROW_KEYS.indexOf(e.key);
      } else if (DFJK_KEYS.includes(key)) {
        dirIdx = DFJK_KEYS.indexOf(key);
      }

      if (dirIdx !== -1) {
        setPressedStrums((prev) => {
          const next = [...prev];
          next[dirIdx] = false;
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused, isGameOver, songTime, chartNotes, combo, isMuted, volume]);

  const restartGame = () => {
    stopSongAudio();
    setScore(0);
    setCombo(0);
    setMisses(0);
    setHealth(50);
    setHitsCount(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(false);
    setCountdown(3);
    setBfAnim('idle');
    setOppAnim('Both_idles');
    setGfAnim('danceLeft');

    loadSongChart().then((chartData) => {
      setChartNotes(chartData.notes);
    });
  };

  const accuracy = hitsCount + misses > 0 ? Math.round((hitsCount / (hitsCount + misses)) * 100) : 100;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. STAGE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/aistudio/bg_e119abc2.png"
          alt="Stage Background"
          className="w-full h-full object-cover scale-105"
        />
      </div>

      {/* 2. CROWD & CAMEO STAGE ELEMENTS */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-between items-end px-10 pointer-events-none">
        {/* Left Cameos */}
        <div className="flex items-end space-x-2 opacity-90">
          <FNFSprite
            xmlUrl="/assets/aistudio/geoxcameo_2ab9cb80.xml"
            pngUrl="/assets/aistudio/geoxcameo_710c1108.png"
            animPrefix="geox"
            scale={0.55}
            fps={12}
          />
          <FNFSprite
            xmlUrl="/assets/aistudio/Mariri_a57c161a.xml"
            pngUrl="/assets/aistudio/Mariri_d92d1d61.png"
            animPrefix="mariri"
            scale={0.55}
            fps={12}
          />
        </div>

        {/* Center Carbon & Crowd Front */}
        <div className="relative flex items-end justify-center">
          <img
            src="/assets/aistudio/carbon_b1be2832.png"
            alt="Carbon"
            className="w-48 object-contain mb-4"
          />
          <FNFSprite
            xmlUrl="/assets/aistudio/genteFront_85406537.xml"
            pngUrl="/assets/aistudio/genteFront_fdda2d24.png"
            animPrefix="gente"
            scale={0.65}
            fps={12}
          />
        </div>

        {/* Right Cameos */}
        <div className="flex items-end space-x-2 opacity-90">
          <FNFSprite
            xmlUrl="/assets/aistudio/MaavoIvette_e6a06c8c.xml"
            pngUrl="/assets/aistudio/MaavoIvette_066ab2e3.png"
            animPrefix="maavo"
            scale={0.55}
            fps={12}
          />
          <FNFSprite
            xmlUrl="/assets/aistudio/mgrchilenita_7b4dfd82.xml"
            pngUrl="/assets/aistudio/mgrchilenita_ba42ecde.png"
            animPrefix="mgr"
            scale={0.55}
            fps={12}
          />
        </div>
      </div>

      {/* 3. CHARACTERS ON STAGE */}
      <div className="absolute inset-0 z-20 flex justify-between items-end px-20 pb-16 pointer-events-none">
        {/* Left: El Pepe */}
        <div className="relative bottom-8 left-8">
          <FNFSprite
            xmlUrl="/assets/aistudio/elpepe_0f8d9653.xml"
            pngUrl="/assets/aistudio/elpepe_b2cbf469.png"
            animPrefix={oppAnim}
            scale={0.8}
            fps={24}
            loop={oppAnim === 'Both_idles'}
          />
        </div>

        {/* Center Speaker: Girlfriend (GF Chilena) - The Opponent Singer! */}
        <div className="relative bottom-20">
          <FNFSprite
            xmlUrl="/assets/aistudio/gf-chilena-baked_63b37456.xml"
            pngUrl="/assets/aistudio/gf-chilena-baked_16c57d17.png"
            animPrefix={gfAnim}
            scale={0.68}
            fps={24}
            loop={gfAnim === 'danceLeft'}
          />
        </div>

        {/* Right: Boyfriend (Huaso BF) */}
        <div className="relative bottom-8 right-8">
          <FNFSprite
            xmlUrl="/assets/aistudio/bf_huaso_nuevo_9788d084.xml"
            pngUrl="/assets/aistudio/bf_huaso_nuevo_3d198331.png"
            animPrefix={bfAnim}
            scale={0.8}
            fps={24}
            loop={bfAnim === 'idle'}
          />
        </div>
      </div>

      {/* 4. GAMEPLAY UI OVERLAY */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Bar: Time Bar & Menu buttons */}
        <div className="flex justify-between items-center w-full max-w-5xl mx-auto pointer-events-auto">
          {/* Time Bar */}
          <div className="relative flex items-center w-80 h-8 bg-black/70 rounded-full border-2 border-yellow-400 overflow-hidden px-1 shadow-lg">
            <img
              src="/assets/aistudio/time-bar_a9bc272d.png"
              alt="Time Bar"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div
              className="h-4 bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 rounded-full transition-all duration-100"
              style={{ width: `${Math.min(100, (songTime / 90000) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow">
              TUTORIAL (WEBIANDO MIX) - 110 BPM
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 text-yellow-300 rounded-full border border-yellow-400/40 shadow-lg transition"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsPaused(true);
                pauseSongAudio();
              }}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-lg text-sm shadow-md transition flex items-center space-x-1"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSA</span>
            </button>
          </div>
        </div>

        {/* Center Strumlines & Falling Notes */}
        <div className="relative flex-1 w-full max-w-5xl mx-auto flex justify-between items-start pt-6">
          {/* Opponent Strumline (GF / Left 4 strums) */}
          <div className="flex space-x-4">
            {[0, 1, 2, 3].map((dir) => (
              <StrumNote
                key={`opp_strum_${dir}`}
                dir={dir as 0 | 1 | 2 | 3}
                type={oppPressedStrums[dir] ? 'strum_confirm' : 'strum_static'}
                scale={0.65}
              />
            ))}
          </div>

          {/* Player Strumline (BF / Right 4 strums) */}
          <div className="flex space-x-4">
            {[0, 1, 2, 3].map((dir) => (
              <StrumNote
                key={`player_strum_${dir}`}
                dir={dir as 0 | 1 | 2 | 3}
                type={pressedStrums[dir] ? 'strum_press' : 'strum_static'}
                scale={0.65}
              />
            ))}
          </div>

          {/* Falling Notes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {chartNotes.map((note) => {
              if (note.hit || note.missed) return null;

              const timeDiff = note.time - songTime;
              if (timeDiff > 1800 || timeDiff < -200) return null;

              const speed = 0.55 * songSpeed;
              const targetY = 24; // Strumline Y position in px
              const currentY = targetY + timeDiff * speed;

              // Column X offsets
              const columnWidth = 80;
              const sideOffset = note.isPlayer ? 585 : 0;
              const xPos = sideOffset + note.dir * columnWidth;

              return (
                <div
                  key={note.id}
                  className="absolute"
                  style={{
                    left: `${xPos}px`,
                    top: `${currentY}px`,
                  }}
                >
                  <StrumNote
                    dir={note.dir}
                    type="note"
                    scale={0.65}
                  />
                </div>
              );
            })}
          </div>

          {/* Judgement Combo Popups */}
          {lastJudgement && (
            <div
              key={lastJudgement.id}
              className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
            >
              <ComboDisplay
                ratingImg={lastJudgement.image}
                combo={lastJudgement.combo}
              />
            </div>
          )}
        </div>

        {/* Karaoke Lyrics Subtitle Banner */}
        {currentSubtitle && (
          <div className="w-full max-w-3xl mx-auto my-2 text-center pointer-events-none">
            <div className="inline-block px-6 py-2 bg-black/80 backdrop-blur-md border-2 border-yellow-400 rounded-2xl shadow-2xl">
              <span className="text-xl md:text-2xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                {currentSubtitle}
              </span>
            </div>
          </div>
        )}

        {/* Countdown overlay banner */}
        {countdown > -1 && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="text-center animate-pulse">
              {countdown === 3 && (
                <img src="/assets/aistudio/3_732d0b66.png" alt="3" className="w-36 h-36 object-contain mx-auto" />
              )}
              {countdown === 2 && (
                <img src="/assets/aistudio/2_8cff099c.png" alt="2" className="w-36 h-36 object-contain mx-auto" />
              )}
              {countdown === 1 && (
                <img src="/assets/aistudio/1_e313b8c3.png" alt="1" className="w-36 h-36 object-contain mx-auto" />
              )}
              {countdown === 0 && (
                <img src="/assets/aistudio/go_89c782db.png" alt="GO!" className="w-48 h-48 object-contain mx-auto" />
              )}
            </div>
          </div>
        )}

        {/* Bottom Health Bar & Icons HUD */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center space-y-2 pointer-events-auto">
          {/* Health Bar Frame */}
          <div className="relative w-full h-10 bg-slate-950 rounded-full border-4 border-yellow-400 overflow-hidden flex items-center shadow-2xl">
            {/* Green / Red inner health split */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 transition-all duration-150"
              style={{ width: `${health}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-700 transition-all duration-150"
              style={{ width: `${100 - health}%` }}
            />

            {/* Health Bar Texture Overlays */}
            <img
              src="/assets/aistudio/health-inside_286a8d75.png"
              alt="Health Inside"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 pointer-events-none"
            />
            <img
              src="/assets/aistudio/health-bar_c6472a95.png"
              alt="Health Frame"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40"
            />
            <img
              src="/assets/aistudio/border-ui_bd890cad.png"
              alt="Border UI"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30"
            />

            {/* Health Icons attached to health percentage slider */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center space-x-[-12px] transition-all duration-150 pointer-events-none"
              style={{ left: `${health}%` }}
            >
              {/* GF Icon (Opponent) */}
              <HealthIcon
                iconUrl="/assets/aistudio/gf_07258eea.png"
                isLosing={health > 80}
                size={64}
              />
              {/* BF Icon (Player) */}
              <HealthIcon
                iconUrl="/assets/aistudio/bf_98b9bea3.png"
                isLosing={health < 20}
                size={64}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-slate-900/90 border border-yellow-400/40 rounded-xl px-6 py-1.5 text-center text-xs font-bold text-slate-100 flex items-center space-x-6 shadow-xl">
            <span className="text-yellow-300">Puntaje: {score}</span>
            <span className="text-red-400">Fallos: {misses}</span>
            <span className="text-cyan-300">Precisión: {accuracy}%</span>
            <span className="text-emerald-400">Combo: {combo}</span>
          </div>
        </div>
      </div>

      {/* 5. PAUSE MENU */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="bg-slate-900 border-4 border-yellow-400 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl font-black text-yellow-300 tracking-wider">JUEGO PAUSADO</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsPaused(false);
                  playSongAudio();
                }}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-lg shadow-lg transition"
              >
                CONTINUAR
              </button>
              <button
                onClick={restartGame}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-400/50 font-black rounded-xl text-lg shadow-lg transition flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>REINTENTAR</span>
              </button>
              <button
                onClick={onReturnToMenu}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-lg shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>MENÚ PRINCIPAL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GAME OVER */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6">
          <FNFSprite
            xmlUrl="/assets/aistudio/bf_gameover_0d9b4245.xml"
            pngUrl="/assets/aistudio/bf_gameover_4c65b82a.png"
            animPrefix="firstDeath"
            scale={1.2}
            fps={18}
          />

          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-red-500 tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
              ¡GAME OVER!
            </h1>
            <p className="text-yellow-300 text-lg font-bold">¡Te faltó más ritmo, huaso!</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={restartGame}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-lg shadow-xl transition transform hover:scale-105"
            >
              REINTENTAR (R)
            </button>
            <button
              onClick={onReturnToMenu}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-lg shadow-xl transition transform hover:scale-105"
            >
              MENÚ (ESC)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
