export interface SongNote {
  id: string;
  time: number; // in milliseconds from song start
  dir: 0 | 1 | 2 | 3; // 0=Left, 1=Down, 2=Up, 3=Right
  isPlayer: boolean; // true = BF, false = Opponent
  hit?: boolean;
  missed?: boolean;
}

export const SONG_BPM = 100;
export const MS_PER_BEAT = (60 / SONG_BPM) * 1000; // 600ms per beat

export function generateTutorialChart(): SongNote[] {
  const notes: SongNote[] = [];
  let noteId = 0;

  const addNote = (beat: number, dir: 0 | 1 | 2 | 3, isPlayer: boolean) => {
    notes.push({
      id: `note_${noteId++}`,
      time: beat * MS_PER_BEAT + 3000, // +3000ms offset for countdown
      dir,
      isPlayer,
    });
  };

  // Section 1: Intro Call and Response (Beats 0 - 32)
  // Opponent teaches Left, Down, Up, Right
  addNote(0, 0, false); // Opponent Left
  addNote(4, 1, false); // Opponent Down
  addNote(8, 2, false); // Opponent Up
  addNote(12, 3, false); // Opponent Right

  // Player repeats Left, Down, Up, Right
  addNote(16, 0, true); // Player Left
  addNote(20, 1, true); // Player Down
  addNote(24, 2, true); // Player Up
  addNote(28, 3, true); // Player Right

  // Section 2: 2-note combos (Beats 32 - 64)
  // Opponent
  addNote(32, 0, false);
  addNote(33, 1, false);

  addNote(36, 2, false);
  addNote(37, 3, false);

  addNote(40, 1, false);
  addNote(41, 2, false);

  addNote(44, 0, false);
  addNote(45, 3, false);

  // Player repeats
  addNote(48, 0, true);
  addNote(49, 1, true);

  addNote(52, 2, true);
  addNote(53, 3, true);

  addNote(56, 1, true);
  addNote(57, 2, true);

  addNote(60, 0, true);
  addNote(61, 3, true);

  // Section 3: Webiando Freestyle Run (Beats 64 - 128)
  for (let b = 64; b < 96; b += 4) {
    // Opponent 4 beat pattern
    addNote(b, (b / 4) % 4 as 0 | 1 | 2 | 3, false);
    addNote(b + 1.5, ((b / 4) + 1) % 4 as 0 | 1 | 2 | 3, false);
    addNote(b + 2.5, ((b / 4) + 2) % 4 as 0 | 1 | 2 | 3, false);
    addNote(b + 3, ((b / 4) + 3) % 4 as 0 | 1 | 2 | 3, false);
  }

  for (let b = 96; b < 128; b += 4) {
    // Player 4 beat pattern response
    addNote(b, (b / 4) % 4 as 0 | 1 | 2 | 3, true);
    addNote(b + 1.5, ((b / 4) + 1) % 4 as 0 | 1 | 2 | 3, true);
    addNote(b + 2.5, ((b / 4) + 2) % 4 as 0 | 1 | 2 | 3, true);
    addNote(b + 3, ((b / 4) + 3) % 4 as 0 | 1 | 2 | 3, true);
  }

  // Section 4: Duet Finale (Beats 128 - 160) - Both play together!
  for (let b = 128; b < 160; b += 2) {
    const dirOpp = (b / 2) % 4 as 0 | 1 | 2 | 3;
    const dirBF = ((b / 2) + 2) % 4 as 0 | 1 | 2 | 3;
    addNote(b, dirOpp, false);
    addNote(b + 0.5, dirBF, true);
  }

  return notes;
}
