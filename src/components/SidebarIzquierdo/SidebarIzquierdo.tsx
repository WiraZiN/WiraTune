import React, { useEffect, useMemo, useRef, useState } from "react";
import iconFavoritos from "../../assets/iconfavoritos.png";
import { ItemBiblioteca } from "../../interfaces/itemBiblioteca";
import { useMusicLibrary } from "../Dashboard/hooks/useMusicLibrary";
import { usePlaylists } from "../Dashboard/hooks/usePlaylists";
import type { Playlist } from "../Dashboard/types/playlist";
import { togglePlayOrSwitch } from "../Dashboard/utils/playback";
import { MusicSvg } from "../../icons/music-svg";

type OrdenType = "recientes" | "alfabetico";
type SidebarItemId = "favoritos" | number;

interface SidebarIzquierdoProps {
  activeTrack?: ItemBiblioteca | null;
  setActiveTrack?: (track: ItemBiblioteca | null) => void;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
}

const SidebarIzquierdo: React.FC<SidebarIzquierdoProps> = ({
  activeTrack,
  setActiveTrack,
  isPlaying,
  setIsPlaying,
}) => {
  const library = useMusicLibrary();
  const playlists = usePlaylists();

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenType>("recientes");
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [favoritosPinned, setFavoritosPinned] = useState(false);

  // Orden personalizado de todos los items de la sidebar (incluye "favoritos" y IDs de playlists)
  const [customOrder, setCustomOrder] = useState<SidebarItemId[]>(["favoritos"]);

  // Menú contextual unificado para cualquier item de la sidebar
  const [ctxItem, setCtxItem] = useState<{ id: SidebarItemId; x: number; y: number } | null>(null);
  const ctxRef = useRef<HTMLDivElement>(null);

  // Playlist pendiente de confirmación de eliminación
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);

  // Drag & drop en modo recientes
  const [draggingId, setDraggingId] = useState<SidebarItemId | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: SidebarItemId; after: boolean } | null>(null);
  const dragIdRef = useRef<SidebarItemId | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar customOrder cuando se crean/eliminan playlists
  useEffect(() => {
    setCustomOrder(prev => {
      const currentIdSet = new Set(playlists.playlists.map(p => p.id));
      const filtered = prev.filter(id => id === "favoritos" || currentIdSet.has(id as number));
      const existingSet = new Set(filtered);
      const newItems = playlists.playlists
        .filter(p => !existingSet.has(p.id))
        .map(p => p.id as SidebarItemId);
      if (newItems.length === 0 && filtered.length === prev.length) return prev;
      return [...filtered, ...newItems];
    });
  }, [playlists.playlists]);

  // Cerrar menú contextual al hacer click fuera o presionar Escape
  useEffect(() => {
    if (!ctxItem) return;
    const handleOutside = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) setCtxItem(null);
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setCtxItem(null); };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ctxItem]);

  // Cerrar el modal de confirmación de borrado con Escape
  useEffect(() => {
    if (!deleteTarget) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setDeleteTarget(null); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [deleteTarget]);

  const getItemName = (id: SidebarItemId): string => {
    if (id === "favoritos") return "tus favoritos";
    return playlists.playlists.find(p => p.id === id)?.name.toLowerCase() ?? "";
  };

  const isItemPinned = (id: SidebarItemId): boolean =>
    id === "favoritos" ? favoritosPinned : (playlists.playlists.find(p => p.id === id)?.pinned ?? false);

  // Lista ordenada y filtrada de items visibles
  const displayItems = useMemo<SidebarItemId[]>(() => {
    const query = busqueda.trim().toLowerCase();
    const matchesSearch = (id: SidebarItemId) => !query || getItemName(id).includes(query);

    if (orden === "alfabetico") {
      const allIds: SidebarItemId[] = [
        "favoritos",
        ...playlists.playlists.map(p => p.id as SidebarItemId),
      ];
      const visible = allIds.filter(matchesSearch);
      const pinned = visible.filter(isItemPinned).sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
      const nonPinned = visible.filter(id => !isItemPinned(id)).sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
      return [...pinned, ...nonPinned];
    }

    // Modo recientes: usar customOrder con pinned primero
    const visible = customOrder.filter(matchesSearch);
    const pinned = visible.filter(isItemPinned);
    const nonPinned = visible.filter(id => !isItemPinned(id));
    return [...pinned, ...nonPinned];
  }, [orden, busqueda, playlists.playlists, customOrder, favoritosPinned]); // eslint-disable-line react-hooks/exhaustive-deps

  const sinResultados = busqueda.trim() !== "" && displayItems.length === 0;

  // ── Handlers de orden ──────────────────────────────────────────────
  const handleOrden = (nuevoOrden: OrdenType) => {
    setOrden(nuevoOrden);
    setMostrarMenu(false);
  };

  // ── Handlers de creación de playlist ──────────────────────────────
  const handleCrearPlaylist = () => {
    playlists.createPlaylist();
    library.setView("playlist");
  };

  // ── Handlers de navegación ─────────────────────────────────────────
  const handleAbrirFavoritos = () => {
    library.setView("favoritos");
    playlists.selectPlaylist(null);
  };

  const handleAbrirPlaylist = (id: number) => {
    playlists.selectPlaylist(id);
    library.setView("playlist");
  };

  const handleItemClick = (id: SidebarItemId) => {
    if (id === "favoritos") handleAbrirFavoritos();
    else handleAbrirPlaylist(id as number);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: SidebarItemId) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleItemClick(id); }
  };

  // ── Handlers de reproducción ───────────────────────────────────────
  const favoriteSongs = library.favoriteSongs;
  const isFavoritosActiveTrack = library.playingSource === "favoritos" && Boolean(activeTrack);
  const isFavoritosPlaying = isFavoritosActiveTrack && Boolean(isPlaying);

  const handleTogglePlayFavoritos = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!favoriteSongs.length) return;
    togglePlayOrSwitch({
      alreadyActive: isFavoritosActiveTrack,
      isPlaying: Boolean(isPlaying),
      song: favoriteSongs[0],
      source: "favoritos",
      setPlayingSource: library.setPlayingSource,
      setActiveTrack,
      setIsPlaying,
    });
  };

  const handleTogglePlayPlaylist = (e: React.MouseEvent<HTMLButtonElement>, playlist: Playlist) => {
    e.stopPropagation();
    if (!playlist.songIds.length) return;
    const firstSong = library.songs.find(s => s.id === playlist.songIds[0]);
    if (!firstSong) return;
    togglePlayOrSwitch({
      alreadyActive:
        library.playingSource === "playlist" &&
        library.playingPlaylistId === playlist.id &&
        Boolean(activeTrack),
      isPlaying: Boolean(isPlaying),
      song: firstSong,
      source: "playlist",
      playlistId: playlist.id,
      setPlayingSource: library.setPlayingSource,
      setActiveTrack,
      setIsPlaying,
    });
  };

  // ── Handlers de menú contextual de sidebar ─────────────────────────
  const handleContextMenu = (e: React.MouseEvent, id: SidebarItemId) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 234);
    const y = Math.min(e.clientY, window.innerHeight - 120);
    setCtxItem({ id, x, y });
  };

  const handleTogglePin = (id: SidebarItemId) => {
    if (id === "favoritos") setFavoritosPinned(prev => !prev);
    else playlists.togglePinned(id as number);
    setCtxItem(null);
  };

  const handleEditPlaylist = (id: number) => {
    playlists.requestEditPlaylist(id);
    setCtxItem(null);
  };

  const handleDeletePlaylist = (id: number) => {
    const playlist = playlists.playlists.find(p => p.id === id) ?? null;
    setDeleteTarget(playlist);
    setCtxItem(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) playlists.deletePlaylist(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => setDeleteTarget(null);

  // ── Handlers de drag & drop (solo en modo recientes) ──────────────
  const canDrag = orden === "recientes";

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: SidebarItemId) => {
    if (!canDrag) return;
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setDraggingId(id), 0);
  };

  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: SidebarItemId) => {
    if (!canDrag || !dragIdRef.current) return;
    e.preventDefault();
    if (dragIdRef.current === id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDropTarget({ id, after: e.clientY >= rect.top + rect.height / 2 });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: SidebarItemId) => {
    e.preventDefault();
    const movedId = dragIdRef.current;
    if (!movedId || movedId === targetId) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }
    const insertAfter = dropTarget?.after ?? false;
    setCustomOrder(prev => {
      const next = [...prev];
      const fromIdx = next.indexOf(movedId);
      if (fromIdx === -1) return prev;
      next.splice(fromIdx, 1);
      const toIdx = next.indexOf(targetId);
      if (toIdx === -1) return prev;
      next.splice(insertAfter ? toIdx + 1 : toIdx, 0, movedId);
      return next;
    });
    setDraggingId(null);
    setDropTarget(null);
  };

  // ── Render de un item genérico ─────────────────────────────────────
  const renderItem = (id: SidebarItemId) => {
    const isFav = id === "favoritos";
    const playlist = isFav ? null : playlists.playlists.find(p => p.id === id);
    if (!isFav && !playlist) return null;

    const isPinned = isItemPinned(id);
    const isDragging = draggingId === id;
    const dropPos = dropTarget?.id === id ? (dropTarget.after ? "after" : "before") : null;

    let isSelected: boolean;
    let isThisPlaying: boolean;
    let songCount: number;
    let name: string;
    let coverEl: React.ReactNode;
    let playBtn: React.ReactNode;
    let soundIcon: React.ReactNode | null = null;

    if (isFav) {
      isSelected = library.view === "favoritos";
      isThisPlaying = isFavoritosPlaying;
      songCount = favoriteSongs.length;
      name = "Tus favoritos";
      coverEl = <img src={iconFavoritos} alt="" className="item-cover" />;
      playBtn = (
        <button
          type="button"
          className="item-play-overlay border-0"
          aria-label={isFavoritosPlaying ? "Pausar Tus favoritos" : "Reproducir Tus favoritos"}
          disabled={songCount === 0}
          onClick={handleTogglePlayFavoritos}
        >
          <svg className="icono-play-hover" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href={isFavoritosPlaying ? "#icon-pause" : "#icon-play"} />
          </svg>
        </button>
      );
      if (isFavoritosPlaying) {
        soundIcon = (
          <svg className="icono-sonido-activo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href="#icon-sound-active" />
          </svg>
        );
      }
    } else {
      const pl = playlist!;
      isSelected = library.view === "playlist" && playlists.selectedId === pl.id;
      isThisPlaying =
        library.playingSource === "playlist" &&
        library.playingPlaylistId === pl.id &&
        Boolean(activeTrack) &&
        Boolean(isPlaying);
      songCount = pl.songIds.length;
      name = pl.name;
      coverEl = pl.coverImage
        ? <img src={pl.coverImage} alt="" className="item-cover" />
        : <MusicSvg color="#404040" width="2em" height="2em" />;
      playBtn = (
        <button
          type="button"
          className="item-play-overlay border-0"
          aria-label={isThisPlaying ? `Pausar ${pl.name}` : `Reproducir ${pl.name}`}
          disabled={songCount === 0}
          onClick={e => handleTogglePlayPlaylist(e, pl)}
        >
          <svg className="icono-play-hover" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href={isThisPlaying ? "#icon-pause" : "#icon-play"} />
          </svg>
        </button>
      );
      if (isThisPlaying) {
        soundIcon = (
          <svg className="icono-sonido-activo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <use href="#icon-sound-active" />
          </svg>
        );
      }
    }

    const wrapperClass = [
      "sidebar-item-wrapper",
      isSelected ? "seleccionado" : "",
      isDragging ? "sidebar-dragging" : "",
      dropPos === "before" ? "sidebar-drop-before" : "",
      dropPos === "after" ? "sidebar-drop-after" : "",
    ].filter(Boolean).join(" ");

    return (
      <div
        className={wrapperClass}
        role="button"
        tabIndex={0}
        draggable={canDrag}
        onClick={() => handleItemClick(id)}
        onKeyDown={e => handleItemKeyDown(e, id)}
        onContextMenu={e => handleContextMenu(e, id)}
        onDragStart={e => handleDragStart(e, id)}
        onDragEnd={handleDragEnd}
        onDragOver={e => handleDragOver(e, id)}
        onDrop={e => handleDrop(e, id)}
      >
        <div className={`item-imagen-wrapper${!isFav && !playlist?.coverImage ? " bg-[#282828]" : ""}`}>
          {coverEl}
          {playBtn}
        </div>

        <div className="sidebar-item-info">
          <span className={`item-nombre${isThisPlaying ? " activo" : ""}`}>{name}</span>
          <span className="item-detalles">
            {isPinned && (
              <svg className="pin-icono" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <use href="#icon-pin" />
              </svg>
            )}
            <span>Playlist</span>
            <span className="separador-punto">•</span>
            <span>{songCount} {songCount === 1 ? "canción" : "canciones"}</span>
          </span>
        </div>

        {soundIcon}
      </div>
    );
  };

  return (
    <aside className="sidebar-izquierdo">
      <div className="sidebar-header">
        <div className="sidebar-titulo-fila">
          <svg className="icono-biblioteca" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="3" height="18" rx="1.5" />
            <rect x="10" y="3" width="3" height="18" rx="1.5" />
            <rect x="15" y="4" width="3" height="18" rx="1.5" transform="rotate(15 16.5 13)" />
          </svg>
          <span className="sidebar-titulo">Tu biblioteca</span>
          <button className="filtro-pill" type="button" onClick={handleCrearPlaylist}>
            Crear +
          </button>
        </div>

        <div className="sidebar-busqueda-fila">
          <div className="search">
            <svg className="icono-lupa" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              className="sidebar-input"
              type="text"
              placeholder="Buscar en Tu biblioteca"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="btn-limpiar" onClick={() => setBusqueda("")} title="Limpiar búsqueda">
                ✕
              </button>
            )}
          </div>

          <div className="orden-wrapper">
            <button className="btn-orden" onClick={() => setMostrarMenu(!mostrarMenu)}>
              <span className="orden-label">
                {orden === "recientes" ? "Recientes" : "Alfabéticamente"}
              </span>
              <svg className="icono-orden" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {mostrarMenu && (
              <>
                <div className="orden-overlay" onClick={() => setMostrarMenu(false)} />
                <div className="orden-menu">
                  <p className="orden-menu-titulo">Clasificar por</p>
                  <button
                    className={`orden-opcion${orden === "recientes" ? " activo" : ""}`}
                    onClick={() => handleOrden("recientes")}
                  >
                    Recientes
                    {orden === "recientes" && (
                      <svg viewBox="0 0 16 16" fill="none" className="icono-check">
                        <use href="#icon-check" />
                      </svg>
                    )}
                  </button>
                  <button
                    className={`orden-opcion${orden === "alfabetico" ? " activo" : ""}`}
                    onClick={() => handleOrden("alfabetico")}
                  >
                    Alfabéticamente
                    {orden === "alfabetico" && (
                      <svg viewBox="0 0 16 16" fill="none" className="icono-check">
                        <use href="#icon-check" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-lista">
        <div className="items-contenedor">
          {displayItems.map(id => (
            <React.Fragment key={String(id)}>
              {renderItem(id)}
            </React.Fragment>
          ))}
        </div>

        {sinResultados && (
          <div className="estado-vacio">
            <p className="vacio-titulo">No pudimos encontrar &ldquo;{busqueda}&rdquo;</p>
            <p className="vacio-descripcion">
              Vuelve a probar escribiéndolo de otra forma o con una palabra clave diferente.
            </p>
          </div>
        )}
      </div>

      {/* Menú contextual de items de la sidebar */}
      {ctxItem && (
        <div
          ref={ctxRef}
          className="ctx-menu"
          role="menu"
          style={{ left: ctxItem.x, top: ctxItem.y }}
        >
          {/* Fijar / Dejar de fijar */}
          <button
            type="button"
            className="ctx-item"
            role="menuitem"
            onClick={() => handleTogglePin(ctxItem.id)}
          >
            <svg
              className="ctx-ico"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{ color: isItemPinned(ctxItem.id) ? "#1db954" : undefined }}
            >
              <use href="#icon-pin" />
            </svg>
            <span>{isItemPinned(ctxItem.id) ? "Dejar de fijar playlist" : "Fijar playlist"}</span>
          </button>

          {/* Editar detalles (solo playlists de usuario) */}
          {ctxItem.id !== "favoritos" && (
            <button
              type="button"
              className="ctx-item"
              role="menuitem"
              onClick={() => handleEditPlaylist(ctxItem.id as number)}
            >
              <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <use href="#icon-edit" />
              </svg>
              <span>Editar detalles</span>
            </button>
          )}

          {/* Eliminar playlist (solo playlists de usuario) */}
          {ctxItem.id !== "favoritos" && (
            <button
              type="button"
              className="ctx-item ctx-del"
              role="menuitem"
              onClick={() => handleDeletePlaylist(ctxItem.id as number)}
            >
              <svg className="ctx-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <use href="#icon-trash" />
              </svg>
              <span>Eliminar playlist</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de confirmación para eliminar playlist */}
      {deleteTarget && (
        <div
          className="modal-bg"
          onClick={event => {
            if (event.target === event.currentTarget) handleCancelDelete();
          }}
        >
          <div
            className="modal dp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dp-modal-ttl"
            aria-describedby="dp-modal-txt"
          >
            <div className="dp-bdy">
              <h2 className="dp-ttl" id="dp-modal-ttl">
                ¿Quieres eliminar este elemento de Tu biblioteca?
              </h2>
              <p className="dp-txt" id="dp-modal-txt">
                Se eliminará {deleteTarget.name} de Tu biblioteca.
              </p>
            </div>

            <div className="dp-footer">
              <button className="btn-cancel-dp" type="button" onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button className="btn-delete-dp" type="button" onClick={handleConfirmDelete} autoFocus>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarIzquierdo;