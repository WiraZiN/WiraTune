import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { SortKey } from '../constants';
import type { Playlist } from '../types/playlist';
import { pickRandomPlaylistColor } from '../utils/colors';

interface PlaylistsState {
  playlists: Playlist[];
  selectedId: number | null;
  editRequestId: number | null;
}

let state: PlaylistsState = {
  playlists: [],
  selectedId: null,
  editRequestId: null,
};

let uid = 0;
const nextId = () => { uid += 1; return uid; };

const listeners = new Set<() => void>();

function setState(
  patch: Partial<PlaylistsState> | ((prev: PlaylistsState) => Partial<PlaylistsState>),
) {
  const resolved = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...resolved };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() { return state; }

function updatePlaylist(
  id: number,
  patch: Partial<Playlist> | ((playlist: Playlist) => Partial<Playlist>),
) {
  setState(prev => ({
    playlists: prev.playlists.map(playlist => {
      if (playlist.id !== id) return playlist;
      const resolved = typeof patch === 'function' ? patch(playlist) : patch;
      return { ...playlist, ...resolved };
    }),
  }));
}

const PLAYLIST_NAME_PATTERN = /^Mi playlist n°(\d+)$/;

function nextPlaylistName(playlists: Playlist[]): string {
  let max = 0;
  playlists.forEach(playlist => {
    const match = playlist.name.match(PLAYLIST_NAME_PATTERN);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `Mi playlist n°${max + 1}`;
}

export function usePlaylists() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const { playlists, selectedId, editRequestId } = snapshot;

  const selected = useMemo(
    () => playlists.find(playlist => playlist.id === selectedId) ?? null,
    [playlists, selectedId],
  );

  const createPlaylist = useCallback(() => {
    const id = nextId();
    const playlist: Playlist = {
      id,
      name: nextPlaylistName(state.playlists),
      description: '',
      coverImage: null,
      color: pickRandomPlaylistColor(),
      songIds: [],
      sortKey: 'custom',
      createdAt: new Date(),
      pinned: false,
    };
    setState(prev => ({ playlists: [...prev.playlists, playlist], selectedId: id }));
    return id;
  }, []);

  const selectPlaylist = useCallback(
    (id: number | null) => setState({ selectedId: id }),
    [],
  );

  const renamePlaylist = useCallback((id: number, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updatePlaylist(id, { name: trimmed });
  }, []);

  const setDescription = useCallback(
    (id: number, description: string) => updatePlaylist(id, { description }),
    [],
  );

  const setCoverImage = useCallback(
    (id: number, coverImage: string | null) => updatePlaylist(id, { coverImage }),
    [],
  );

  const addSongs = useCallback((id: number, songIds: number[]) => {
    updatePlaylist(id, playlist => {
      const existing = new Set(playlist.songIds);
      return { songIds: [...playlist.songIds, ...songIds.filter(sid => !existing.has(sid))] };
    });
  }, []);

  const removeSong = useCallback((id: number, songId: number) => {
    updatePlaylist(id, playlist => ({
      songIds: playlist.songIds.filter(currentId => currentId !== songId),
    }));
  }, []);

  const setSortKey = useCallback(
    (id: number, key: SortKey) => updatePlaylist(id, { sortKey: key }),
    [],
  );

  const togglePinned = useCallback(
    (id: number) => updatePlaylist(id, playlist => ({ pinned: !playlist.pinned })),
    [],
  );

  const deletePlaylist = useCallback((id: number) => {
    setState(prev => ({
      playlists: prev.playlists.filter(p => p.id !== id),
      selectedId: prev.selectedId === id ? null : prev.selectedId,
    }));
  }, []);

  const requestEditPlaylist = useCallback(
    (id: number) => setState({ editRequestId: id }),
    [],
  );

  const clearEditRequest = useCallback(
    () => setState({ editRequestId: null }),
    [],
  );

  return {
    playlists,
    selectedId,
    selected,
    editRequestId,
    createPlaylist,
    selectPlaylist,
    renamePlaylist,
    setDescription,
    setCoverImage,
    addSongs,
    removeSong,
    setSortKey,
    togglePinned,
    deletePlaylist,
    requestEditPlaylist,
    clearEditRequest,
  };
}