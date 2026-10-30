import React, { useState, useEffect } from 'react';
import { loadAndParseXML, findFramesByPrefix, TextureAtlasData, SubTexture } from '../utils/xmlParser';

interface FNFSpriteProps {
  xmlUrl: string;
  pngUrl: string;
  animPrefix: string;
  fps?: number;
  scale?: number;
  loop?: boolean;
  flipX?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAnimationEnd?: () => void;
}

export const FNFSprite: React.FC<FNFSpriteProps> = ({
  xmlUrl,
  pngUrl,
  animPrefix,
  fps = 24,
  scale = 1,
  loop = true,
  flipX = false,
  className = '',
  style = {},
  onAnimationEnd,
}) => {
  const [atlas, setAtlas] = useState<TextureAtlasData | null>(null);
  const [frames, setFrames] = useState<SubTexture[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  // Load XML
  useEffect(() => {
    let active = true;
    loadAndParseXML(xmlUrl)
      .then((data) => {
        if (active) {
          setAtlas(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load XML:', xmlUrl, err);
      });
    return () => {
      active = false;
    };
  }, [xmlUrl]);

  // Update animation frames when prefix or atlas changes
  useEffect(() => {
    if (!atlas) return;
    let found = findFramesByPrefix(atlas, animPrefix);
    if (found.length === 0) {
      // Fallback if exact prefix not found: try case-insensitive or idle
      const lowerPref = animPrefix.toLowerCase();
      found = atlas.textureList.filter((t) => t.name.toLowerCase().includes(lowerPref));
    }
    if (found.length === 0 && atlas.textureList.length > 0) {
      found = [atlas.textureList[0]];
    }
    setFrames(found);
    setCurrentFrameIdx(0);
  }, [atlas, animPrefix]);

  // Animation ticker
  useEffect(() => {
    if (frames.length <= 1) return;

    const intervalMs = 1000 / fps;
    const timer = setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev + 1 >= frames.length) {
          if (!loop) {
            clearInterval(timer);
            if (onAnimationEnd) onAnimationEnd();
            return prev;
          }
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [frames, fps, loop, onAnimationEnd]);

  if (!atlas || frames.length === 0) {
    return null;
  }

  const curFrame = frames[Math.min(currentFrameIdx, frames.length - 1)];

  // FNF frame calculations:
  // frameX and frameY in FNF XML are offsets relative to frameWidth/frameHeight (usually negative numbers).
  const offsetX = Math.abs(curFrame.frameX || 0) * scale;
  const offsetY = Math.abs(curFrame.frameY || 0) * scale;

  const containerW = curFrame.frameWidth * scale;
  const containerH = curFrame.frameHeight * scale;

  const cropW = curFrame.width * scale;
  const cropH = curFrame.height * scale;

  const bgPosX = -curFrame.x * scale;
  const bgPosY = -curFrame.y * scale;

  const atlasW = atlas.width * scale;
  const atlasH = atlas.height * scale;

  return (
    <div
      className={`relative inline-block pointer-events-none ${className}`}
      style={{
        width: `${containerW}px`,
        height: `${containerH}px`,
        transform: flipX ? 'scaleX(-1)' : 'none',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          width: `${cropW}px`,
          height: `${cropH}px`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${atlasW}px`,
            height: `${atlasH}px`,
            backgroundImage: `url(${pngUrl})`,
            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
            backgroundSize: `${atlasW}px ${atlasH}px`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  );
};
