import React, { useState, useMemo, useRef } from "react";
import { ItemBiblioteca } from "../../interfaces/itemBiblioteca";

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
  // Silenciamos advertencias de compilación para props que se usarán al agregar contenido
  if (false && (activeTrack || setActiveTrack || isPlaying || setIsPlaying)) {
  }

  const [filtroActivo] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenType>("recientes");
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [items] = useState<ItemBiblioteca[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const sinResultados = busqueda.trim() !== "" && itemsFiltrados.length === 0;

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
          <button className="filtro-pill">Crear +</button>
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
                        <path
                          d="M3 9l4 4 6-8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
                        <path
                          d="M3 9l4 4 6-8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
    </aside>
  );
};

export default SidebarIzquierdo;
