import React, { useEffect, useRef, useState } from 'react';
import { loadBowFrames } from '../utils/bowFrames';
import { BowFrame } from '../types';

interface BowAnimationProps {
  className?: string;
  onAnimationComplete?: () => void;
  loop?: boolean;
}

export const BowAnimation: React.FC<BowAnimationProps> = ({
  className = '',
  onAnimationComplete,
  loop = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frames, setFrames] = useState<BowFrame[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameIdxRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const loadedFrames = await loadBowFrames();
      if (!isMounted) return;
      setFrames(loadedFrames);

      const img = new Image();
      img.src = '/assets/aistudio/bow_96f5366d.png';
      img.onload = () => {
        if (!isMounted) return;
        imageRef.current = img;
      };
    }

    init();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (frames.length === 0) return;

    let lastTime = performance.now();
    const fps = 28;
    const interval = 1000 / fps;

    const render = (now: number) => {
      const delta = now - lastTime;
      if (delta >= interval) {
        lastTime = now - (delta % interval);

        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (canvas && img && frames.length > 0) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const currentFrame = frames[frameIdxRef.current % frames.length];
            const fw = currentFrame.frameWidth || 623;
            const fh = currentFrame.frameHeight || 375;

            if (canvas.width !== fw || canvas.height !== fh) {
              canvas.width = fw;
              canvas.height = fh;
            }

            ctx.clearRect(0, 0, fw, fh);

            const destX = Math.abs(currentFrame.frameX || 0);
            const destY = Math.abs(currentFrame.frameY || 0);

            if (currentFrame.width > 0 && currentFrame.height > 0) {
              ctx.drawImage(
                img,
                currentFrame.x,
                currentFrame.y,
                currentFrame.width,
                currentFrame.height,
                destX,
                destY,
                currentFrame.width,
                currentFrame.height
              );
            }

            frameIdxRef.current++;
            if (frameIdxRef.current >= frames.length) {
              if (loop) {
                frameIdxRef.current = 0;
              } else {
                frameIdxRef.current = frames.length - 1;
                if (onAnimationComplete) onAnimationComplete();
                return;
              }
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [frames, loop, onAnimationComplete]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-[550px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
      />
    </div>
  );
};
