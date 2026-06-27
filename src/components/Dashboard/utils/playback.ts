import { ItemBiblioteca } from '../../../interfaces/itemBiblioteca';
import type { PlayingSource } from '../hooks/useMusicLibrary';
import type { Song } from '../types/song';
import { mapSongToTrack } from './mapSongToTrack';

interface TogglePlayOrSwitchParams {
  /** true si la canción/cola que se quiere reproducir ya es la fuente activa. */
  alreadyActive: boolean;
  isPlaying: boolean;
  song: Song;
  source: Exclude<PlayingSource, null>;
  playlistId?: number | null;
  setPlayingSource: (source: PlayingSource, playlistId?: number | null) => void;
  setActiveTrack?: (track: ItemBiblioteca) => void;
  setIsPlaying?: (value: boolean) => void;
}

/**
 * Lógica compartida por todos los botones de play (fila de canción, "play all"
 * de Tus favoritos / una playlist / Tu biblioteca, fila de playlist en el
 * sidebar): si ya es la fuente activa, alterna play/pausa; si no, cambia la
 * fuente activa y arranca la reproducción desde la canción indicada.
 */
export function togglePlayOrSwitch({
  alreadyActive,
  isPlaying,
  song,
  source,
  playlistId = null,
  setPlayingSource,
  setActiveTrack,
  setIsPlaying,
}: TogglePlayOrSwitchParams) {
  if (alreadyActive) {
    setIsPlaying?.(!isPlaying);
    return;
  }

  setPlayingSource(source, playlistId);
  setActiveTrack?.(mapSongToTrack(song));
  setIsPlaying?.(true);
}
