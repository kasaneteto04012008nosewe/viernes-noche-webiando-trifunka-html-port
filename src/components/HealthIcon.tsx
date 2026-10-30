import React from 'react';

interface HealthIconProps {
  iconUrl: string; // e.g. /assets/aistudio/gf_07258eea.png or /assets/aistudio/bf_98b9bea3.png
  isLosing?: boolean;
  className?: string;
  size?: number; // size in px (default 75px)
}

export const HealthIcon: React.FC<HealthIconProps> = ({
  iconUrl,
  isLosing = false,
  className = '',
  size = 75,
}) => {
  // FNF icon grid consists of 2 square frames side by side (150x150 or similar)
  // frame 0 = normal (left half)
  // frame 1 = losing (right half)
  const frameIndex = isLosing ? 1 : 0;

  return (
    <div
      className={`inline-block overflow-hidden relative pointer-events-none drop-shadow-md ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        style={{
          width: `${size * 2}px`,
          height: `${size}px`,
          backgroundImage: `url(${iconUrl})`,
          backgroundSize: `${size * 2}px ${size}px`,
          backgroundPosition: `${-frameIndex * size}px 0px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};
