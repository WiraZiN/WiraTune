import React, { useEffect, useMemo, useRef, useState } from "react";
import iconFavoritos from "../../assets/iconfavoritos.png";
import { ItemBiblioteca } from "../../interfaces/itemBiblioteca";
import { useMusicLibrary } from "../Dashboard/hooks/useMusicLibrary";
import { usePlaylists } from "../Dashboard/hooks/usePlaylists";
import type { Playlist } from "../Dashboard/types/playlist";
import { togglePlayOrSwitch } from "../Dashboard/utils/playback";
import { MusicSvg } from "../../icons/music-svg";

type OrdenType = "recientes" | "alfabetico";

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

  const [filtroActivo] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenType>("recientes");
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [items] = useState<ItemBiblioteca[]>([]);
  const [favoritosPinned, setFavoritosPinned] = useState(false);
  const [ctxFavPos, setCtxFavPos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxFavRef = useRef<HTMLDivElement>(null);

  const filtros = ["Playlists", "Artistas", "Álbumes", "Podcasts"];

  void filtros;

  const itemsFiltrados = useMemo(() => {
    let resultado = [...items];
    if (busqueda.trim() !== "") {
      resultado = resultado.filter((item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      );
    }
    if (filtroActivo) {
      resultado = resultado.filter((item) => {
        if (filtroActivo === "Playlists") return item.tipo === "playlist";
        if (filtroActivo === "Artistas") return item.tipo === "artista";
        if (filtroActivo === "Álbumes") return item.tipo === "album";
        if (filtroActivo === "Podcasts") return item.tipo === "podcast";
        return true;
      });
    }
    if (orden === "alfabetico") {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else {
      resultado.sort(
        (a, b) => b.fechaAgregado.getTime() - a.fechaAgregado.getTime(),
      );
    }
    return resultado;
  }, [busqueda, filtroActivo, orden, items]);

  const handleOrden = (nuevoOrden: OrdenType) => {
    setOrden(nuevoOrden);
    setMostrarMenu(false);
  };

  // "Tus favoritos" siempre fijado primero: se filtra por búsqueda igual
  // que el resto de los items, pero nunca entra al ordenamiento ni al
  // arreglo `itemsFiltrados`, así que siempre queda renderizado antes
  // que cualquier otro elemento de la lista.
  const favoritosVisible = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return true;
    return "tus favoritos".includes(query);
  }, [busqueda]);

  // Playlists creadas por el usuario: se filtran por la misma búsqueda de
  // "Tu biblioteca" y se ordenan según el mismo criterio (recientes ⇒ más
  // nueva primero, alfabético ⇒ por nombre), igual que el resto de items.
  const playlistsVisibles = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    const filtradas = query
      ? playlists.playlists.filter(playlist => playlist.name.toLowerCase().includes(query))
      : [...playlists.playlists];

    if (orden === "alfabetico") {
      filtradas.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtradas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtradas;
  }, [playlists.playlists, busqueda, orden]);

  const favoriteSongs = library.favoriteSongs;
  const favoriteCount = favoriteSongs.length;
  const isFavoritosSelected = library.view === "favoritos";
  const isFavoritosActiveTrack =
    library.playingSource === "favoritos" && Boolean(activeTrack);
  const isFavoritosPlaying = isFavoritosActiveTrack && Boolean(isPlaying);

  const handleAbrirFavoritos = () => {
    library.setView("favoritos");
    playlists.selectPlaylist(null);
  };

  const handleAbrirFavoritosKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAbrirFavoritos();
    }
  };

  const handleTogglePlayFavoritos = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (favoriteCount === 0) return;

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

  // Click en "Crear +": crea una nueva playlist (Mi playlist n°1, n°2...)
  // y navega directo a su vista, igual que hace Spotify.
  const handleCrearPlaylist = () => {
    playlists.createPlaylist();
    library.setView("playlist");
  };

  const handleAbrirPlaylist = (id: number) => {
    playlists.selectPlaylist(id);
    library.setView("playlist");
  };

  const handleAbrirPlaylistKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    id: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleAbrirPlaylist(id);
    }
  };

  const handleTogglePlayPlaylist = (
    event: React.MouseEvent<HTMLButtonElement>,
    playlist: Playlist,
  ) => {
    event.stopPropagation();
    if (playlist.songIds.length === 0) return;

    const firstSong = library.songs.find(song => song.id === playlist.songIds[0]);
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

  const sinResultados =
    busqueda.trim() !== "" &&
    itemsFiltrados.length === 0 &&
    !favoritosVisible &&
    playlistsVisibles.length === 0;

  const handleFavoritosContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 234);
    const y = Math.min(e.clientY, window.innerHeight - 60);
    setCtxFavPos({ x, y });
  };

  useEffect(() => {
    if (!ctxFavPos) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ctxFavRef.current && !ctxFavRef.current.contains(e.target as Node)) {
        setCtxFavPos(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCtxFavPos(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ctxFavPos]);

  return (
    <aside className="sidebar-izquierdo">
      <div className="sidebar-header">
        <div className="sidebar-titulo-fila">
          <svg
            className="icono-biblioteca"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="3" y="3" width="3" height="18" rx="1.5" />
            <rect x="10" y="3" width="3" height="18" rx="1.5" />
            <rect
              x="15"
              y="4"
              width="3"
              height="18"
              rx="1.5"
              transform="rotate(15 16.5 13)"
            />
          </svg>
          <span className="sidebar-titulo">Tu biblioteca</span>
          <button className="filtro-pill" type="button" onClick={handleCrearPlaylist}>
            Crear +
          </button>
        </div>

        <div className="sidebar-busqueda-fila">
          <div className="search">
            <svg className="icono-lupa" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <input
              ref={inputRef}
              className="sidebar-input"
              type="text"
              placeholder="Buscar en Tu biblioteca"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                className="btn-limpiar"
                onClick={() => setBusqueda("")}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="orden-wrapper">
            <button
              className="btn-orden"
              onClick={() => setMostrarMenu(!mostrarMenu)}
            >
              <span className="orden-label">
                {orden === "recientes" ? "Recientes" : "Alfabéticamente"}
              </span>
              <svg className="icono-orden" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4h12M4 8h8M6 12h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {mostrarMenu && (
              <>
                <div
                  className="orden-overlay"
                  onClick={() => setMostrarMenu(false)}
                />
                <div className="orden-menu">
                  <p className="orden-menu-titulo">Clasificar por</p>
                  <button
                    className={`orden-opcion ${orden === "recientes" ? "activo" : ""}`}
                    onClick={() => handleOrden("recientes")}
                  >
                    Recientes
                    {orden === "recientes" && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="icono-check"
                      >
                        <use href="#icon-check" />
                      </svg>
                    )}
                  </button>
                  <button
                    className={`orden-opcion ${orden === "alfabetico" ? "activo" : ""}`}
                    onClick={() => handleOrden("alfabetico")}
                  >
                    Alfabéticamente
                    {orden === "alfabetico" && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="icono-check"
                      >
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
          {favoritosVisible && (
            <div
              className={`sidebar-item-wrapper${isFavoritosSelected ? " seleccionado" : ""}`}
              role="button"
              tabIndex={0}
              onClick={handleAbrirFavoritos}
              onKeyDown={handleAbrirFavoritosKeyDown}
              onContextMenu={handleFavoritosContextMenu}
            >
              <div className="item-imagen-wrapper">
                <img src={iconFavoritos} alt="" className="item-cover" />

                {/* El botón es siempre visible en el DOM;
                    el CSS lo muestra únicamente al hacer hover
                    (.sidebar-item-wrapper:hover .item-play-overlay) */}
                <button
                  type="button"
                  className="item-play-overlay border-0"
                  aria-label={
                    isFavoritosPlaying
                      ? "Pausar Tus favoritos"
                      : "Reproducir Tus favoritos"
                  }
                  disabled={favoriteCount === 0}
                  onClick={handleTogglePlayFavoritos}
                >
                  <svg
                    className="icono-play-hover"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <use href={isFavoritosPlaying ? "#icon-pause" : "#icon-play"} />
                  </svg>
                </button>
              </div>

              <div className="sidebar-item-info">
                <span
                  className={`item-nombre${isFavoritosPlaying ? " activo" : ""}`}
                >
                  Tus favoritos
                </span>
                <span className="item-detalles">
                  {favoritosPinned && (
                    <svg
                      className="pin-icono"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <use href="#icon-pin" />
                    </svg>
                  )}
                  <span>Playlist</span>
                  <span className="separador-punto">•</span>
                  <span>
                    {favoriteCount}{" "}
                    {favoriteCount === 1 ? "canción" : "canciones"}
                  </span>
                </span>
              </div>

              {isFavoritosPlaying && (
                <svg
                  className="icono-sonido-activo"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <use href="#icon-sound-active" />
                </svg>
              )}
            </div>
          )}

          {playlistsVisibles.map(playlist => {
            const isSelected =
              library.view === "playlist" && playlists.selectedId === playlist.id;
            const isThisPlaylistPlaying =
              library.playingSource === "playlist" &&
              library.playingPlaylistId === playlist.id &&
              Boolean(activeTrack) &&
              Boolean(isPlaying);
            const songCount = playlist.songIds.length;

            return (
              <div
                key={playlist.id}
                className={`sidebar-item-wrapper${isSelected ? " seleccionado" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => handleAbrirPlaylist(playlist.id)}
                onKeyDown={event => handleAbrirPlaylistKeyDown(event, playlist.id)}
              >
                <div
                  className={`item-imagen-wrapper${playlist.coverImage ? "" : " bg-[#282828]"}`}
                >

                  {playlist.coverImage ? <img
                    src={playlist.coverImage}
                    alt=""
                    className={playlist.coverImage ? "item-cover" : "playlist-default-icon"}
                  /> : <MusicSvg color="#404040" width="2em" height="2em"/>}



                  {/* El botón es siempre visible en el DOM; el CSS lo muestra
                      únicamente al hacer hover (.sidebar-item-wrapper:hover .item-play-overlay) */}
                  <button
                    type="button"
                    className="item-play-overlay border-0"
                    aria-label={
                      isThisPlaylistPlaying
                        ? `Pausar ${playlist.name}`
                        : `Reproducir ${playlist.name}`
                    }
                    disabled={songCount === 0}
                    onClick={event => handleTogglePlayPlaylist(event, playlist)}
                  >
                    <svg
                      className="icono-play-hover"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <use href={isThisPlaylistPlaying ? "#icon-pause" : "#icon-play"} />
                    </svg>
                  </button>
                </div>

                <div className="sidebar-item-info">
                  <span
                    className={`item-nombre${isThisPlaylistPlaying ? " activo" : ""}`}
                  >
                    {playlist.name}
                  </span>
                  <span className="item-detalles">
                    <span>Playlist</span>
                    <span className="separador-punto">•</span>
                    <span>
                      {songCount} {songCount === 1 ? "canción" : "canciones"}
                    </span>
                  </span>
                </div>

                {isThisPlaylistPlaying && (
                  <svg
                    className="icono-sonido-activo"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <use href="#icon-sound-active" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {sinResultados && (
          <div className="estado-vacio">
            <p className="vacio-titulo">
              No pudimos encontrar &ldquo;{busqueda}&rdquo;
            </p>
            <p className="vacio-descripcion">
              Vuelve a probar escribiéndolo de otra forma o con una palabra
              clave diferente.
            </p>
          </div>
        )}
      </div>

      {/* Menú contextual de "Tus favoritos" */}
      {ctxFavPos && (
        <div
          ref={ctxFavRef}
          className="ctx-menu"
          role="menu"
          style={{ left: ctxFavPos.x, top: ctxFavPos.y }}
        >
          <button
            type="button"
            className="ctx-item"
            role="menuitem"
            onClick={() => {
              setFavoritosPinned((prev) => !prev);
              setCtxFavPos(null);
            }}
          >
            <svg
              className="ctx-ico"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{ color: favoritosPinned ? "#1db954" : undefined }}
            >
              <use href="#icon-pin" />
            </svg>
            <span>
              {favoritosPinned ? "Dejar de fijar playlist" : "Fijar playlist"}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SidebarIzquierdo;