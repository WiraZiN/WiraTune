import type React from 'react';
import musicIcon from '../../../assets/iconmusic.png';
import type { Song } from '../types/song';

interface AddSongsModalProps {
  pendingSongs: Song[];
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onClearPending: () => void;
  onConfirm: () => void;
  onRemovePendingAt: (index: number) => void;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDropzoneDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropzoneDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropzoneDragLeave: () => void;
  onDropzoneDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function AddSongsModal({
  pendingSongs,
  isDragOver,
  fileInputRef,
  onClose,
  onClearPending,
  onConfirm,
  onRemovePendingAt,
  onFileInputChange,
  onDropzoneDragEnter,
  onDropzoneDragOver,
  onDropzoneDragLeave,
  onDropzoneDrop,
}: AddSongsModalProps) {
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div
      className="modal-bg"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-ttl">
        <div className="modal-hdr">
          <span className="modal-ttl" id="modal-ttl">Agregar canciones</span>
          <button className="btn-close" type="button" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-bdy">
          <div
            className={`dropzone${isDragOver ? ' drag-over' : ''}`}
            onClick={openFilePicker}
            onDragEnter={onDropzoneDragEnter}
            onDragOver={onDropzoneDragOver}
            onDragLeave={onDropzoneDragLeave}
            onDrop={onDropzoneDrop}
          >
            <svg className="dz-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <use href="#icon-music-note" />
            </svg>
            <p className="dz-main">Arrastra archivos de música aquí</p>
            <p className="dz-sub">o haz clic para seleccionar desde tu PC</p>
            <button
              className="btn-choose"
              type="button"
              onClick={event => {
                event.stopPropagation();
                openFilePicker();
              }}
            >
              + Elegir archivos
            </button>
            <p className="dz-fmts">MP3, WAV, FLAC, AAC, OGG, M4A</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.flac,.aac,.ogg,.m4a"
              multiple
              hidden
              onChange={onFileInputChange}
            />
          </div>

          {pendingSongs.length > 0 && (
            <div className="pending">
              <div className="pending-hdr">
                <span className="pending-cnt">
                  {pendingSongs.length} archivo{pendingSongs.length !== 1 ? 's' : ''} seleccionado
                  {pendingSongs.length !== 1 ? 's' : ''}
                </span>
                <button className="btn-clr" type="button" onClick={onClearPending}>
                  Limpiar
                </button>
              </div>

              <ul className="pending-lst">
                {pendingSongs.map((song, index) => (
                  <li className="pend-item" key={song.id}>
                    <img className="pend-ico" src={musicIcon} alt="" />
                    <div className="pend-meta">
                      <div className="pend-ttl">{song.title}</div>
                      <div className="pend-art">{song.artist}</div>
                    </div>
                    <span className="pend-dur">{song.durFmt}</span>
                    <button
                      className="pend-rm"
                      type="button"
                      aria-label="Quitar"
                      onClick={() => onRemovePendingAt(index)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <div className="modal-ftr">
                <button className="btn-add-lib" type="button" onClick={onConfirm}>
                  Agregar a tu biblioteca
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

