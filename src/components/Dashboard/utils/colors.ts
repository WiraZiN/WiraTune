// Paleta de colores estilo Spotify usada como acento aleatorio de cada
// playlist nueva. Se eligen tonos saturados que contrastan bien sobre
// fondos oscuros (#121212) para el degradado del banner.
const PLAYLIST_COLORS = [
  '#e8115b',
  '#1db954',
  '#5e3fde',
  '#dc148c',
  '#27856a',
  '#477d95',
  '#8c67ab',
  '#ba5d07',
  '#608108',
  '#1e3264',
  '#509bf5',
  '#148a08',
  '#e91429',
  '#7d4b32',
  '#af2896',
];

export function pickRandomPlaylistColor(): string {
  const index = Math.floor(Math.random() * PLAYLIST_COLORS.length);
  return PLAYLIST_COLORS[index];
}

/**
 * Mezcla un color hex con negro. amount=0 devuelve el color original,
 * amount=1 devuelve negro. Se usa para generar el tono intermedio del
 * degradado del banner sin necesitar una segunda entrada manual por color.
 */
function mixWithBlack(hex: string, amount: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  const mix = (channel: number) => Math.round(channel * (1 - amount));

  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

/**
 * Degradado vertical del banner de una playlist, replicando la misma
 * estructura de paradas (0% / 60% / 100%) que ya usa "Tus favoritos"
 * (.fav-banner en App.css), pero a partir del color aleatorio de la
 * playlist en vez de un verde fijo.
 */
export function getPlaylistGradient(color: string): string {
  const midTone = mixWithBlack(color, 0.45);
  return `linear-gradient(180deg, ${color} 0%, ${midTone} 60%, #121212 100%)`;
}
