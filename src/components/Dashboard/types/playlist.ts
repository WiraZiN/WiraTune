import type { SortKey } from '../constants';

export interface Playlist {
  id: number;
  name: string;
  description: string;
  /** Data URL (FileReader) de la foto elegida por el usuario, o null si usa el ícono por defecto. */
  coverImage: string | null;
  /** Color base aleatorio usado para el degradado del banner (ver utils/colors.ts). */
  color: string;
  songIds: number[];
  sortKey: SortKey;
  createdAt: Date;
}
