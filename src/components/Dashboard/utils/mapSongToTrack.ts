import { ItemBiblioteca } from '../../../interfaces/itemBiblioteca';
import type { Song } from '../types/song';

/**
 * Convierte una Song de la biblioteca al shape ItemBiblioteca que espera
 * el reproductor (Reproduccion) y el resto de la app. Se extrajo de
 * Dashboard.tsx para poder reutilizarla también desde SidebarIzquierdo
 * (por ejemplo, al reproducir la primera canción de "Tus favoritos").
 */
export function mapSongToTrack(song: Song): ItemBiblioteca {
  return {
    id: song.id,
    nombre: song.title,
    tipo: 'song',
    fechaAgregado: song.date,
    artista: song.artist,
    file: song.file,
    title: song.title,
    dur: song.dur,
    durFmt: song.durFmt,
  };
}
