import React, { useState, useRef, useEffect } from "react";
import { useMusicLibrary } from "../Dashboard/hooks/useMusicLibrary";

// ─── Tauri window — inicializado una sola vez en mount ─────────────────────
// Compatible con v1 (appWindow) y v2 (getCurrentWindow)
const resolveWindow = async (): Promise<any> => {
  const mod = await import("@tauri-apps/api/window");
  return "getCurrentWindow" in mod
    ? (mod as any).getCurrentWindow()
    : (mod as any).appWindow;
};

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const menuWrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const win = useRef<any>(null);   // instancia cacheada

  const library = useMusicLibrary();


  // ── Init: resuelve la ventana Tauri y sincroniza estado de maximizado ─────
  useEffect(() => {
    resolveWindow()
      .then(async (w) => {
        win.current = w;
        setMaximized(await w.isMaximized());
      })
      .catch(() => {/* fuera de Tauri (browser preview) */ });
  }, []);

  // ── Cierra el menú al hacer clic fuera ────────────────────────────────────
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuOpen && menuWrapperRef.current && !menuWrapperRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [menuOpen]);

  // ── Foco al primer ítem al abrir ─────────────────────────────────────────
  useEffect(() => {
    if (menuOpen && dropdownRef.current) {
      dropdownRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')[0]?.focus();
    }
  }, [menuOpen]);

  // ── Teclado ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!menuOpen || !dropdownRef.current) return;
      const items = [...dropdownRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')];
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
      else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
      else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((p) => !p);
  };

  // ── Controles de ventana ──────────────────────────────────────────────────
  const handleMinimize = () => win.current?.minimize();

  const handleMaximize = async () => {
    if (!win.current) return;
    await win.current.toggleMaximize();
    setMaximized(await win.current.isMaximized());
  };

  const handleClose = () => win.current?.close();

  const onDragStart = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    win.current?.startDragging();
  };

  const handleAbrirBiblioteca = () => {
    library.setView("biblioteca")
  }

  return (
    <header
      className="header"
      role="banner"
      onMouseDown={onDragStart}
    >

      <nav className="header__nav" aria-label="Navegación principal">
        <button className="home-btn" aria-label="Ir al inicio" onClick={handleAbrirBiblioteca}>
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
          </svg>

        </button>

        <div className="search-bar" role="search">
          <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            className="search-bar__input"
            type="search"
            placeholder="¿Qué quieres reproducir?"
            aria-label="Buscar contenido"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </nav>

      <div
        className="user-menu"
        id="userMenu"
        data-open={String(menuOpen)}
        ref={menuWrapperRef}
      >
        <button
          className="user-menu__trigger"
          id="userMenuTrigger"
          ref={triggerRef}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-controls="userMenuDropdown"
          aria-label="Menú de usuario"
          onClick={handleTriggerClick}
        >
          U
        </button>

        <div
          className="user-menu__dropdown"
          id="userMenuDropdown"
          role="menu"
          aria-labelledby="userMenuTrigger"
          ref={dropdownRef}
        >
          <a className="user-menu__item" href="#" role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>Mi perfil</span>
          </a>

          <a className="user-menu__item" href="#" role="menuitem">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
              />
            </svg>
            <span>Preferencias</span>
          </a>

          <div className="user-menu__divider" role="separator" />

          <a className="user-menu__item user-menu__item--danger" href="#" role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>Cerrar sesión</span>
          </a>
        </div>
      </div>

      <div className="window-controls" id="windowControls" aria-label="Controles de ventana">
        <button
          className="window-controls__btn"
          id="btnMinimize"
          aria-label="Minimizar"
          onClick={handleMinimize}
        >
          <svg viewBox="0 0 11 1" fill="currentColor" aria-hidden="true">
            <rect width="11" height="1" rx="0.5" />
          </svg>
        </button>

        <button
          className="window-controls__btn"
          id="btnMaximize"
          aria-label={maximized ? "Restaurar" : "Maximizar"}
          onClick={handleMaximize}
        >
          <svg viewBox="0 0 11 11" fill="none" aria-hidden="true">
            {maximized ? (
              <>
                <rect x="2" y="0.5" width="8.5" height="8.5" rx="1" stroke="currentColor" strokeWidth="1" />
                <rect x="0.5" y="2" width="8.5" height="8.5" rx="1" stroke="currentColor" strokeWidth="1" fill="var(--header-bg)" />
              </>
            ) : (
              <rect x="0.5" y="0.5" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
        </button>

        <button
          className="window-controls__btn window-controls__btn--close"
          id="btnClose"
          aria-label="Cerrar"
          onClick={handleClose}
        >
          <svg viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="1" x2="1" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

    </header>
  );
};

export default Header;
