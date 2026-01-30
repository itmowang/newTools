/**
 * 颜色信息
 */
export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl?: { h: number; s: number; l: number };
}
