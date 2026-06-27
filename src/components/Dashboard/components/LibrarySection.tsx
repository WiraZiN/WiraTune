import type React from 'react';
import musicIcon from '../../../assets/iconWitube.png';
import { ItemBiblioteca } from '../../../interfaces/itemBiblioteca';
import { SORT_OPTIONS, type SortKey } from '../constants';
import type { Song } from '../types/song';
import { SongRow } from './SongRow';
import { SortDropdown } from './SortDropdown';

interface LibrarySectionProps {
  songs: Song[];
  sortKey: SortKey;
  activeSortLabel: string;
  isSortOpen: boolean;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  draggingId: number | null;
  dropIndicator: { id: number; after: boolean } | null;
  activeTrack: ItemBiblioteca | null;
  isPlaying: boolean;
  onAddClick: () => void;
  onWitubeClick: () => void;
  onSortToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSortSelect: (value: SortKey) => void;
  onPlaySong: (songId: number) => void;
  onFavoriteToggle: (id: number) => void;
  onRowContextMenu: (x: number, y: number, songId: number) => void;
  onMoreClick: (event: React.MouseEvent<HTMLButtonElement>, songId: number) => void;
  onRowDragStart: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
  onRowDragEnd: () => void;
  onRowDragOver: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
  onRowDrop: (event: React.DragEvent<HTMLDivElement>, songId: number) => void;
}

export function LibrarySection({
  songs,
  sortKey,
  activeSortLabel,
  isSortOpen,
  sortDropdownRef,
  draggingId,
  dropIndicator,
  activeTrack,
  isPlaying,
  onAddClick,
  onWitubeClick,
  onSortToggle,
  onSortSelect,
  onPlaySong,
  onFavoriteToggle,
  onRowContextMenu,
  onMoreClick,
  onRowDragStart,
  onRowDragEnd,
  onRowDragOver,
  onRowDrop,
}: LibrarySectionProps) {
  return (
    <main>
      <section className="library" aria-labelledby="library-heading">
        <div className="lib-header">
          <div className="lib-header-left">
            <h2 id="library-heading" className="lib-title">
              Tu biblioteca de canciones
            </h2>

            <button className="btn-add" type="button" onClick={onAddClick}>
              + Agregar canciones
            </button>

            <button className="btn-circle" type="button" aria-label="WiTube" onClick={onWitubeClick}>
              <img src={musicIcon} alt="" />
            </button>
          </div>

          <div className="lib-header-right">
            <span className="sort-lbl">Ordenar por</span>
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

        <div className="tbl-wrap" role="table" aria-label="Lista de canciones">
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
              <h3 className="empty-h">No hay canciones todavía</h3>
              <p className="empty-p">Crea una playlist y agrega canciones desde tu PC.</p>
            </div>
          ) : (
            songs.map((song, index) => (
              <SongRow
                key={song.id}
                song={song}
                index={index + 1}
                draggable={sortKey === 'custom'}
                isDragging={draggingId === song.id}
                dropPosition={
                  dropIndicator?.id === song.id
                    ? dropIndicator.after
                      ? 'after'
                      : 'before'
                    : null
                }
                isActive={activeTrack?.id === song.id}
                isPlaying={activeTrack?.id === song.id && isPlaying}
                onPlaySong={onPlaySong}
                onFavoriteToggle={onFavoriteToggle}
                onRowContextMenu={onRowContextMenu}
                onMoreClick={onMoreClick}
                onDragStart={onRowDragStart}
                onDragEnd={onRowDragEnd}
                onDragOver={onRowDragOver}
                onDrop={onRowDrop}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
