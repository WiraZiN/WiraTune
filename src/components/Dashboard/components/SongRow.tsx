import type React from 'react';
import musicIcon from '../../../assets/iconmusic.png';
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
              <path d="M8 5V19L19 12L8 5Z" />
            </svg>
          </span>
          <span className="sr-icon sr-icon-pause" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5H10V19H6V5Z" />
              <path d="M14 5H18V19H14V5Z" />
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
        <img className="sr-note" src={musicIcon} alt="" />
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
