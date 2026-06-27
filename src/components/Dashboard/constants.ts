export const SUPPORTED_AUDIO_FILE_PATTERN = /\.(mp3|wav|flac|aac|ogg|m4a)$/i;
export const AUDIO_METADATA_TIMEOUT_MS = 7000;

export const SPANISH_MONTH_ABBREVIATIONS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export type SortKey = 'custom' | 'title' | 'artist' | 'recent' | 'duration';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'custom', label: 'Orden personalizado' },
  { value: 'title', label: 'Título' },
  { value: 'artist', label: 'Artista' },
  { value: 'recent', label: 'Agregado recientemente' },
  { value: 'duration', label: 'Duración' },
];

export const CONTEXT_MENU_FALLBACK_SIZE = { width: 218, height: 100 };
export const CONTEXT_MENU_VIEWPORT_GAP = 8;

// Sort options for the "Tus favoritos" playlist view.
// No "Orden personalizado" here since that option only makes sense
// for the drag-and-drop reorderable main library.
export type FavoritesSortKey = 'title' | 'artist' | 'recent' | 'duration';

export const FAVORITES_SORT_OPTIONS: { value: FavoritesSortKey; label: string }[] = [
  { value: 'title', label: 'Título' },
  { value: 'artist', label: 'Artista' },
  { value: 'recent', label: 'Agregado recientemente' },
  { value: 'duration', label: 'Duración' },
];

