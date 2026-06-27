import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import iconFavoritos from '../../../assets/iconfavoritos.png';
import { ItemBiblioteca } from '../../../interfaces/itemBiblioteca';
import { FAVORITES_SORT_OPTIONS, type FavoritesSortKey } from '../constants';
import type { Song } from '../types/song';
import { SongRow } from './SongRow';
import { SortDropdown } from './SortDropdown';

interface FavoritesSectionProps {
  songs: Song[];
  activeTrack: ItemBiblioteca | null;
  isPlaying: boolean;
  onPlaySong: (songId: number) => void;
  onPlayAll: () => void;
  onFavoriteToggle: (id: number) => void;
  onRowContextMenu: (x: number, y: number, songId: number) => void;
  onMoreClick: (event: React.MouseEvent<HTMLButtonElement>, songId: number) => void;
}

export function FavoritesSection({
  songs,
  activeTrack,
  isPlaying,
  onPlaySong,
  onPlayAll,
  onFavoriteToggle,
  onRowContextMenu,
  onMoreClick,
}: FavoritesSectionProps) {
  // "Agregado recientemente" es el orden predeterminado de esta vista.
  const [sortKey, setSortKey] = useState<FavoritesSortKey>('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDdRef = useRef<HTMLDivElement>(null);

  const sortedSongs = useMemo(() => {
    const sorted = [...songs];

    switch (sortKey) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'duration':
        return sorted.sort((a, b) => a.dur - b.dur);
      default:
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }, [songs, sortKey]);

  const activeSortLabel = FAVORITES_SORT_OPTIONS.find(option => option.value === sortKey)?.label ?? '';
  const isQueuePlaying = isPlaying && songs.some(song => song.id === activeTrack?.id);

  const handleSortToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsSortOpen(prev => !prev);
  };

  const handleSortSelect = (value: FavoritesSortKey) => {
    setSortKey(value);
    setIsSortOpen(false);
  };

  return (
    <main>
      <section className="fav-playlist" aria-labelledby="fav-playlist-heading">
        <div className="fav-banner">
          <div className="fav-cover">
            <img src={iconFavoritos} alt="" />
          </div>
          <div className="fav-banner-info">
            <span className="fav-eyebrow">Playlist</span>
            <h1 id="fav-playlist-heading" className="fav-title">
              Tus favoritos
            </h1>
            <p className="fav-count">{songs.length} canciones</p>
          </div>
        </div>

        <div className="fav-toolbar">
          <button
            className={`fav-play-btn${songs.length === 0 ? ' is-disabled' : ''}`}
            type="button"
            aria-label={isQueuePlaying ? 'Pausar Tus favoritos' : 'Reproducir Tus favoritos'}
            disabled={songs.length === 0}
            onClick={onPlayAll}
          >
            {isQueuePlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5V19L19 12L8 5Z" />
              </svg>
            )}
          </button>

          <div className="fav-sort">
            <span className="fav-sort-lbl">Ordenar por</span>
            <SortDropdown
              isOpen={isSortOpen}
              sortKey={sortKey}
              activeLabel={activeSortLabel}
              options={FAVORITES_SORT_OPTIONS}
              dropdownRef={sortDdRef}
              onToggle={handleSortToggle}
              onSelect={handleSortSelect}
            />
          </div>
        </div>

        <div className="fav-table-wrap">
          <div className="tbl-wrap" role="table" aria-label="Tus canciones favoritas">
            <div className="tbl-head" role="row">
              <span className="th th-n" role="columnheader">#</span>
              <span className="th th-t" role="columnheader">Título</span>
              <span className="th th-d" role="columnheader">
                Fecha en que se<br />agregó
              </span>
              <span className="th th-dur" role="columnheader">Duración</span>
              <span className="th th-act" role="columnheader" />
            </div>
            <div className="tbl-line" />

            {sortedSongs.length === 0 ? (
              <div className="empty" role="row">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <use href="#icon-star-filled" />
                </svg>
                <h3 className="empty-h">Las canciones que te gusten aparecerán aquí</h3>
                <p className="empty-p">Guarda canciones tocando el ícono de estrella en cualquier canción.</p>
              </div>
            ) : (
              sortedSongs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={index + 1}
                  draggable={false}
                  isDragging={false}
                  dropPosition={null}
                  isActive={activeTrack?.id === song.id}
                  isPlaying={activeTrack?.id === song.id && isPlaying}
                  onPlaySong={onPlaySong}
                  onFavoriteToggle={onFavoriteToggle}
                  onRowContextMenu={onRowContextMenu}
                  onMoreClick={onMoreClick}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
