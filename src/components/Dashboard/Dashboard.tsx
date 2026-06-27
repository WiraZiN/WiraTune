import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Resume } from './components/Resume';
import { AddSongsModal } from './components/AddSongsModal';
import { FavoritesSection } from './components/FavoritesSection';
import { IconSprite } from './components/IconSprite';
import { LibrarySection } from './components/LibrarySection';
import { SongContextMenu } from './components/SongContextMenu';
import { WitubeModal } from './components/WitubeModal';
import {
  CONTEXT_MENU_FALLBACK_SIZE,
  CONTEXT_MENU_VIEWPORT_GAP,
  type SortKey,
} from './constants';
import { useMusicLibrary } from './hooks/useMusicLibrary';
import { mapSongToTrack } from './utils/mapSongToTrack';
import { ItemBiblioteca } from '../../interfaces/itemBiblioteca';

interface BodyProps {
  activeTrack?: ItemBiblioteca | null;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  setActiveTrack?: (track: ItemBiblioteca | null) => void;
}

export default function Body(_props: BodyProps) {
  const library = useMusicLibrary();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWitubeModalOpen, setIsWitubeModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [ctxState, setCtxState] = useState<{ songId: number; x: number; y: number } | null>(null);
  const [ctxPos, setCtxPos] = useState<{ left: number; top: number } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: number; after: boolean } | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortDdRef = useRef<HTMLDivElement>(null);
  const ctxMenuRef = useRef<HTMLDivElement>(null);
  const dropzoneDragDepthRef = useRef(0);
  const draggedSongIdRef = useRef<number | null>(null);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    library.clearPending();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [library]);

  const closeWitubeModal = useCallback(() => setIsWitubeModalOpen(false), []);

  const closeContextMenu = useCallback(() => {
    setCtxState(null);
    setCtxPos(null);
  }, []);

  const openContextMenu = (x: number, y: number, songId: number) => {
    setCtxState({ songId, x, y });
  };

  const handleSortToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    closeContextMenu();
    setIsSortOpen(prev => !prev);
  };

  const handleSortSelect = (value: SortKey) => {
    library.setSortKey(value);
    setIsSortOpen(false);
    closeContextMenu();
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>, songId: number) => {
    event.stopPropagation();

    if (ctxState?.songId === songId) {
      closeContextMenu();
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = ctxMenuRef.current?.offsetWidth || CONTEXT_MENU_FALLBACK_SIZE.width;
    openContextMenu(buttonRect.right - menuWidth, buttonRect.bottom + 6, songId);
  };

  useLayoutEffect(() => {
    if (!ctxState) return;

    const menuWidth = ctxMenuRef.current?.offsetWidth || CONTEXT_MENU_FALLBACK_SIZE.width;
    const menuHeight = ctxMenuRef.current?.offsetHeight || CONTEXT_MENU_FALLBACK_SIZE.height;
    const maxLeft = window.innerWidth - menuWidth - CONTEXT_MENU_VIEWPORT_GAP;
    const maxTop = window.innerHeight - menuHeight - CONTEXT_MENU_VIEWPORT_GAP;

    setCtxPos({
      left: Math.max(CONTEXT_MENU_VIEWPORT_GAP, Math.min(ctxState.x, maxLeft)),
      top: Math.max(CONTEXT_MENU_VIEWPORT_GAP, Math.min(ctxState.y, maxTop)),
    });
  }, [ctxState]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (sortDdRef.current && !sortDdRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (ctxMenuRef.current && !ctxMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [closeContextMenu]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeContextMenu();
      closeAddModal();
      closeWitubeModal();
      setIsSortOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeContextMenu, closeAddModal, closeWitubeModal]);

  const handleDropzoneDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropzoneDragDepthRef.current += 1;
    if (dropzoneDragDepthRef.current === 1) setIsDragOver(true);
  };

  const handleDropzoneDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDropzoneDragLeave = () => {
    dropzoneDragDepthRef.current = Math.max(0, dropzoneDragDepthRef.current - 1);
    if (dropzoneDragDepthRef.current === 0) setIsDragOver(false);
  };

  const handleDropzoneDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dropzoneDragDepthRef.current = 0;
    setIsDragOver(false);
    library.processFiles(event.dataTransfer.files);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) library.processFiles(event.target.files);
  };

  const handleClearPending = () => {
    library.clearPending();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmAdd = () => {
    if (!library.confirmPendingSongs()) return;
    setIsAddModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRowDragStart = (event: React.DragEvent<HTMLDivElement>, songId: number) => {
    if ((event.target as HTMLElement).closest('button, a, input')) {
      event.preventDefault();
      return;
    }

    draggedSongIdRef.current = songId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(songId));
    setTimeout(() => setDraggingId(songId), 0);
  };

  const handleRowDragEnd = () => {
    draggedSongIdRef.current = null;
    setDraggingId(null);
    setDropIndicator(null);
  };

  const handleRowDragOver = (event: React.DragEvent<HTMLDivElement>, songId: number) => {
    event.preventDefault();
    if (draggedSongIdRef.current === songId) return;

    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    setDropIndicator({ id: songId, after: event.clientY >= rect.top + rect.height / 2 });
  };

  const handleRowDrop = (event: React.DragEvent<HTMLDivElement>, songId: number) => {
    event.preventDefault();
    const draggedId = draggedSongIdRef.current;
    if (draggedId === null || draggedId === songId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    library.reorderSongs(draggedId, songId, event.clientY >= rect.top + rect.height / 2);
    setDropIndicator(null);
  };

  const handlePlaySong = (songId: number) => {
    const song = library.songs.find(item => item.id === songId);
    if (!song) return;

    const source = library.view === 'favoritos' ? 'favoritos' : 'biblioteca';
    const isCurrentTrackFromSameSource =
      _props.activeTrack?.id === songId && library.playingSource === source;

    if (isCurrentTrackFromSameSource) {
      _props.setIsPlaying?.(!_props.isPlaying);
      return;
    }

    library.setPlayingSource(source);
    _props.setActiveTrack?.(mapSongToTrack(song));
    _props.setIsPlaying?.(true);
  };

  const handlePlayFavorites = () => {
    if (!library.favoriteSongs.length) return;

    const isFavoriteTrackActive =
      library.playingSource === 'favoritos' &&
      library.favoriteSongs.some(song => song.id === _props.activeTrack?.id);

    if (isFavoriteTrackActive) {
      _props.setIsPlaying?.(!_props.isPlaying);
      return;
    }

    library.setPlayingSource('favoritos');
    _props.setActiveTrack?.(mapSongToTrack(library.favoriteSongs[0]));
    _props.setIsPlaying?.(true);
  };

  const activeCtxSong = ctxState
    ? library.songs.find(song => song.id === ctxState.songId)
    : undefined;

  return (
    <>
      <IconSprite />

      <div id="app">
        {library.view === 'favoritos' ? (
          <FavoritesSection
            songs={library.favoriteSongs}
            activeTrack={library.playingSource === 'favoritos' ? _props.activeTrack ?? null : null}
            isPlaying={library.playingSource === 'favoritos' && Boolean(_props.isPlaying)}
            onPlaySong={handlePlaySong}
            onPlayAll={handlePlayFavorites}
            onFavoriteToggle={library.toggleFavoriteSong}
            onRowContextMenu={openContextMenu}
            onMoreClick={handleMoreClick}
          />
        ) : (
          <>
            <Resume
              songCount={library.songs.length}
              favoriteCount={library.favoriteCount}
              totalDurationSeconds={library.totalDurationSeconds}
            />

            <LibrarySection
              songs={library.sortedSongs}
              sortKey={library.sortKey}
              activeSortLabel={library.activeSortLabel}
              isSortOpen={isSortOpen}
              sortDropdownRef={sortDdRef}
              draggingId={draggingId}
              dropIndicator={dropIndicator}
              activeTrack={library.playingSource === 'biblioteca' ? _props.activeTrack ?? null : null}
              isPlaying={library.playingSource === 'biblioteca' && Boolean(_props.isPlaying)}
              onAddClick={() => setIsAddModalOpen(true)}
              onWitubeClick={() => setIsWitubeModalOpen(true)}
              onSortToggle={handleSortToggle}
              onSortSelect={handleSortSelect}
              onPlaySong={handlePlaySong}
              onFavoriteToggle={library.toggleFavoriteSong}
              onRowContextMenu={openContextMenu}
              onMoreClick={handleMoreClick}
              onRowDragStart={handleRowDragStart}
              onRowDragEnd={handleRowDragEnd}
              onRowDragOver={handleRowDragOver}
              onRowDrop={handleRowDrop}
            />
          </>
        )}
      </div>

      {isAddModalOpen && (
        <AddSongsModal
          pendingSongs={library.pending}
          isDragOver={isDragOver}
          fileInputRef={fileInputRef}
          onClose={closeAddModal}
          onClearPending={handleClearPending}
          onConfirm={handleConfirmAdd}
          onRemovePendingAt={library.removePendingAt}
          onFileInputChange={handleFileInputChange}
          onDropzoneDragEnter={handleDropzoneDragEnter}
          onDropzoneDragOver={handleDropzoneDragOver}
          onDropzoneDragLeave={handleDropzoneDragLeave}
          onDropzoneDrop={handleDropzoneDrop}
        />
      )}

      {isWitubeModalOpen && <WitubeModal onClose={closeWitubeModal} />}

      {ctxState && (
        <SongContextMenu
          song={activeCtxSong}
          position={{ left: ctxPos?.left ?? ctxState.x, top: ctxPos?.top ?? ctxState.y }}
          menuRef={ctxMenuRef}
          onToggleFavorite={() => {
            library.toggleFavoriteSong(ctxState.songId);
            closeContextMenu();
          }}
          onDelete={() => {
            library.deleteSong(ctxState.songId);
            closeContextMenu();
          }}
        />
      )}
    </>
  );
}