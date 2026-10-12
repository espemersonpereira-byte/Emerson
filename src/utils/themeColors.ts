export interface AccentColorPreset {
  id: string;
  name: string;
  hex: string;
  shades: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
  };
}

export const ACCENT_COLOR_PRESETS: AccentColorPreset[] = [
  {
    id: 'orange',
    name: 'Laranja Fogo',
    hex: '#f97316',
    shades: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
    },
  },
  {
    id: 'blue',
    name: 'Azul Elétrico',
    hex: '#3b82f6',
    shades: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
  {
    id: 'emerald',
    name: 'Verde Esmeralda',
    hex: '#10b981',
    shades: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
  },
  {
    id: 'red',
    name: 'Vermelho Titânio',
    hex: '#ef4444',
    shades: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
  },
  {
    id: 'violet',
    name: 'Roxo Cobalto',
    hex: '#8b5cf6',
    shades: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
    },
  },
  {
    id: 'cyan',
    name: 'Ciano Neon',
    hex: '#06b6d4',
    shades: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
    },
  },
  {
    id: 'amber',
    name: 'Ouro Olímpico',
    hex: '#eab308',
    shades: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
    },
  },
  {
    id: 'pink',
    name: 'Rosa Magenta',
    hex: '#ec4899',
    shades: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
    },
  },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mixRgb(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
  weight: number
): string {
  const r = Math.round(c1.r * (1 - weight) + c2.r * weight);
  const g = Math.round(c1.g * (1 - weight) + c2.g * weight);
  const b = Math.round(c1.b * (1 - weight) + c2.b * weight);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function generateShadesFromHex(hex: string): AccentColorPreset['shades'] {
  const rgb = hexToRgb(hex) || { r: 249, g: 115, b: 22 };
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 10, g: 12, b: 18 };

  return {
    50: mixRgb(rgb, white, 0.92),
    100: mixRgb(rgb, white, 0.82),
    200: mixRgb(rgb, white, 0.65),
    300: mixRgb(rgb, white, 0.42),
    400: mixRgb(rgb, white, 0.2),
    500: hex.startsWith('#') ? hex : `#${hex}`,
    600: mixRgb(rgb, black, 0.16),
    700: mixRgb(rgb, black, 0.32),
  };
}

export function resolveAccentShades(accentColor?: string): AccentColorPreset['shades'] {
  if (!accentColor) return ACCENT_COLOR_PRESETS[0].shades;
  const preset = ACCENT_COLOR_PRESETS.find(
    (p) => p.id === accentColor || p.hex.toLowerCase() === accentColor.toLowerCase()
  );
  if (preset) return preset.shades;
  if (accentColor.startsWith('#') && accentColor.length === 7) {
    return generateShadesFromHex(accentColor);
  }
  return ACCENT_COLOR_PRESETS[0].shades;
}

export function applyAccentColorToDOM(accentColor?: string): void {
  if (typeof document === 'undefined') return;
  const shades = resolveAccentShades(accentColor);
  const root = document.documentElement;
  root.style.setProperty('--accent-50', shades[50]);
  root.style.setProperty('--accent-100', shades[100]);
  root.style.setProperty('--accent-200', shades[200]);
  root.style.setProperty('--accent-300', shades[300]);
  root.style.setProperty('--accent-400', shades[400]);
  root.style.setProperty('--accent-500', shades[500]);
  root.style.setProperty('--accent-600', shades[600]);
  root.style.setProperty('--accent-700', shades[700]);
}
