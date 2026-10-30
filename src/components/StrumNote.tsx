import React from 'react';
import { FNFSprite } from './FNFSprite';

interface StrumNoteProps {
  dir: 0 | 1 | 2 | 3;
  type?: 'strum_static' | 'strum_press' | 'strum_confirm' | 'note';
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

const STRUM_ANIM_MAP: Record<0 | 1 | 2 | 3, { static: string; press: string; confirm: string; note: string }> = {
  0: { static: 'strum_0', press: 'press_0', confirm: 'confirm_0', note: 'note_0' }, // Left (Purple)
  1: { static: 'strum_1', press: 'press_1', confirm: 'confirm_1', note: 'note_1' }, // Down (Blue)
  2: { static: 'strum_2', press: 'press_2', confirm: 'confirm_2', note: 'note_2' }, // Up (Green)
  3: { static: 'strum_3', press: 'press_3', confirm: 'confirm_3', note: 'note_3' }, // Right (Red)
};

export const StrumNote: React.FC<StrumNoteProps> = ({
  dir,
  type = 'strum_static',
  scale = 0.7,
  className = '',
  style = {},
}) => {
  const anims = STRUM_ANIM_MAP[dir];

  if (type === 'note') {
    return (
      <FNFSprite
        xmlUrl="/assets/aistudio/noteAssets_dce0b657.xml"
        pngUrl="/assets/aistudio/noteAssets_f464872d.png"
        animPrefix={anims.note}
        scale={scale}
        fps={12}
        className={className}
        style={style}
      />
    );
  }

  let prefix = anims.static;
  if (type === 'strum_press') prefix = anims.press;
  if (type === 'strum_confirm') prefix = anims.confirm;

  return (
    <FNFSprite
      xmlUrl="/assets/aistudio/strumAssets_1ada6592.xml"
      pngUrl="/assets/aistudio/strumAssets_38a0968d.png"
      animPrefix={prefix}
      scale={scale}
      fps={24}
      loop={type !== 'strum_confirm'}
      className={className}
      style={style}
    />
  );
};
