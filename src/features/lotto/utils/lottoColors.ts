export function getBallColor(num: number): { bg: string; text: string } {
  if (num <= 10) return { bg: '#fbc400', text: '#000' };
  if (num <= 20) return { bg: '#69c8f2', text: '#000' };
  if (num <= 30) return { bg: '#ff7272', text: '#fff' };
  if (num <= 40) return { bg: '#aaaaaa', text: '#000' };
  return { bg: '#b0d840', text: '#000' };
}

export const COLOR_RANGES = [
  { label: '1-10', range: [1, 10], color: '#fbc400' },
  { label: '11-20', range: [11, 20], color: '#69c8f2' },
  { label: '21-30', range: [21, 30], color: '#ff7272' },
  { label: '31-40', range: [31, 40], color: '#aaaaaa' },
  { label: '41-45', range: [41, 45], color: '#b0d840' },
] as const;

export function getColorGroup(num: number): number {
  if (num <= 10) return 0;
  if (num <= 20) return 1;
  if (num <= 30) return 2;
  if (num <= 40) return 3;
  return 4;
}
