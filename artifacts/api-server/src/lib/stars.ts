function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

export interface StarPosition {
  x: number;
  y: number;
  brightness: number;
}

export function starPositionFor(id: string): StarPosition {
  const h = fnv1a(id);
  const xRaw = h & 0xffff;
  const yRaw = (h >>> 16) & 0xffff;
  const bRaw = (h >>> 8) & 0x7f;
  const x = clamp01(xRaw / 0xffff);
  const y = clamp01(yRaw / 0xffff);
  const brightness = 0.55 + (bRaw / 127) * 0.45;
  return { x, y, brightness };
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export function preview(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "\u2026";
}
