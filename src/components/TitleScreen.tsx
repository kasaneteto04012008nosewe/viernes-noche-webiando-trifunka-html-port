import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Globe, Maximize2, RefreshCw, Volume1, Sliders, Copy, Download, RotateCcw, Check, Move, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SILHOUETTE_ASSETS, SilhouetteInfo, Language } from '../types';
import { playClickSound, playConfirmSound, playEasterEggSound, subscribeBeat, startBGM } from '../utils/sound';
import { MsnPopup } from './MsnPopup';
import { BowAnimation } from './BowAnimation';

interface TitleScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onStartTutorial?: () => void;
}

interface LayoutConfig {
  barUpperX: number;
  barUpperY: number;
  barUpperWidth: number;
  barUpperHeight: number;
  barUpperScaleY: number;

  barLowerX: number;
  barLowerY: number;
  barLowerWidth: number;
  barLowerHeight: number;
  barLowerScaleY: number;

  textUpperX: number;
  textUpperY: number;
  textUpperScale: number;

  textLowerX: number;
  textLowerY: number;
  textLowerScale: number;

  logoX: number;
  logoY: number;
  logoScale: number;

  silhouettesX: number;
  silhouettesY: number;
  silhouettesScale: number;

  banderaIZQX: number;
  banderaIZQY: number;
  banderaIZQScale: number;

  banderaDERX: number;
  banderaDERY: number;
  banderaDERScale: number;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  barUpperX: 0,
  barUpperY: -184,
  barUpperWidth: 106,
  barUpperHeight: 392,
  barUpperScaleY: 1.0,

  barLowerX: 0,
  barLowerY: -170,
  barLowerWidth: 106,
  barLowerHeight: 392,
  barLowerScaleY: 1.0,

  textUpperX: 0,
  textUpperY: 41,
  textUpperScale: 1.0,

  textLowerX: 0,
  textLowerY: 55,
  textLowerScale: 1.0,

  logoX: 0,
  logoY: -113,
  logoScale: 1.0,

  silhouettesX: 0,
  silhouettesY: 110,
  silhouettesScale: 1.0,

  banderaIZQX: 0,
  banderaIZQY: 48,
  banderaIZQScale: 1.0,

  banderaDERX: 0,
  banderaDERY: 48,
  banderaDERScale: 1.0,
};

export const TitleScreen: React.FC<TitleScreenProps> = ({
  language,
  onLanguageChange,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  onStartTutorial,
}) => {
  const [selectedSilhouettes, setSelectedSilhouettes] = useState<SilhouetteInfo[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [logoBouncing, setLogoBouncing] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);
  const [isPressingEnter, setIsPressingEnter] = useState(false);
  const [currentLogoVariant, setCurrentLogoVariant] = useState<string>('/assets/aistudio/Logo_3ead0a99.png');

  // EDITOR MODE STATE
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'BARS' | 'TEXT' | 'LOGO' | 'SILHOUETTES' | 'BANNERS'>('BARS');
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [copied, setCopied] = useState(false);

  // Raw text inputs state for freeform negative number editing without NaN reset bug
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({});

  const getRawVal = (key: keyof LayoutConfig): string => {
    if (rawInputs[key] !== undefined) return rawInputs[key];
    return String(layout[key]);
  };

  const handleInputChange = (key: keyof LayoutConfig, strVal: string) => {
    setRawInputs((prev) => ({ ...prev, [key]: strVal }));
    if (strVal === '' || strVal === '-') return;
    const num = parseFloat(strVal);
    if (!isNaN(num)) {
      setLayout((prev) => ({ ...prev, [key]: num }));
    }
  };

  const updateNumericVal = (key: keyof LayoutConfig, delta: number) => {
    const currentVal = layout[key];
    const newVal = Math.round((currentVal + delta) * 100) / 100;
    setLayout((prev) => ({ ...prev, [key]: newVal }));
    setRawInputs((prev) => ({ ...prev, [key]: String(newVal) }));
  };

  const renderFieldControls = (
    label: string,
    key: keyof LayoutConfig,
    min: number = -1200,
    max: number = 1200,
    step: number = 1
  ) => (
    <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-white/10">
      <div className="flex justify-between items-center text-slate-200 text-xs">
        <span className="font-semibold">{label}:</span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={getRawVal(key)}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-20 bg-slate-800 border border-yellow-400 text-yellow-300 px-1.5 py-0.5 rounded font-mono font-bold text-right text-xs"
          />
          <span className="text-[10px] text-slate-400">px</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={layout[key]}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setLayout((prev) => ({ ...prev, [key]: val }));
          setRawInputs((prev) => ({ ...prev, [key]: String(val) }));
        }}
        className="w-full accent-yellow-400 cursor-pointer"
      />

      <div className="flex items-center justify-between gap-1 pt-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateNumericVal(key, -100)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded text-[10px] font-mono font-bold"
          >
            -100
          </button>
          <button
            type="button"
            onClick={() => updateNumericVal(key, -20)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded text-[10px] font-mono font-bold"
          >
            -20
          </button>
          <button
            type="button"
            onClick={() => updateNumericVal(key, -5)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded text-[10px] font-mono font-bold"
          >
            -5
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateNumericVal(key, 5)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-green-300 rounded text-[10px] font-mono font-bold"
          >
            +5
          </button>
          <button
            type="button"
            onClick={() => updateNumericVal(key, 20)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-green-300 rounded text-[10px] font-mono font-bold"
          >
            +20
          </button>
          <button
            type="button"
            onClick={() => updateNumericVal(key, 100)}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-green-300 rounded text-[10px] font-mono font-bold"
          >
            +100
          </button>
        </div>
      </div>
    </div>
  );

  const logoVariants = [
    '/assets/aistudio/Logo_3ead0a99.png',
    '/assets/aistudio/Logo-15_4d412b5e.png',
    '/assets/aistudio/Logo-plop_cb6c39b9.png',
    '/assets/aistudio/Logo-lost_a312bfd3.png',
  ];

  const shuffleSilhouettes = () => {
    const shuffled = [...SILHOUETTE_ASSETS].sort(() => 0.5 - Math.random());
    setSelectedSilhouettes(shuffled.slice(0, 4));
  };

  useEffect(() => {
    shuffleSilhouettes();
  }, []);

  // Listen for 102 BPM beat pulse (~588ms)
  useEffect(() => {
    const unsubscribe = subscribeBeat(() => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 180);
    });
    return unsubscribe;
  }, []);

  const handleStart = () => {
    startBGM();
    playConfirmSound();
    setIsPressingEnter(true);
    setTimeout(() => {
      setIsPressingEnter(false);
      if (onStartTutorial) onStartTutorial();
    }, 500);
  };

  // Keydown listener for Enter / Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartTutorial]);

  const handleLogoClick = () => {
    startBGM();
    playClickSound();
    setLogoBouncing(true);
    setTimeout(() => setLogoBouncing(false), 250);

    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (nextClicks % 4 === 0) {
      const randomVar = logoVariants[Math.floor(Math.random() * logoVariants.length)];
      setCurrentLogoVariant(randomVar);
    }

    if (nextClicks === 15) {
      setShowEasterEgg(true);
      playEasterEggSound();
    }
  };

  const toggleFullscreen = () => {
    if (!documentfullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const documentfullscreenElement = typeof document !== 'undefined' ? document.fullscreenElement : null;

  // Export coordinates text summary
  const getLayoutSummaryTxt = () => {
    return `=== MEDIDAS Y POSICIONES FNF WEBIANDO ===
Barra Superior (BarUpper): X = ${layout.barUpperX}px | Y = ${layout.barUpperY}px | Ancho = ${layout.barUpperWidth}% | Altura = ${layout.barUpperHeight}px | EscalaY = ${layout.barUpperScaleY}
Barra Inferior (BarLower): X = ${layout.barLowerX}px | Y = ${layout.barLowerY}px (desde abajo) | Ancho = ${layout.barLowerWidth}% | Altura = ${layout.barLowerHeight}px | EscalaY = ${layout.barLowerScaleY}
Texto Superior: X = ${layout.textUpperX}px | Y = ${layout.textUpperY}px | Escala = ${layout.textUpperScale}
Texto Inferior: X = ${layout.textLowerX}px | Y = ${layout.textLowerY}px (desde abajo) | Escala = ${layout.textLowerScale}
Logo: X = ${layout.logoX}px | Y = ${layout.logoY}px | Escala = ${layout.logoScale}
Siluetas: X = ${layout.silhouettesX}px | Y = ${layout.silhouettesY}px (desde abajo) | Escala = ${layout.silhouettesScale}
Bandera Izquierda: Offset X = ${layout.banderaIZQX}px | Offset Y = ${layout.banderaIZQY}px | Escala = ${layout.banderaIZQScale}
Bandera Derecha: Offset X = ${layout.banderaDERX}px | Offset Y = ${layout.banderaDERY}px | Escala = ${layout.banderaDERScale}
==========================================`;
  };

  const handleCopyLayout = () => {
    navigator.clipboard.writeText(getLayoutSummaryTxt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textData = getLayoutSummaryTxt();
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medidas_fnf_menu.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col justify-between"
      onClick={() => startBGM()}
    >
      {/* 1. SKY BACKDROP */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/assets/aistudio/Sky_5d9a312d.png"
          alt="Sky"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. CARNIVAL BACKGROUND OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-1">
        <img
          src="/assets/aistudio/CarnivalBG_58ef04db.png"
          alt="Carnival Background"
          className={`w-full h-full object-cover mix-blend-multiply opacity-85 transition-transform duration-150 ${
            beatPulse ? 'scale-[1.01]' : 'scale-100'
          }`}
        />
      </div>

      {/* 3. UPPER CURVED RED ARCH BAR */}
      <div
        style={{
          top: `${layout.barUpperY}px`,
          left: `calc(50% + ${layout.barUpperX}px)`,
          width: `${layout.barUpperWidth}%`,
          transform: `translateX(-50%) scaleY(${layout.barUpperScaleY})`,
        }}
        className={`absolute pointer-events-none z-20 leading-none transition-all ${
          isEditorOpen && activeTab === 'BARS' ? 'ring-4 ring-yellow-400 border-2 border-yellow-300' : ''
        }`}
      >
        <img
          src="/assets/aistudio/BarUpper_cd663663.png"
          alt="Bar Upper"
          style={{ height: `${layout.barUpperHeight}px` }}
          className="w-full object-fill block drop-shadow-xl"
        />
      </div>

      {/* 4. UPPER TEXT: "¡PRESIONA ENTER PARA EMPEZAR!" */}
      <div
        onClick={handleStart}
        style={{
          top: `${layout.textUpperY}px`,
          left: `calc(50% + ${layout.textUpperX}px)`,
          transform: `translateX(-50%) scale(${layout.textUpperScale})`,
        }}
        className={`absolute z-35 cursor-pointer flex justify-center transition-all ${
          isEditorOpen && activeTab === 'TEXT' ? 'ring-4 ring-yellow-400 rounded-2xl p-1' : ''
        }`}
      >
        <div className={`transition-all duration-200 ${isPressingEnter ? 'scale-125 brightness-150' : 'animate-flash-glow'}`}>
          <img
            src={language === 'ESP' ? '/assets/aistudio/textUpper-esp_201051d2.png' : '/assets/aistudio/textUpper-eng_9d18c1ea.png'}
            alt="¡PRESIONA ENTER PARA EMPEZAR!"
            className="w-[280px] sm:w-[440px] md:w-[620px] h-auto object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.95)]"
          />
        </div>
      </div>

      {/* 5. LOWER CURVED RED ARCH BAR */}
      <div
        style={{
          bottom: `${layout.barLowerY}px`,
          left: `calc(50% + ${layout.barLowerX}px)`,
          width: `${layout.barLowerWidth}%`,
          transform: `translateX(-50%) scaleY(${layout.barLowerScaleY})`,
        }}
        className={`absolute pointer-events-none z-20 leading-none transition-all ${
          isEditorOpen && activeTab === 'BARS' ? 'ring-4 ring-yellow-400 border-2 border-yellow-300' : ''
        }`}
      >
        <img
          src="/assets/aistudio/BarLower_b2838e5d.png"
          alt="Bar Lower"
          style={{ height: `${layout.barLowerHeight}px` }}
          className="w-full object-fill block drop-shadow-2xl"
        />
      </div>

      {/* 6. LEFT RED STREAMER BANNERS */}
      <div
        style={{
          top: `${layout.banderaIZQY}px`,
          left: `${layout.banderaIZQX}px`,
          transform: `scale(${layout.banderaIZQScale})`,
        }}
        className={`absolute pointer-events-none z-15 transition-all origin-top-left ${
          isEditorOpen && activeTab === 'BANNERS' ? 'ring-4 ring-yellow-400 rounded-2xl p-1' : ''
        }`}
      >
        <img
          src="/assets/aistudio/bandera_IZQ_53cf34ef.png"
          alt="Left Streamers"
          className={`w-[20vw] max-w-[240px] min-w-[110px] h-auto object-contain block ${
            beatPulse ? 'scale-105 rotate-1' : 'scale-100'
          }`}
        />
      </div>

      {/* 7. RIGHT BLUE STREAMER BANNERS */}
      <div
        style={{
          top: `${layout.banderaDERY}px`,
          right: `${layout.banderaDERX}px`,
          transform: `scale(${layout.banderaDERScale})`,
        }}
        className={`absolute pointer-events-none z-15 transition-all origin-top-right ${
          isEditorOpen && activeTab === 'BANNERS' ? 'ring-4 ring-yellow-400 rounded-2xl p-1' : ''
        }`}
      >
        <img
          src="/assets/aistudio/bandera_DER_0b73dd45.png"
          alt="Right Streamers"
          className={`w-[20vw] max-w-[240px] min-w-[110px] h-auto object-contain block ${
            beatPulse ? 'scale-105 -rotate-1' : 'scale-100'
          }`}
        />
      </div>

      {/* 8. 4 RANDOM SILHOUETTES */}
      <div
        style={{
          bottom: `${layout.silhouettesY}px`,
          left: `calc(50% + ${layout.silhouettesX}px)`,
          transform: `translateX(-50%) scale(${layout.silhouettesScale})`,
        }}
        className={`absolute pointer-events-none z-10 flex items-end justify-between px-2 sm:px-6 md:px-12 w-full max-w-7xl transition-all ${
          isEditorOpen && activeTab === 'SILHOUETTES' ? 'ring-4 ring-yellow-400 rounded-2xl p-1' : ''
        }`}
      >
        {selectedSilhouettes.map((sil, index) => {
          const slotStyles = [
            'w-[160px] sm:w-[240px] md:w-[300px] transform -translate-x-2',
            'w-[150px] sm:w-[220px] md:w-[270px] transform translate-x-2 -translate-y-2',
            'w-[150px] sm:w-[220px] md:w-[270px] transform -translate-x-2 -translate-y-4',
            'w-[160px] sm:w-[240px] md:w-[310px] transform translate-x-2',
          ];

          return (
            <div
              key={`${sil.id}-${index}`}
              className={`relative flex items-end justify-center transition-transform duration-200 ${slotStyles[index]} ${
                beatPulse ? 'scale-[1.04] -translate-y-1' : 'scale-100'
              }`}
            >
              <img
                src={sil.src}
                alt={sil.name}
                className="w-full h-auto max-h-[50vh] object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)]"
              />
            </div>
          );
        })}
      </div>

      {/* 9. CENTER LOGO */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 my-auto">
        <div
          onClick={(e) => { e.stopPropagation(); handleLogoClick(); }}
          style={{
            transform: `translate(${layout.logoX}px, ${layout.logoY}px) scale(${layout.logoScale})`,
          }}
          className={`cursor-pointer transition-transform duration-200 ${
            logoBouncing ? 'scale-110 rotate-1' : beatPulse ? 'scale-105' : 'scale-100'
          } ${isEditorOpen && activeTab === 'LOGO' ? 'ring-4 ring-yellow-400 p-2 rounded-2xl' : ''}`}
          title="¡Haz clic en el logo!"
        >
          <img
            src={currentLogoVariant}
            alt="Viernes Noche Webiando Logo"
            className="w-[300px] sm:w-[440px] md:w-[580px] h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
          />
        </div>
      </main>

      {/* 10. LOWER PRESS ENTER TEXT */}
      <div
        onClick={handleStart}
        style={{
          bottom: `${layout.textLowerY}px`,
          left: `calc(50% + ${layout.textLowerX}px)`,
          transform: `translateX(-50%) scale(${layout.textLowerScale})`,
        }}
        className={`absolute z-35 cursor-pointer flex justify-center transition-all ${
          isEditorOpen && activeTab === 'TEXT' ? 'ring-4 ring-yellow-400 rounded-2xl p-1' : ''
        }`}
      >
        <div className={`transition-transform duration-200 ${beatPulse ? 'scale-105' : 'scale-100'}`}>
          <img
            src={language === 'ESP' ? '/assets/aistudio/textLower-esp_34b050b8.png' : '/assets/aistudio/textLower-eng_b79fd63e.png'}
            alt="¡PRESIONA ENTER PARA EMPEZAR!"
            className="w-[280px] sm:w-[460px] md:w-[640px] h-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
          />
        </div>
      </div>

      {/* 11. TOP FLOATING CONTROLS */}
      <div className="absolute top-2 right-2 md:top-3 md:right-4 z-40 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white shadow-xl">
        {/* Toggle Editor Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditorOpen(!isEditorOpen); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-fnf transition-all shadow-md ${
            isEditorOpen
              ? 'bg-yellow-400 text-slate-950 font-bold border-2 border-black animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400'
          }`}
          title="Editar posiciones y medidas libremente"
        >
          <Sliders className="w-4 h-4" />
          <span>{isEditorOpen ? 'OCULTAR EDITOR' : '🛠️ EDITOR EN VIVO'}</span>
        </button>

        {/* Volume slider */}
        <div className="hidden sm:flex items-center gap-2 px-2">
          <Volume1 className="w-4 h-4 text-yellow-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-yellow-400 cursor-pointer"
          />
        </div>

        {/* Sound mute button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className="p-1.5 hover:bg-white/20 rounded-full text-white transition-transform active:scale-95"
          title={isMuted ? 'Activar Sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
        </button>

        {/* Language switch button */}
        <button
          onClick={(e) => { e.stopPropagation(); onLanguageChange(language === 'ESP' ? 'ENG' : 'ESP'); }}
          className="flex items-center gap-1 px-2.5 py-1 hover:bg-white/20 rounded-full text-xs font-bold text-yellow-300 transition-transform active:scale-95"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language}</span>
        </button>

        {/* Reshuffle silhouettes button */}
        <button
          onClick={(e) => { e.stopPropagation(); shuffleSilhouettes(); }}
          className="p-1.5 hover:bg-white/20 rounded-full text-white transition-transform active:scale-95"
          title="Cambiar Siluetas"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="p-1.5 hover:bg-white/20 rounded-full text-white transition-transform active:scale-95"
          title="Pantalla Completa"
        >
          <Maximize2 className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* 12. ADVANCED UNLIMITED CUSTOMIZER PANEL */}
      {isEditorOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-14 left-4 z-50 w-[360px] md:w-[460px] bg-slate-900/95 backdrop-blur-md border-4 border-yellow-400 rounded-2xl p-4 text-white shadow-[0_10px_50px_rgba(0,0,0,0.95)] max-h-[88vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-3">
            <div className="font-fnf text-base text-yellow-300 flex items-center gap-2">
              <Move className="w-5 h-5 text-yellow-400" />
              <span>AJUSTE SIN LÍMITES (-1200px a +1200px)</span>
            </div>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="p-1 hover:bg-red-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB SELECTOR */}
          <div className="flex flex-wrap gap-1 mb-3 bg-black/60 p-1 rounded-xl">
            {(['BARS', 'TEXT', 'LOGO', 'SILHOUETTES', 'BANNERS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-yellow-400 text-black shadow-md font-fnf'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab === 'BARS' ? 'BARRAS' : tab === 'TEXT' ? 'TEXTO' : tab === 'LOGO' ? 'LOGO' : tab === 'SILHOUETTES' ? 'SILUETAS' : 'BANDERAS'}
              </button>
            ))}
          </div>

          <div className="space-y-3 text-xs">
            {activeTab === 'BARS' && (
              <>
                <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-yellow-400/40">
                  <div className="font-bold text-yellow-400 uppercase text-xs flex justify-between items-center">
                    <span>Barra Inferior (BarLower)</span>
                    <button
                      onClick={() => updateNumericVal('barLowerY', -50)}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded font-mono font-bold text-[10px]"
                    >
                      ⬇️ BAJAR -50px
                    </button>
                  </div>

                  {renderFieldControls('Posición Y (desde abajo)', 'barLowerY', -1200, 1200)}
                  {renderFieldControls('Posición X (horizontal)', 'barLowerX', -1000, 1000)}
                  {renderFieldControls('Altura (px)', 'barLowerHeight', 20, 1200)}
                  {renderFieldControls('Ancho (%)', 'barLowerWidth', 50, 200)}
                  {renderFieldControls('Escala Y (deformar alto)', 'barLowerScaleY', 0.1, 5, 0.05)}
                </div>

                <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-yellow-400/40">
                  <div className="font-bold text-yellow-400 uppercase text-xs">Barra Superior (BarUpper)</div>
                  {renderFieldControls('Posición Y (desde arriba)', 'barUpperY', -1200, 1200)}
                  {renderFieldControls('Posición X (horizontal)', 'barUpperX', -1000, 1000)}
                  {renderFieldControls('Altura (px)', 'barUpperHeight', 20, 1200)}
                  {renderFieldControls('Ancho (%)', 'barUpperWidth', 50, 200)}
                  {renderFieldControls('Escala Y (deformar alto)', 'barUpperScaleY', 0.1, 5, 0.05)}
                </div>
              </>
            )}

            {activeTab === 'TEXT' && (
              <>
                <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-cyan-400/40">
                  <div className="font-bold text-cyan-400 uppercase text-xs">Texto Superior</div>
                  {renderFieldControls('Posición Y (desde arriba)', 'textUpperY', -1200, 1200)}
                  {renderFieldControls('Posición X', 'textUpperX', -1000, 1000)}
                  {renderFieldControls('Escala', 'textUpperScale', 0.1, 4, 0.05)}
                </div>

                <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-cyan-400/40">
                  <div className="font-bold text-cyan-400 uppercase text-xs">Texto Inferior</div>
                  {renderFieldControls('Posición Y (desde abajo)', 'textLowerY', -1200, 1200)}
                  {renderFieldControls('Posición X', 'textLowerX', -1000, 1000)}
                  {renderFieldControls('Escala', 'textLowerScale', 0.1, 4, 0.05)}
                </div>
              </>
            )}

            {activeTab === 'LOGO' && (
              <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-pink-400/40">
                <div className="font-bold text-pink-400 uppercase text-xs">Logo Central</div>
                {renderFieldControls('Posición Y', 'logoY', -1200, 1200)}
                {renderFieldControls('Posición X', 'logoX', -1000, 1000)}
                {renderFieldControls('Escala', 'logoScale', 0.1, 4, 0.05)}
              </div>
            )}

            {activeTab === 'SILHOUETTES' && (
              <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-purple-400/40">
                <div className="font-bold text-purple-400 uppercase text-xs">Siluetas (4 Personajes)</div>
                {renderFieldControls('Posición Y (desde abajo)', 'silhouettesY', -1200, 1200)}
                {renderFieldControls('Posición X', 'silhouettesX', -1000, 1000)}
                {renderFieldControls('Escala', 'silhouettesScale', 0.1, 4, 0.05)}
              </div>
            )}

            {activeTab === 'BANNERS' && (
              <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-emerald-400/40">
                <div className="font-bold text-emerald-400 uppercase text-xs">Banderas / Streamers Laterales</div>
                {renderFieldControls('Bandera Izquierda Y', 'banderaIZQY', -1200, 1200)}
                {renderFieldControls('Bandera Izquierda X', 'banderaIZQX', -1000, 1000)}
                {renderFieldControls('Bandera Izquierda Escala', 'banderaIZQScale', 0.1, 4, 0.05)}
                <hr className="border-white/10 my-2" />
                {renderFieldControls('Bandera Derecha Y', 'banderaDERY', -1200, 1200)}
                {renderFieldControls('Bandera Derecha X', 'banderaDERX', -1000, 1000)}
                {renderFieldControls('Bandera Derecha Escala', 'banderaDERScale', 0.1, 4, 0.05)}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-2">
              <button
                onClick={handleCopyLayout}
                className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-fnf text-xs rounded-xl flex items-center justify-center gap-1 font-bold shadow transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡COPIADO!' : 'COPIAR MEDIDAS'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-fnf text-xs rounded-xl flex items-center justify-center gap-1 font-bold shadow transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>DESCARGAR .TXT</span>
              </button>

              <button
                onClick={() => {
                  setLayout(DEFAULT_LAYOUT);
                  setRawInputs({});
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                title="Resetear valores predeterminados"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 13. EASTER EGG OVERLAY */}
      {showEasterEgg && (
        <>
          {/* Pedro Pascal MSN Messenger notification popup - Bottom Right */}
          <MsnPopup onClose={() => setShowEasterEgg(false)} />

          {/* Bow sprite frame-by-frame animation - Direct Overlay on center-bottom screen */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
            <div className="font-fnf text-2xl md:text-3xl text-yellow-300 fnf-text-shadow mb-2 animate-bounce bg-black/60 px-4 py-1.5 rounded-full border border-yellow-400">
              ¡EASTER EGG SOLAYER UNLOCKED!
            </div>
            <BowAnimation className="w-[340px] md:w-[500px] h-auto" />
            <button
              onClick={() => setShowEasterEgg(false)}
              className="pointer-events-auto mt-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-fnf text-lg rounded-xl border-2 border-black shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4 inline mr-1" />
              ¡ZUMBAO! (CERRAR)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
