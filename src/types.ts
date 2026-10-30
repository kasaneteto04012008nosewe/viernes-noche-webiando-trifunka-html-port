export type GameState = 'TITLE' | 'MAIN_MENU' | 'STORY_MODE' | 'FREEPLAY' | 'OPTIONS' | 'SOUND_TEST' | 'CREDITS';

export type Language = 'ESP' | 'ENG';

export interface SilhouetteInfo {
  id: number;
  src: string;
  name: string;
}

export const SILHOUETTE_ASSETS: SilhouetteInfo[] = [
  { id: 1, src: '/assets/aistudio/1_91a677a3.png', name: 'Boyfriend' },
  { id: 2, src: '/assets/aistudio/2_db638dc4.png', name: 'Girlfriend' },
  { id: 3, src: '/assets/aistudio/3_219dd18a.png', name: 'Pico' },
  { id: 4, src: '/assets/aistudio/4_f73809e6.png', name: 'Mommy Mearest' },
  { id: 5, src: '/assets/aistudio/5_47a34a30.png', name: 'Daddy Dearest' },
  { id: 6, src: '/assets/aistudio/6_a654e244.png', name: 'Spooky Kids' },
  { id: 7, src: '/assets/aistudio/7_1af73491.png', name: 'Monster' },
  { id: 8, src: '/assets/aistudio/8_30d98b3c.png', name: 'Senpai' },
  { id: 9, src: '/assets/aistudio/9_64b50443.png', name: 'Tankman' },
  { id: 10, src: '/assets/aistudio/10_8a0a1af6.png', name: 'Whitty' },
  { id: 11, src: '/assets/aistudio/11_3b56f62e.png', name: 'Tricky' },
  { id: 12, src: '/assets/aistudio/12_e72494e4.png', name: 'Tabi' },
  { id: 13, src: '/assets/aistudio/13_b02dcb5c.png', name: 'Agoti' },
  { id: 14, src: '/assets/aistudio/14_28257403.png', name: 'Sarvente' },
  { id: 15, src: '/assets/aistudio/15_e10fa9a8.png', name: 'Ruv' },
  { id: 16, src: '/assets/aistudio/16_ed90633d.png', name: 'Garcello' },
  { id: 17, src: '/assets/aistudio/17_91fb5b56.png', name: 'Kapi' },
  { id: 18, src: '/assets/aistudio/18_f67bd236.png', name: 'Hex' },
  { id: 19, src: '/assets/aistudio/19_4d02158e.png', name: 'Matt' },
  { id: 20, src: '/assets/aistudio/20_d377fb0e.png', name: 'Shaggy' },
  { id: 21, src: '/assets/aistudio/21_b66bd295.png', name: 'Sonic.exe' },
  { id: 22, src: '/assets/aistudio/22_2342874a.png', name: 'Mario' },
  { id: 23, src: '/assets/aistudio/23_e930defe.png', name: 'Luigi' },
  { id: 24, src: '/assets/aistudio/24_1761e60e.png', name: 'Sans' },
  { id: 25, src: '/assets/aistudio/25_e35de773.png', name: 'Papyrus' },
  { id: 26, src: '/assets/aistudio/26_923b7701.png', name: 'Hatsune Miku' },
  { id: 27, src: '/assets/aistudio/27_288e2a7d.png', name: 'Oswald' },
  { id: 28, src: '/assets/aistudio/28_7f0270b4.png', name: 'Cuphead' },
  { id: 29, src: '/assets/aistudio/29_6ea70d45.png', name: 'Bendy' },
  { id: 30, src: '/assets/aistudio/30_619eee47.png', name: 'Monika' },
  { id: 31, src: '/assets/aistudio/31_9a7ebb37.png', name: 'Indie Cross' },
  { id: 32, src: '/assets/aistudio/32_17a4e4c6.png', name: 'Dave & Bambi' },
  { id: 33, src: '/assets/aistudio/33_04517af1.png', name: 'Hypno' },
  { id: 34, src: '/assets/aistudio/34_82f9b4c9.png', name: 'Lord X' },
];

export interface BowFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameX?: number;
  frameY?: number;
  frameWidth?: number;
  frameHeight?: number;
}

export interface GameSettings {
  language: Language;
  volume: number;
  flashingLights: boolean;
  autoPlayMusic: boolean;
  easterEggUnlocked: boolean;
}
