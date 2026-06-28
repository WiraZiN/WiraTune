import { useRef, useState } from 'react';
import type React from 'react';
import type { Playlist } from '../types/playlist';
import type { Song } from '../types/song';

interface SongContextMenuProps {
  song: Song | undefined;
  position: { left: number; top: number };
  menuRef: React.RefObject<HTMLDivElement | null>;
  playlists: Playlist[];
  context: 'library' | 'favorites' | 'playlist';
  onToggleFavorite: () => void;
  onDelete?: () => void;
  onRemoveFromPlaylist?: () => void;
  onToggleInPlaylist: (playlistId: number, currentlyIn: boolean) => void;
}

export function SongContextMenu({
  song,
  position,
  menuRef,
  playlists,
  context,
  onToggleFavorite,
  onDelete,
  onRemoveFromPlaylist,
  onToggleInPlaylist,
}: SongContextMenuProps) {
  const [showSub, setShowSub] = useState(false);
  const [subPos, setSubPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isFav = context === 'favorites' || Boolean(song?.isFav);

  const openSub = () => {
    clearTimeout(closeTimer.current);
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect();
      const subWidth = 200;
      const left = rect.right + 4 + subWidth > window.innerWidth
        ? rect.left - subWidth - 4
        : rect.right + 4;
      setSubPos({ left, top: rect.top });
    }
    setShowSub(true);
  };

  const scheduledClose = () => {
    closeTimer.current = setTimeout(() => setShowSub(false), 120);
  };

  const cancelClose = () => clearTimeout(closeTimer.current);

  return (
    <>
      <div
        className="ctx-menu"
        role="menu"
        ref={menuRef}
        style={{ left: position.left, top: position.top }}
      >
        {/* Agregar a Playlist */}
        <button
          ref={addBtnRef}
          className="ctx-item"
          type="button"
          role="menuitem"
          onMouseEnter={openSub}
          onMouseLeave={scheduledClose}
        >
          <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href="#icon-plus" />
          </svg>
          <span>Agregar a Playlist</span>
          <svg
            className="ctx-ico"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{ marginLeft: 'auto' }}
          >
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        {/* Favorito toggle */}
        <button
          className={`ctx-item${isFav ? ' ctx-del' : ''}`}
          type="button"
          role="menuitem"
          onClick={onToggleFavorite}
        >
          <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href={isFav ? '#icon-star-filled' : '#icon-star-outline'} />
          </svg>
          <span>{isFav ? 'Quitar de Tus favoritos' : 'Guardar en Tus favoritos'}</span>
        </button>

        {/* Eliminar de la playlist (solo en contexto playlist) */}
        {context === 'playlist' && onRemoveFromPlaylist && (
          <button
            className="ctx-item ctx-del"
            type="button"
            role="menuitem"
            onClick={onRemoveFromPlaylist}
          >
            <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <use href="#icon-remove-circle" />
            </svg>
            <span>Eliminar de la playlist</span>
          </button>
        )}

        {/* Eliminar de tu Biblioteca (solo en contexto library) */}
        {context === 'library' && onDelete && (
          <button className="ctx-item ctx-del" type="button" role="menuitem" onClick={onDelete}>
            <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <use href="#icon-trash" />
            </svg>
            <span>Eliminar de tu Biblioteca</span>
          </button>
        )}
      </div>

      {/* Submenu de playlists */}
      {showSub && (
        <div
          className="ctx-menu"
          role="menu"
          style={{ left: subPos.left, top: subPos.top, position: 'fixed' }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduledClose}
        >
          {playlists.length === 0 ? (
            <span className="ctx-item" style={{ cursor: 'default', color: '#a7a7a7' }}>
              Sin playlists creadas
            </span>
          ) : (
            playlists.map(playlist => {
              const currentlyIn = song ? playlist.songIds.includes(song.id) : false;
              return (
                <button
                  key={playlist.id}
                  className="ctx-item"
                  type="button"
                  role="menuitem"
                  onClick={() => onToggleInPlaylist(playlist.id, currentlyIn)}
                  style={{ justifyContent: 'space-between' }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {playlist.name}
                  </span>
                  {currentlyIn && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ width: 16, height: 16, flexShrink: 0, marginLeft: 8, color: '#1db954' }}
                      aria-hidden="true"
                    >
                      <use href="#icon-check" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </>
  );
}