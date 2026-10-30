export interface SubTexture {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  rotated: boolean;
}

export interface TextureAtlasData {
  imagePath: string;
  width: number;
  height: number;
  textures: Map<string, SubTexture>;
  textureList: SubTexture[];
}

const xmlCache = new Map<string, TextureAtlasData>();

export function parseTextureAtlas(xmlString: string): TextureAtlasData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const atlasEl = xmlDoc.querySelector('TextureAtlas');

  const imagePath = atlasEl?.getAttribute('imagePath') || '';
  const atlasWidth = parseInt(atlasEl?.getAttribute('width') || '1000', 10);
  const atlasHeight = parseInt(atlasEl?.getAttribute('height') || '1000', 10);

  const textures = new Map<string, SubTexture>();
  const textureList: SubTexture[] = [];

  const subNodes = xmlDoc.querySelectorAll('SubTexture');
  subNodes.forEach((node) => {
    const name = node.getAttribute('name') || '';
    const x = parseInt(node.getAttribute('x') || '0', 10);
    const y = parseInt(node.getAttribute('y') || '0', 10);
    const width = parseInt(node.getAttribute('width') || '0', 10);
    const height = parseInt(node.getAttribute('height') || '0', 10);

    const frameX = parseInt(node.getAttribute('frameX') || '0', 10);
    const frameY = parseInt(node.getAttribute('frameY') || '0', 10);
    const frameWidth = parseInt(node.getAttribute('frameWidth') || `${width}`, 10);
    const frameHeight = parseInt(node.getAttribute('frameHeight') || `${height}`, 10);
    const rotated = node.getAttribute('rotated') === 'true';

    const tex: SubTexture = {
      name,
      x,
      y,
      width,
      height,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
      rotated,
    };

    textures.set(name, tex);
    textureList.push(tex);
  });

  return {
    imagePath,
    width: atlasWidth,
    height: atlasHeight,
    textures,
    textureList,
  };
}

export async function loadAndParseXML(xmlUrl: string): Promise<TextureAtlasData> {
  if (xmlCache.has(xmlUrl)) {
    return xmlCache.get(xmlUrl)!;
  }
  const res = await fetch(xmlUrl);
  const text = await res.text();
  const atlas = parseTextureAtlas(text);
  xmlCache.set(xmlUrl, atlas);
  return atlas;
}

export function findFramesByPrefix(atlas: TextureAtlasData, prefix: string): SubTexture[] {
  const matching = atlas.textureList.filter((t) => t.name.startsWith(prefix));
  // Sort numerically by trailing digits if available
  matching.sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+$/)?.[0] || '0', 10);
    const numB = parseInt(b.name.match(/\d+$/)?.[0] || '0', 10);
    return numA - numB;
  });
  return matching;
}
