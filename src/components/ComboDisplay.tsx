import React from 'react';

interface ComboDisplayProps {
  ratingImg: string; // e.g. /assets/aistudio/sick_d371083e.png
  combo: number;
}

const NUM_MAP: Record<string, string> = {
  '0': '/assets/aistudio/num0_37ea0025.png',
  '1': '/assets/aistudio/num1_b215f5fb.png',
  '2': '/assets/aistudio/num2_f5621e84.png',
  '3': '/assets/aistudio/num3_8716c902.png',
  '4': '/assets/aistudio/num4_36c72970.png',
  '5': '/assets/aistudio/num5_9a8edee3.png',
  '6': '/assets/aistudio/num6_063f2ddd.png',
  '7': '/assets/aistudio/num7_b4d2eeb8.png',
  '8': '/assets/aistudio/num8_c6a33920.png',
  '9': '/assets/aistudio/num9_f1d561d2.png',
};

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ ratingImg, combo }) => {
  const digits = String(combo).padStart(3, '0').split('');

  return (
    <div className="flex flex-col items-center pointer-events-none animate-bounce">
      {/* Rating Banner Image */}
      <img
        src={ratingImg}
        alt="Rating"
        className="w-44 h-auto object-contain drop-shadow-[0_6px_15px_rgba(0,0,0,0.9)] scale-110"
      />

      {/* Combo Digits Images */}
      <div className="flex items-center space-x-1 -mt-2">
        {digits.map((digit, idx) => (
          <img
            key={`combo_num_${idx}`}
            src={NUM_MAP[digit] || NUM_MAP['0']}
            alt={digit}
            className="w-8 h-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
          />
        ))}
      </div>
    </div>
  );
};
