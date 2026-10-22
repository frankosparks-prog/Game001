import * as THREE from 'three';

/**
 * Creates an ultra-fast, synchronous CanvasTexture in memory.
 * Never suspends, never requires external font downloads, and works offline.
 */
export function createTextTexture(
  text: string, 
  options: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    subtext?: string;
    subtextColor?: string;
  } = {}
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const width = options.width || 512;
  const height = options.height || 256;
  const fontSize = options.fontSize || 42;
  const bgColor = options.bgColor || '#d4b483'; // Cardboard brown default
  const textColor = options.textColor || '#0a0a0a';
  const borderColor = options.borderColor;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Optional Border
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, width - 12, height - 12);
  }

  // Text Styling
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Outfit", "Arial Black", sans-serif`;

  if (options.subtext) {
    ctx.fillText(text, width / 2, height / 2 - 28);
    ctx.font = `600 ${fontSize * 0.55}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = options.subtextColor || '#38bdf8';
    ctx.fillText(options.subtext, width / 2, height / 2 + 35);
  } else {
    // Word wrapping for long protest slogans
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 40 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 1.25;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
