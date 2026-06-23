import type React from 'react';
import type { Song } from '../types/song';

interface SongContextMenuProps {
  song: Song | undefined;
  position: { left: number; top: number };
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

export function SongContextMenu({
  song,
  position,
  menuRef,
  onToggleFavorite,
  onDelete,
}: SongContextMenuProps) {
  return (
    <div
      className="ctx-menu"
      role="menu"
      ref={menuRef}
      style={{ left: position.left, top: position.top }}
    >
      <button className="ctx-item ctx-fav" type="button" role="menuitem" onClick={onToggleFavorite}>
        <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <use href="#icon-star-filled" />
        </svg>
        <span>{song?.isFav ? 'Quitar de Tus favoritos' : 'Guardar en Tus favoritos'}</span>
      </button>
      <button className="ctx-item ctx-del" type="button" role="menuitem" onClick={onDelete}>
        <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <use href="#icon-trash" />
        </svg>
        Eliminar de tu Biblioteca
      </button>
    </div>
  );
}

