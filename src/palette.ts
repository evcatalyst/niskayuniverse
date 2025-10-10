export type Palette = 'palette-okabe' | 'palette-dark2' | 'palette-mono';

export const PALETTES: Record<Palette, string> = {
  'palette-okabe': 'Okabe-Ito (Colorblind-safe)',
  'palette-dark2': 'ColorBrewer Dark2',
  'palette-mono': 'Monochrome + Patterns',
};

export function applyPalette(palette: Palette): void {
  document.documentElement.setAttribute('data-palette', palette);
}

export function getCurrentPalette(): Palette {
  const palette = document.documentElement.getAttribute('data-palette') as Palette;
  return palette || 'palette-okabe';
}

export function colorFor(material: string, config: any): string {
  const palette = getCurrentPalette();
  applyPalette(palette); // Ensure applied

  switch (material) {
    case 'lead':
      return 'var(--lead)';
    case 'copper':
      return 'var(--copper)';
    case 'galvanized':
      return 'var(--galvanized)';
    case 'plastic':
      return 'var(--plastic)';
    case 'unknown':
      return 'var(--unknown-1)';
    default:
      return 'var(--unknown-1)';
  }
}