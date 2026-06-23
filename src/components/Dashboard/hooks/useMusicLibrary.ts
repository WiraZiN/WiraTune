import { useCallback, useMemo, useRef, useState } from 'react';
import { SORT_OPTIONS, SUPPORTED_AUDIO_FILE_PATTERN, type SortKey } from '../constants';
import { readAudioDuration, readId3Tags } from '../services/audioMetadata';
import { resolveMetadata } from '../services/songMetadata';
import type { Song } from '../types/song';
import { Format } from '../utils/format';

export function useMusicLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [pending, setPending] = useState<Song[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('custom');
  const uidRef = useRef(0);

  const nextId = () => {
    uidRef.current += 1;
    return uidRef.current;
  };

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

  const favoriteCount = useMemo(() => songs.filter(song => song.isFav).length, [songs]);

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

    setPending(prev => [...prev, ...builtSongs]);
  }, []);

  const toggleFavoriteSong = (id: number) => {
    setSongs(prev => prev.map(song => (song.id === id ? { ...song, isFav: !song.isFav } : song)));
  };

  const deleteSong = (id: number) => {
    setSongs(prev => prev.filter(song => song.id !== id));
  };

  const removePendingAt = (index: number) => {
    setPending(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearPending = () => setPending([]);

  const confirmPendingSongs = () => {
    if (!pending.length) return false;
    setSongs(prev => [...prev, ...pending]);
    setPending([]);
    return true;
  };

  const reorderSongs = (draggedId: number, targetId: number, insertAfter: boolean) => {
    setSongs(prev => {
      const fromIndex = prev.findIndex(song => song.id === draggedId);
      const targetExists = prev.some(song => song.id === targetId);
      if (fromIndex === -1 || !targetExists) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      const newTargetIndex = next.findIndex(song => song.id === targetId);
      next.splice(insertAfter ? newTargetIndex + 1 : newTargetIndex, 0, moved);
      return next;
    });
  };

  return {
    songs,
    pending,
    sortedSongs,
    sortKey,
    activeSortLabel,
    favoriteCount,
    totalDurationSeconds,
    setSortKey,
    processFiles,
    toggleFavoriteSong,
    deleteSong,
    removePendingAt,
    clearPending,
    confirmPendingSongs,
    reorderSongs,
  };
}

