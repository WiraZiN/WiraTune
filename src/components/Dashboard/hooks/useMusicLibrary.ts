import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { SORT_OPTIONS, SUPPORTED_AUDIO_FILE_PATTERN, type SortKey } from '../constants';
import { readAudioDuration, readId3Tags } from '../services/audioMetadata';
import { resolveMetadata } from '../services/songMetadata';
import type { Song } from '../types/song';
import { Format } from '../utils/format';

export type LibraryView = 'biblioteca' | 'favoritos';

interface LibraryState {
  songs: Song[];
  pending: Song[];
  sortKey: SortKey;
  view: LibraryView;
  playingSource: 'favoritos' | 'biblioteca' | null;
}

/**
 * Module-level store shared by every component that calls useMusicLibrary().
 *
 * SidebarIzquierdo y Dashboard son componentes hermanos: no hay forma de
 * compartir estado entre ellos solo con props sin tocar el componente padre
 * (App). Para no depender de ese archivo (no incluido aquí), el estado de
 * la biblioteca vive en este módulo y se sincroniza entre todas las
 * instancias del hook mediante useSyncExternalStore. La API pública del
 * hook no cambia para quien ya lo consumía (Dashboard.tsx), solo se agregan
 * los campos nuevos: `view`, `setView` y `favoriteSongs`.
 */
let state: LibraryState = {
  songs: [],
  pending: [],
  sortKey: 'custom',
  view: 'biblioteca',
  playingSource: null,
};

let uid = 0;
const nextId = () => {
  uid += 1;
  return uid;
};

const listeners = new Set<() => void>();

function setState(
  patch: Partial<LibraryState> | ((prev: LibraryState) => Partial<LibraryState>),
) {
  const resolved = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...resolved };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useMusicLibrary() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const { songs, pending, sortKey, view, playingSource } = snapshot;

  const sortedSongs = useMemo(() => {
    const sorted = [...songs];

    switch (sortKey) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'recent':
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'duration':
        return sorted.sort((a, b) => a.dur - b.dur);
      default:
        return sorted;
    }
  }, [songs, sortKey]);

  const favoriteSongs = useMemo(() => songs.filter(song => song.isFav), [songs]);
  const favoriteCount = favoriteSongs.length;

  const totalDurationSeconds = useMemo(
    () => songs.reduce((sum, song) => sum + (song.dur || 0), 0),
    [songs],
  );

  const activeSortLabel = SORT_OPTIONS.find(option => option.value === sortKey)?.label ?? '';

  const processFiles = useCallback(async (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file =>
      SUPPORTED_AUDIO_FILE_PATTERN.test(file.name),
    );
    if (!validFiles.length) return;

    const builtSongs = await Promise.all(
      validFiles.map(async file => {
        const [duration, tags] = await Promise.all([
          readAudioDuration(file),
          readId3Tags(file),
        ]);
        const { title, artist } = resolveMetadata(file.name, tags);

        return {
          id: nextId(),
          file,
          title,
          artist,
          dur: duration,
          durFmt: Format.seconds(duration),
          date: new Date(),
          isFav: false,
        };
      }),
    );

    setState(prev => ({ pending: [...prev.pending, ...builtSongs] }));
  }, []);

  const toggleFavoriteSong = useCallback((id: number) => {
    setState(prev => ({
      songs: prev.songs.map(song => (song.id === id ? { ...song, isFav: !song.isFav } : song)),
    }));
  }, []);

  const deleteSong = useCallback((id: number) => {
    setState(prev => ({ songs: prev.songs.filter(song => song.id !== id) }));
  }, []);

  const removePendingAt = useCallback((index: number) => {
    setState(prev => ({
      pending: prev.pending.filter((_, currentIndex) => currentIndex !== index),
    }));
  }, []);

  const clearPending = useCallback(() => setState({ pending: [] }), []);

  const confirmPendingSongs = useCallback(() => {
    if (!state.pending.length) return false;
    setState(prev => ({ songs: [...prev.songs, ...prev.pending], pending: [] }));
    return true;
  }, []);

  const reorderSongs = useCallback((draggedId: number, targetId: number, insertAfter: boolean) => {
    setState(prev => {
      const fromIndex = prev.songs.findIndex(song => song.id === draggedId);
      const targetExists = prev.songs.some(song => song.id === targetId);
      if (fromIndex === -1 || !targetExists) return {};

      const next = [...prev.songs];
      const [moved] = next.splice(fromIndex, 1);
      const newTargetIndex = next.findIndex(song => song.id === targetId);
      next.splice(insertAfter ? newTargetIndex + 1 : newTargetIndex, 0, moved);
      return { songs: next };
    });
  }, []);

  const setSortKey = useCallback((key: SortKey) => setState({ sortKey: key }), []);
  const setView = useCallback((nextView: LibraryView) => setState({ view: nextView }), []);
  const setPlayingSource = useCallback(
    (source: 'favoritos' | 'biblioteca' | null) => setState({ playingSource: source }),
    [],
  );

  return {
    songs,
    pending,
    sortedSongs,
    sortKey,
    activeSortLabel,
    favoriteCount,
    favoriteSongs,
    totalDurationSeconds,
    view,
    playingSource,
    setView,
    setSortKey,
    setPlayingSource,
    processFiles,
    toggleFavoriteSong,
    deleteSong,
    removePendingAt,
    clearPending,
    confirmPendingSongs,
    reorderSongs,
  };
}