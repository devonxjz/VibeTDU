/**
 * Color blending utility for mixing chemical colors in the beaker.
 */

/** Parse a CSS color string (hex, rgb, rgba, oklch fallback) into [r, g, b, a]. */
function parseColor(color: string): [number, number, number, number] {
  // hex
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length === 6) hex += "ff";
    const n = parseInt(hex, 16);
    return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, (n & 0xff) / 255];
  }

  // rgba / rgb
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    ];
  }

  // Fallback — return a neutral blue tint
  return [160, 200, 240, 0.7];
}

/** Convert [r, g, b, a] back to an rgba() string. */
function toRgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.round(a * 100) / 100})`;
}

/**
 * Blend an array of CSS color strings into a single mixed color.
 * Uses simple additive averaging — good enough for visual representation.
 *
 * @param colors Array of CSS color strings (hex, rgb, rgba)
 * @returns A single blended rgba() color string
 */
export function blendColors(colors: string[]): string {
  if (colors.length === 0) return "rgba(200, 230, 255, 0.0)";
  if (colors.length === 1) return colors[0];

  let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

  for (const c of colors) {
    const [r, g, b, a] = parseColor(c);
    rSum += r;
    gSum += g;
    bSum += b;
    aSum += a;
  }

  const n = colors.length;
  return toRgba(rSum / n, gSum / n, bSum / n, Math.min(1, aSum / n + 0.1));
}
