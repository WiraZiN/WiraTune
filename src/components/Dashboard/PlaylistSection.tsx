import type React from 'react';
import { ItemBiblioteca } from '../../interfaces/itemBiblioteca';
import { SORT_OPTIONS, type SortKey } from './constants';
import type { Playlist } from './types/playlist';
import type { Song } from './types/song';
import { SongRow } from './components/SongRow';
import { SortDropdown } from './components/SortDropdown';
import { getPlaylistGradient } from './utils/colors';
import { MusicSvg } from '../../icons/music-svg';

interface PlaylistSectionProps {
  playlist: Playlist;
  songs: Song[];
  activeTrack: ItemBiblioteca | null;
  isPlaying: boolean;
  sortKey: SortKey;
  activeSortLabel: string;
  isSortOpen: boolean;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  onPlayAll: () => void;
  onSortToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSortSelect: (value: SortKey) => void;
  onPlaySong: (songId: number) => void;
  onFavoriteToggle: (id: number) => void;
  onRowContextMenu: (x: number, y: number, songId: number) => void;
  onMoreClick: (event: React.MouseEvent<HTMLButtonElement>, songId: number) => void;
  onAddSongsClick: () => void;
  onCoverClick: () => void;
  onTitleClick: () => void;
}

export function PlaylistSection({
  playlist,
  songs,
  activeTrack,
  isPlaying,
  sortKey,
  activeSortLabel,
  isSortOpen,
  sortDropdownRef,
  onPlayAll,
  onSortToggle,
  onSortSelect,
  onPlaySong,
  onFavoriteToggle,
  onRowContextMenu,
  onMoreClick,
  onAddSongsClick,
  onCoverClick,
  onTitleClick,
}: PlaylistSectionProps) {
  const isQueuePlaying = isPlaying && songs.some(song => song.id === activeTrack?.id);

  const handleCoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCoverClick();
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTitleClick();
    }
  };

  return (
    <main>
      <section className="fav-playlist" aria-labelledby="pl-playlist-heading">
        <div className="fav-banner" style={{ background: getPlaylistGradient(playlist.color) }}>
          <div
            className="fav-cover pl-cover"
            role="button"
            tabIndex={0}
            aria-label="Editar foto de la playlist"
            onClick={onCoverClick}
            onKeyDown={handleCoverKeyDown}
          >
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt="" />
            ) :
              <MusicSvg color='#fff' height='4em' width='4em'/>
            }

            <span className="pl-cover-hover" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="currentColor" d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z" />
              </svg>
              <span className="pl-cover-hover-txt">Elegir foto</span>
            </span>
          </div>

          <div className="playlist-banner-info">
            <span className="fav-eyebrow">Playlist</span>
            <h1
              id="pl-playlist-heading"
              className="fav-title cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={onTitleClick}
              onKeyDown={handleTitleKeyDown}
            >
              {playlist.name}
            </h1>
            <p>{playlist.description}</p>
            <p className="fav-count">
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
            </p>
          </div>
        </div>

        <div className="fav-toolbar">
          <div className="pl-toolbar-left">
            <button
              className={`fav-play-btn${songs.length === 0 ? ' is-disabled' : ''}`}
              type="button"
              aria-label={isQueuePlaying ? 'Pausar playlist' : 'Reproducir playlist'}
              disabled={songs.length === 0}
              onClick={onPlayAll}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <use href={isQueuePlaying ? '#icon-pause' : '#icon-play'} />
              </svg>
            </button>

            <button className="btn-add" type="button" onClick={onAddSongsClick}>
              + Agregar canciones
            </button>
          </div>

          <div className="fav-sort">
            <span className="fav-sort-lbl">Ordenar por</span>
            <SortDropdown
              isOpen={isSortOpen}
              sortKey={sortKey}
              activeLabel={activeSortLabel}
              options={SORT_OPTIONS}
              dropdownRef={sortDropdownRef}
              onToggle={onSortToggle}
              onSelect={onSortSelect}
            />
          </div>
        </div>

        <div className="fav-table-wrap">
          <div className="tbl-wrap" role="table" aria-label={`Canciones de ${playlist.name}`}>
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

            {songs.length === 0 ? (
              <div className="empty" role="row">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <use href="#icon-music-note" />
                </svg>
                <h3 className="empty-h">Esta playlist está vacía</h3>
                <p className="empty-p">Busca canciones para agregar a tu playlist.</p>
              </div>
            ) : (
              songs.map((song, index) => (
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
                  onDragStart={() => { }}
                  onDragEnd={() => { }}
                  onDragOver={() => { }}
                  onDrop={() => { }}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
