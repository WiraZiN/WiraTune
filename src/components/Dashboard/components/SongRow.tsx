import type React from 'react';
import type { Song } from '../types/song';
import { Format } from '../utils/format';

interface SongRowProps {
  song: Song;
  index: number;
  draggable: boolean;
  isDragging: boolean;
  dropPosition: 'before' | 'after' | null;
  isActive: boolean;
  isPlaying: boolean;
  onPlaySong: (songId: number) => void;
  onFavoriteToggle: (id: number) => void;
  onRowContextMenu: (x: number, y: number, songId: number) => void;
  onMoreClick: (event: React.MouseEvent<HTMLButtonElement>, songId: number) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
  onDragEnd: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
}

export function SongRow({
  song,
  index,
  draggable,
  isDragging,
  dropPosition,
  isActive,
  isPlaying,
  onPlaySong,
  onFavoriteToggle,
  onRowContextMenu,
  onMoreClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: SongRowProps) {
  const classNames = ['song-row'];
  if (draggable) classNames.push('is-draggable');
  if (isDragging) classNames.push('row-dragging');
  if (isActive) classNames.push('is-active-track');
  if (isPlaying) classNames.push('is-playing');
  if (dropPosition === 'before') classNames.push('drop-before');
  if (dropPosition === 'after') classNames.push('drop-after');

  const playLabel =
    isActive && isPlaying ? `Pausar ${song.title}` : `Reproducir ${song.title}`;

  return (
    <div
      className={classNames.join(' ')}
      role="row"
      draggable={draggable}
      onContextMenu={event => {
        event.preventDefault();
        onRowContextMenu(event.clientX, event.clientY, song.id);
      }}
      onDragStart={event => onDragStart(event, song.id)}
      onDragEnd={onDragEnd}
      onDragOver={event => onDragOver(event, song.id)}
      onDrop={event => onDrop(event, song.id)}
    >
      <div className="sr-num" role="cell">
        <span className="sr-num-txt">{index}</span>
        <button
          className="sr-play"
          type="button"
          aria-label={playLabel}
          onClick={() => onPlaySong(song.id)}
        >
          <span className="sr-icon sr-icon-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <use href="#icon-play" />
            </svg>
          </span>
          <span className="sr-icon sr-icon-pause" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <use href="#icon-pause" />
            </svg>
          </span>
          <span className="sr-icon sr-icon-eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div className="sr-info" role="cell">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M19.978 4.251c.141-.013.272.1.272.255v9.07a3.5 3.5 0 0 0-2.062-.665c-1.977 0-3.563 1.621-3.563 3.6s1.586 3.6 3.563 3.6c1.976 0 3.562-1.622 3.562-3.6V4.506c0-1.029-.88-1.843-1.91-1.749l-10.375.956a1.753 1.753 0 0 0-1.59 1.748v9.254a3.5 3.5 0 0 0-2.062-.664c-1.977 0-3.563 1.621-3.563 3.6c0 1.978 1.586 3.599 3.563 3.599c1.976 0 3.562-1.62 3.562-3.6V5.462c0-.135.102-.243.228-.254z" />
        </svg>

        <div className="sr-meta">
          <span className="sr-title">{song.title}</span>
          <span className="sr-artist">{song.artist}</span>
        </div>
      </div>

      <span className="sr-date" role="cell">
        {Format.date(song.date)}
      </span>
      <span className="sr-dur" role="cell">
        {song.durFmt}
      </span>

      <div className="sr-acts" role="cell">
        <button
          className={`sr-btn${song.isFav ? ' fav-active' : ''}`}
          type="button"
          aria-label={song.isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={() => onFavoriteToggle(song.id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href={song.isFav ? '#icon-star-filled' : '#icon-star-outline'} />
          </svg>
        </button>
        <button
          className="sr-btn"
          type="button"
          aria-label="Más opciones"
          onClick={event => onMoreClick(event, song.id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href="#icon-dots" />
          </svg>
        </button>
      </div>
    </div>
  );
}
