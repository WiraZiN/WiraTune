import { useMemo, useState } from 'react';
import type { Song } from '../types/song';
import { MusicSvg } from '../../../icons/music-svg';

interface AddSongsToPlaylistModalProps {
  librarySongs: Song[];
  playlistSongIds: number[];
  onClose: () => void;
  onConfirm: (songIds: number[]) => void;
}

export function AddSongsToPlaylistModal({
  librarySongs,
  playlistSongIds,
  onClose,
  onConfirm,
}: AddSongsToPlaylistModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Song[]>([]);

  const availableSongs = useMemo(() => {
    const selectedIds = new Set(selected.map(song => song.id));
    const alreadyInPlaylist = new Set(playlistSongIds);
    const normalizedQuery = query.trim().toLowerCase();

    return librarySongs.filter(song => {
      if (alreadyInPlaylist.has(song.id) || selectedIds.has(song.id)) return false;
      if (!normalizedQuery) return true;
      return (
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [librarySongs, playlistSongIds, selected, query]);

  const handleAdd = (song: Song) => setSelected(prev => [...prev, song]);

  const handleRemove = (songId: number) =>
    setSelected(prev => prev.filter(song => song.id !== songId));

  const handleClear = () => setSelected([]);

  const handleConfirm = () => {
    if (!selected.length) return;
    onConfirm(selected.map(song => song.id));
  };

  return (
    <div
      className="modal-bg"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="asp-modal-ttl">
        <div className="modal-hdr">
          <span className="modal-ttl" id="asp-modal-ttl">Agregar canciones</span>
          <button className="btn-close" type="button" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-bdy asp-bdy">
          <input
            className="field-input asp-search-input"
            type="text"
            placeholder="Buscar canciones de tu biblioteca"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />

          <div className="asp-panel">
            <p className="asp-section-ttl">Canciones de tu biblioteca</p>
            <ul className="asp-list">
              {availableSongs.length === 0 ? (
                <li className="asp-empty">No hay más canciones para agregar.</li>
              ) : (
                availableSongs.map(song => (
                  <li className="pend-item" key={song.id}>
                    <MusicSvg color='#fff' width='2em' height='2em'/>
                    <div className="pend-meta">
                      <div className="pend-ttl">{song.title}</div>
                      <div className="pend-art">{song.artist}</div>
                    </div>
                    <button
                      className="asp-add-btn"
                      type="button"
                      aria-label={`Agregar ${song.title}`}
                      onClick={() => handleAdd(song)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <use href="#icon-plus" />
                      </svg>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="asp-panel">
            <div className="pending-hdr">
              <span className="pending-cnt">
                {selected.length} canción{selected.length !== 1 ? 'es' : ''} seleccionada
                {selected.length !== 1 ? 's' : ''}
              </span>
              <button className="btn-clr" type="button" onClick={handleClear}>
                Limpiar
              </button>
            </div>

            {selected.length === 0 ? (
              <p className="asp-placeholder">Aquí aparecerán las canciones que selecciones.</p>
            ) : (
              <ul className="pending-lst">
                {selected.map(song => (
                  <li className="pend-item" key={song.id}>
                    <MusicSvg color='#fff' width='3em' height='3em'/>
                    <div className="pend-meta">
                      <div className="pend-ttl">{song.title}</div>
                      <div className="pend-art">{song.artist}</div>
                    </div>
                    <button
                      className="pend-rm"
                      type="button"
                      aria-label={`Quitar ${song.title}`}
                      onClick={() => handleRemove(song.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="modal-ftr">
          <button className="btn-add-lib text-sm m-3" type="button" onClick={handleConfirm}>
            Agregar a la playlist
          </button>
        </div>
      </div>
    </div>
  );
}
