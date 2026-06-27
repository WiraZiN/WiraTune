import type React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Resume } from './components/Resume';
import { AddSongsModal } from './components/AddSongsModal';
import { AddSongsToPlaylistModal } from './components/AddSongsToPlaylistModal';
import { EditPlaylistModal } from './components/EditPlaylistModal';
import { FavoritesSection } from './components/FavoritesSection';
import { IconSprite } from './components/IconSprite';
import { LibrarySection } from './components/LibrarySection';
import { SongContextMenu } from './components/SongContextMenu';
import { WitubeModal } from './components/WitubeModal';
import { PlaylistSection } from './PlaylistSection';
import {
  CONTEXT_MENU_FALLBACK_SIZE,
  CONTEXT_MENU_VIEWPORT_GAP,
  SORT_OPTIONS,
  type SortKey,
} from './constants';
import { useMusicLibrary } from './hooks/useMusicLibrary';
import { usePlaylists } from './hooks/usePlaylists';
import type { Song } from './types/song';
import { togglePlayOrSwitch } from './utils/playback';
import { ItemBiblioteca } from '../../interfaces/itemBiblioteca';

interface BodyProps {
  activeTrack?: ItemBiblioteca | null;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  setActiveTrack?: (track: ItemBiblioteca | null) => void;
}

export default function Body(_props: BodyProps) {
  const library = useMusicLibrary();
  const playlists = usePlaylists();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWitubeModalOpen, setIsWitubeModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPlaylistSortOpen, setIsPlaylistSortOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [editPlaylistState, setEditPlaylistState] = useState<{
    open: boolean;
    autoPickPhoto: boolean;
  }>({ open: false, autoPickPhoto: false });
  const [isDragOver, setIsDragOver] = useState(false);
  const [ctxState, setCtxState] = useState<{ songId: number; x: number; y: number } | null>(null);
  const [ctxPos, setCtxPos] = useState<{ left: number; top: number } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ id: number; after: boolean } | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortDdRef = useRef<HTMLDivElement>(null);
  const playlistSortDdRef = useRef<HTMLDivElement>(null);
  const ctxMenuRef = useRef<HTMLDivElement>(null);
  const dropzoneDragDepthRef = useRef(0);
  const draggedSongIdRef = useRef<number | null>(null);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    library.clearPending();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [library]);

  const closeWitubeModal = useCallback(() => setIsWitubeModalOpen(false), []);

  const closeEditPlaylistModal = useCallback(
    () => setEditPlaylistState({ open: false, autoPickPhoto: false }),
    [],
  );

  const closeAddToPlaylistModal = useCallback(() => setIsAddToPlaylistOpen(false), []);

  const closeContextMenu = useCallback(() => {
    setCtxState(null);
    setCtxPos(null);
  }, []);

  const openContextMenu = (x: number, y: number, songId: number) => {
    setCtxState({ songId, x, y });
  };

  // Fábrica local: tanto el dropdown de orden de "Tu biblioteca" como el de
  // una playlist necesitan el mismo par toggle/select (abrir-cerrar +
  // cerrar el menú contextual al mismo tiempo), solo cambia qué estado
  // togglean y dónde persisten el SortKey elegido.
  const makeSortToggle = (setOpen: React.Dispatch<React.SetStateAction<boolean>>) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      closeContextMenu();
      setOpen(prev => !prev);
    };

  const makeSortSelect =
    (setOpen: React.Dispatch<React.SetStateAction<boolean>>, persist: (value: SortKey) => void) =>
    (value: SortKey) => {
      persist(value);
      setOpen(false);
      closeContextMenu();
    };

  const handleSortToggle = makeSortToggle(setIsSortOpen);
  const handleSortSelect = makeSortSelect(setIsSortOpen, library.setSortKey);

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
    const closeIfOutside = (ref: React.RefObject<HTMLElement | null>, target: Node, close: () => void) => {
      if (ref.current && !ref.current.contains(target)) close();
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      closeIfOutside(sortDdRef, target, () => setIsSortOpen(false));
      closeIfOutside(playlistSortDdRef, target, () => setIsPlaylistSortOpen(false));
      closeIfOutside(ctxMenuRef, target, closeContextMenu);
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
      closeEditPlaylistModal();
      closeAddToPlaylistModal();
      setIsSortOpen(false);
      setIsPlaylistSortOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeContextMenu, closeAddModal, closeWitubeModal, closeEditPlaylistModal, closeAddToPlaylistModal]);

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

    togglePlayOrSwitch({
      alreadyActive: _props.activeTrack?.id === songId && library.playingSource === source,
      isPlaying: Boolean(_props.isPlaying),
      song,
      source,
      setPlayingSource: library.setPlayingSource,
      setActiveTrack: _props.setActiveTrack,
      setIsPlaying: _props.setIsPlaying,
    });
  };

  const handlePlayFavorites = () => {
    if (!library.favoriteSongs.length) return;

    togglePlayOrSwitch({
      alreadyActive:
        library.playingSource === 'favoritos' &&
        library.favoriteSongs.some(song => song.id === _props.activeTrack?.id),
      isPlaying: Boolean(_props.isPlaying),
      song: library.favoriteSongs[0],
      source: 'favoritos',
      setPlayingSource: library.setPlayingSource,
      setActiveTrack: _props.setActiveTrack,
      setIsPlaying: _props.setIsPlaying,
    });
  };

  const playlistSongs = useMemo<Song[]>(() => {
    if (!playlists.selected) return [];

    const songMap = new Map(library.songs.map(song => [song.id, song] as const));
    const resolved = playlists.selected.songIds
      .map(id => songMap.get(id))
      .filter((song): song is Song => Boolean(song));

    switch (playlists.selected.sortKey) {
      case 'title':
        return [...resolved].sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return [...resolved].sort((a, b) => a.artist.localeCompare(b.artist));
      case 'recent':
        return [...resolved].sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'duration':
        return [...resolved].sort((a, b) => a.dur - b.dur);
      default:
        return resolved;
    }
  }, [playlists.selected, library.songs]);

  const playlistActiveSortLabel =
    SORT_OPTIONS.find(option => option.value === playlists.selected?.sortKey)?.label ?? '';

  const isPlaylistQueueActive = Boolean(
    playlists.selected &&
      library.playingSource === 'playlist' &&
      library.playingPlaylistId === playlists.selected.id,
  );

  const handlePlaylistSortToggle = makeSortToggle(setIsPlaylistSortOpen);
  const handlePlaylistSortSelect = makeSortSelect(setIsPlaylistSortOpen, value => {
    if (playlists.selected) playlists.setSortKey(playlists.selected.id, value);
  });

  const handlePlayPlaylistSong = (songId: number) => {
    if (!playlists.selected) return;
    const song = library.songs.find(item => item.id === songId);
    if (!song) return;

    togglePlayOrSwitch({
      alreadyActive: isPlaylistQueueActive && _props.activeTrack?.id === songId,
      isPlaying: Boolean(_props.isPlaying),
      song,
      source: 'playlist',
      playlistId: playlists.selected.id,
      setPlayingSource: library.setPlayingSource,
      setActiveTrack: _props.setActiveTrack,
      setIsPlaying: _props.setIsPlaying,
    });
  };

  const handlePlayPlaylistAll = () => {
    if (!playlists.selected || !playlistSongs.length) return;

    togglePlayOrSwitch({
      alreadyActive:
        isPlaylistQueueActive && playlistSongs.some(song => song.id === _props.activeTrack?.id),
      isPlaying: Boolean(_props.isPlaying),
      song: playlistSongs[0],
      source: 'playlist',
      playlistId: playlists.selected.id,
      setPlayingSource: library.setPlayingSource,
      setActiveTrack: _props.setActiveTrack,
      setIsPlaying: _props.setIsPlaying,
    });
  };

  const openEditPlaylistModal = (autoPickPhoto: boolean) => {
    closeContextMenu();
    setEditPlaylistState({ open: true, autoPickPhoto });
  };

  const handleSaveEditPlaylist = (data: {
    name: string;
    description: string;
    coverImage: string | null;
  }) => {
    if (!playlists.selected) return;
    playlists.renamePlaylist(playlists.selected.id, data.name);
    playlists.setDescription(playlists.selected.id, data.description);
    playlists.setCoverImage(playlists.selected.id, data.coverImage);
    closeEditPlaylistModal();
  };

  const handleConfirmAddToPlaylist = (songIds: number[]) => {
    if (playlists.selected) playlists.addSongs(playlists.selected.id, songIds);
    closeAddToPlaylistModal();
  };

  const activeCtxSong = ctxState
    ? library.songs.find(song => song.id === ctxState.songId)
    : undefined;

  // Solo distinto de null mientras se está viendo una playlist puntual;
  // así el menú contextual sabe cuándo ofrecer "Quitar de esta playlist".
  const currentPlaylist = library.view === 'playlist' ? playlists.selected : null;

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
        ) : currentPlaylist ? (
          <PlaylistSection
            playlist={currentPlaylist}
            songs={playlistSongs}
            activeTrack={isPlaylistQueueActive ? _props.activeTrack ?? null : null}
            isPlaying={isPlaylistQueueActive && Boolean(_props.isPlaying)}
            sortKey={currentPlaylist.sortKey}
            activeSortLabel={playlistActiveSortLabel}
            isSortOpen={isPlaylistSortOpen}
            sortDropdownRef={playlistSortDdRef}
            onPlayAll={handlePlayPlaylistAll}
            onSortToggle={handlePlaylistSortToggle}
            onSortSelect={handlePlaylistSortSelect}
            onPlaySong={handlePlayPlaylistSong}
            onFavoriteToggle={library.toggleFavoriteSong}
            onRowContextMenu={openContextMenu}
            onMoreClick={handleMoreClick}
            onAddSongsClick={() => setIsAddToPlaylistOpen(true)}
            onCoverClick={() => openEditPlaylistModal(true)}
            onTitleClick={() => openEditPlaylistModal(false)}
          />
        ) : (
          <>
            <Resume
              songCount={library.songs.length}
              favoriteCount={library.favoriteCount}
              playlistCount={playlists.playlists.length}
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

      {editPlaylistState.open && playlists.selected && (
        <EditPlaylistModal
          playlist={playlists.selected}
          autoOpenFilePicker={editPlaylistState.autoPickPhoto}
          onClose={closeEditPlaylistModal}
          onSave={handleSaveEditPlaylist}
        />
      )}

      {isAddToPlaylistOpen && playlists.selected && (
        <AddSongsToPlaylistModal
          librarySongs={library.songs}
          playlistSongIds={playlists.selected.songIds}
          onClose={closeAddToPlaylistModal}
          onConfirm={handleConfirmAddToPlaylist}
        />
      )}

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
          onRemoveFromPlaylist={
            currentPlaylist
              ? () => {
                  playlists.removeSong(currentPlaylist.id, ctxState.songId);
                  closeContextMenu();
                }
              : undefined
          }
        />
      )}
    </>
  );
}