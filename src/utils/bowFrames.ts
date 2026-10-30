import { BowFrame } from '../types';

let cachedFrames: BowFrame[] | null = null;

export async function loadBowFrames(): Promise<BowFrame[]> {
  if (cachedFrames) return cachedFrames;

  try {
    const response = await fetch('/assets/aistudio/bow_f2ae24aa.xml');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const subTextures = xmlDoc.getElementsByTagName('SubTexture');

    const frames: BowFrame[] = [];
    for (let i = 0; i < subTextures.length; i++) {
      const elem = subTextures[i];
      const name = elem.getAttribute('name') || `bow${i}`;
      const x = parseInt(elem.getAttribute('x') || '0', 10);
      const y = parseInt(elem.getAttribute('y') || '0', 10);
      const width = parseInt(elem.getAttribute('width') || '0', 10);
      const height = parseInt(elem.getAttribute('height') || '0', 10);
      const frameX = elem.hasAttribute('frameX') ? parseInt(elem.getAttribute('frameX') || '0', 10) : 0;
      const frameY = elem.hasAttribute('frameY') ? parseInt(elem.getAttribute('frameY') || '0', 10) : 0;
      const frameWidth = elem.hasAttribute('frameWidth') ? parseInt(elem.getAttribute('frameWidth') || `${width}`, 10) : width;
      const frameHeight = elem.hasAttribute('frameHeight') ? parseInt(elem.getAttribute('frameHeight') || `${height}`, 10) : height;

      // Only add valid frames with width and height > 0
      if (width > 0 && height > 0) {
        frames.push({
          name,
          x,
          y,
          width,
          height,
          frameX,
          frameY,
          frameWidth,
          frameHeight,
        });
      }
    }

    cachedFrames = frames;
    return frames;
  } catch (err) {
    console.error('Failed to parse bow XML frames:', err);
    return [];
  }
}
