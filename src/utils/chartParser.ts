export interface ChartNote {
  id: string;
  time: number; // in milliseconds
  dir: 0 | 1 | 2 | 3; // 0=Left, 1=Down, 2=Up, 3=Right
  isPlayer: boolean; // true = BF, false = Opponent (GF)
  length: number; // sustain length in ms
  type?: string;
  hit?: boolean;
  missed?: boolean;
}

export interface LyricSubtitle {
  time: number;
  id: string;
  text: string;
}

const LYRIC_TEXT_MAP: Record<string, string> = {
  'tutorial.lyrics.thatsHow': '¡Así es como se hace!',
  'tutorial.lyrics.dialogue1': 'Puta que eris bueno para rappear, Boyfriend culiado.',
  'tutorial.lyrics.dialogue2': '¡Yeah!',
  'tutorial.lyrics.dialogue3': 'Y la hueá dice así:',
  'tutorial.lyrics.verso1': 'Ate ta voy a escuchar, qué tal irí para rappear...',
  'tutorial.lyrics.verso2': 'El ritmo de esta funkeada en la Guaracha Friday Night...',
  'tutorial.lyrics.verso3': 'Por eso es que me gustái, por bueno pa tararear...',
  'tutorial.lyrics.guaracha': '¡El ritmo de esta rapeada en la Guaracha Friday Night!',
  'tutorial.lyrics.verso4': '¡No te voy a dejar!',
  'tutorial.lyrics.verso5': '¡Sigue rapeando hasta el final!',
  'tutorial.lyrics.verso6': '¡La Guaracha Friday Night!',
  'tutorial.lyrics.dialogue4': '¡Y nos fuáramos, vámonos, vámonos!',
  'tutorial.lyrics.dialogue5': '¡Puta que eris seco para la hueá, Boyfriend hueón!',
  'tutorial.lyrics.dialogue6': '¡Viva Chile, mierda!',
  'tutorial.lyrics.dialogue7': '¡Arriba el ritmo!',
  'tutorial.lyrics.dialogue8': '¡Eso fue todo, gracias por jugar!',
};

export async function loadSongChart(): Promise<{
  songName: string;
  speed: number;
  bpm: number;
  notes: ChartNote[];
}> {
  const res = await fetch('/assets/aistudio/tutorial_732c4ed1.json');
  const json = await res.json();

  const songData = json.song || json;
  const speed = songData.speed || 1.5;
  const bpm = songData.bpm || 110;
  const songName = songData.songName || 'Tutorial (Webiando Mix)';

  const parsedNotes: ChartNote[] = [];
  let noteIdx = 0;

  if (Array.isArray(songData.sections)) {
    songData.sections.forEach((sec: any) => {
      if (Array.isArray(sec.notes)) {
        sec.notes.forEach((n: any) => {
          let time = 0;
          let data = 0;
          let length = 0;
          let type = '';

          if (Array.isArray(n)) {
            time = n[0];
            data = n[1];
            length = n[2] || 0;
            type = n[3] || '';
          } else if (typeof n === 'object' && n !== null) {
            time = n.time;
            data = n.data;
            length = n.length || 0;
            type = n.type || '';
          }

          if (data >= 0 && data <= 7) {
            const isPlayer = data >= 4;
            const dir = (data % 4) as 0 | 1 | 2 | 3;

            parsedNotes.push({
              id: `note_${noteIdx++}`,
              time,
              dir,
              isPlayer,
              length,
              type,
            });
          }
        });
      }
    });
  }

  // Sort notes chronologically
  parsedNotes.sort((a, b) => a.time - b.time);

  return {
    songName,
    speed,
    bpm,
    notes: parsedNotes,
  };
}

export async function loadLyrics(): Promise<LyricSubtitle[]> {
  try {
    const res = await fetch('/assets/aistudio/lyrics_b9a253f8.json');
    const json = await res.json();
    if (Array.isArray(json.subtitles)) {
      return json.subtitles.map((sub: any) => ({
        time: sub.time * 100, // Convert to ms
        id: sub.id,
        text: LYRIC_TEXT_MAP[sub.id] || sub.id,
      }));
    }
  } catch (err) {
    console.error('Failed to load lyrics:', err);
  }
  return [];
}
