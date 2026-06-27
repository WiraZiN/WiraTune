import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Playlist } from '../types/playlist';

interface EditPlaylistModalProps {
  playlist: Playlist;
  /** Si es true, al montar el modal se abre automáticamente el selector de foto. */
  autoOpenFilePicker: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; coverImage: string | null }) => void;
}

export function EditPlaylistModal({
  playlist,
  autoOpenFilePicker,
  onClose,
  onSave,
}: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [coverImage, setCoverImage] = useState<string | null>(playlist.coverImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Se ejecuta una sola vez al abrir el modal: si vino del click en el
  // ícono de la playlist, abre el selector de foto automáticamente.
  useEffect(() => {
    if (autoOpenFilePicker) {
      fileInputRef.current?.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    autoOpenFilePicker = false // this exit two call
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleSave = () => {
    onSave({
      name: name.trim() || playlist.name,
      description,
      coverImage,
    });
  };

  const coverHint = (
    <>
      <svg className="em-pencil-ico" viewBox="0 0 24 24" fill="currentColor">
        <use href="#icon-edit" />
      </svg>
      <span className="em-cover-label">Elegir foto</span>
    </>
  );

  return (
    <div
      className="modal-bg"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal em-modal" role="dialog" aria-modal="true" aria-labelledby="em-modal-ttl">
        <div className="modal-hdr">
          <span className="modal-ttl" id="em-modal-ttl">Editar datos</span>
          <button className="btn-close" type="button" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-bdy em-bdy">
          <div
            className="em-cover"
            role="button"
            tabIndex={0}
            aria-label="Elegir foto"
            onClick={openFilePicker}
            onKeyDown={handleCoverKeyDown}
          >
            {coverImage ? (
              <>
                <img className="em-cover-img" src={coverImage} alt="" />
                <span className="em-cover-overlay" aria-hidden="true">{coverHint}</span>
              </>
            ) : (
              <span className="em-cover-placeholder" aria-hidden="true">{coverHint}</span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </div>

          <div className="em-fields">
            <input
              className="field-input em-name-input"
              type="text"
              value={name}
              maxLength={100}
              aria-label="Nombre de la playlist"
              onChange={event => setName(event.target.value)}
            />
            <textarea
              className="field-input em-desc-input"
              placeholder="Agrega una descripción opcional"
              value={description}
              maxLength={300}
              aria-label="Descripción de la playlist"
              onChange={event => setDescription(event.target.value)}
            />
          </div>
        </div>

        <div className="em-footer-row">
          <p className="em-disclaimer">
            Al continuar, permites el acceso a la imagen que decides subir. Asegúrate de tener
            los derechos para subir la imagen.
          </p>
          <button className="btn-add-lib shrink-0" type="button" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
