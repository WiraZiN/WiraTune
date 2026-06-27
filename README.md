# Cambios: Playlists (v3 — sin parches, sin relleno, sin código sin usar)

Reemplaza tus carpetas `Dashboard/` y `SidebarIzquierdo/`, y tu `App.css`,
por estos (misma ubicación relativa que ya tenías).

## v3 — última pasada (parches + relleno + exports sin usar)

- **Parche real que encontré**: en las filas del sidebar (favoritos y
  playlist), el botón de play/pause tenía
  `className="item-play-overlay border-0 bg-[rgba(0,0,0,0.5)] p-0"`.
  `.item-play-overlay` **ya** define ese mismo `bg-[rgba(0,0,0,0.5)]`, y
  el `p-0` ya lo da el reset global (`* { margin:0; padding:0 }` en
  `@layer base`). Quedó solo `border-0`, que sí hace falta (nada más
  resetea el borde nativo del `<button>`). Esto estaba en el código
  original (la fila de "Tus favoritos") y yo lo repetí en la fila nueva
  de playlist; ahora ninguna de las dos lo tiene.
- **Export innecesario**: `mixWithBlack` en `utils/colors.ts` estaba
  exportado pero solo se usa adentro del mismo archivo (lo llama
  `getPlaylistGradient`). Dejó de exportarse — sigue ahí, pero ya no es
  superficie pública que nadie necesita desde afuera.
- **Clase CSS de una sola propiedad**: `.em-save-btn` solo aplicaba
  `shrink-0`. En vez de una clase nueva para un solo utility, ahora va
  directo en el JSX (`className="btn-add-lib shrink-0"`), como ya hace
  el resto del código con modificadores chicos.
- Encontré y corregí 2 íconos más duplicados que se me habían
  pasado en la pasada anterior: el ícono de pin ("Fijar playlist") y el
  de check del dropdown "Clasificar por" — ambos estaban duplicados
  *dentro* de `SidebarIzquierdo.tsx` desde antes de que yo tocara nada.
  Ahora son `#icon-pin` y `#icon-check` en el sprite, un solo lugar cada
  uno.
- Volví a reusar `.fav-banner`/`.fav-cover` tal cual en vez de que
  `.pl-banner`/`.pl-cover` repitieran sus mismas propiedades — el color
  random de cada playlist se aplica con `style={{ background: ... }}`
  inline, que pisa el degradado fijo del CSS sin necesitar clases
  nuevas para eso.

Verificación: `tsc --noEmit` en estricto (sin warnings de exports/vars
sin usar), `App.css` compilado con el CLI real de Tailwind v4, grep
sobre todos los `.tsx` confirmando cero `<path>` repetidos y cero clase
CSS sin al menos un uso real en el JSX. Todo corrido contra el
contenido final de este zip, no contra una copia aparte.

## v2 — pasada anterior (duplicados de lógica e íconos)

Hiciste bien en pedir una segunda pasada — encontré y corregí esto:

**Código duplicado real que había:**
- 5 lugares con el mismo SVG de play/pause copiado a mano (uno ya existía
  en tu código: `FavoritesSection`, `SongRow`, el bloque de "Tus
  favoritos" en el sidebar; dos los agregué yo en `PlaylistSection` y en
  las filas de playlist del sidebar). Ahora los 5 usan los mismos 2
  símbolos `#icon-play` / `#icon-pause` de `IconSprite.tsx`.
- El ícono de lápiz/editar estaba repetido 3 veces (2 en
  `EditPlaylistModal`, 1 en `PlaylistSection`) → ahora es `#icon-edit`,
  un solo símbolo.
- El ícono de pin y el de "sonido activo" también estaban duplicados
  dentro de `SidebarIzquierdo.tsx` (uno ya existía para "Tus favoritos",
  yo agregué una segunda copia para las playlists) → mismo arreglo,
  ahora son `#icon-pin` y `#icon-sound-active`.
- La lógica "si ya está sonando esto, pausa; si no, cambiá de fuente y
  reproducí" estaba copiada 6 veces (las 4 en `Dashboard.tsx`:
  canción suelta / "play all" de favoritos / canción de playlist / "play
  all" de playlist; las 2 en `SidebarIzquierdo.tsx`: favoritos y
  playlist). Ahora es una sola función, `togglePlayOrSwitch` en
  `Dashboard/utils/playback.ts`, y cada lugar solo le pasa sus datos.
- Los 6 "setters" de `usePlaylists.ts` (renombrar, descripción, foto,
  agregar canciones, quitar canción, orden) repetían el mismo
  `playlists.map(p => p.id === id ? {...} : p)`. Ahora hay un solo
  `updatePlaylist(id, patch)` interno y cada setter solo dice qué campo
  cambia.
- El dropdown de orden de una playlist duplicaba el par
  toggle/select que ya tenía "Tu biblioteca". Ahora hay una fábrica
  local (`makeSortToggle`/`makeSortSelect`) y ambos dropdowns la usan.
- El efecto de "cerrar dropdown si clickeás afuera" repetía el mismo
  `if (ref.current && !ref.current.contains(...))` 3 veces → un helper
  `closeIfOutside` adentro del mismo efecto.
- `.pl-banner` y `.pl-cover` en `App.css` reescribían las mismas
  propiedades que ya tenían `.fav-banner`/`.fav-cover`. Ahora
  `PlaylistSection` reutiliza esas clases directamente (combinadas con
  `pl-cover` solo para lo que es distinto: cursor, hover, position) y el
  color random se aplica con `style={{ background: ... }}` inline, que
  pisa el degradado fijo del CSS sin necesitar una clase nueva.
- `.em-name-input`, `.em-desc-input` y `.asp-search-input` repetían casi
  línea por línea el mismo "input oscuro con borde/foco/placeholder".
  Ahora hay una clase base `.field-input` y cada uno solo agrega su
  diferencia (tamaño de texto, si es bold, opacidad del borde).
- `.em-modal { width: 560px }` dependía de que su regla apareciera
  *después* que `.modal` en el archivo para ganar el cascade — funcionaba,
  pero es frágil (un reordenamiento futuro del CSS lo rompe en silencio).
  Lo cambié a selector compuesto `.modal.em-modal`, que gana sin
  depender del orden.

**Código sin usar que había:**
- `usePlaylists.removeSong` estaba escrito pero nada lo llamaba. En vez
  de borrarlo, lo conecté: ahora el menú contextual (click derecho /
  botón "⋯" de una canción) muestra "Quitar de esta playlist" cuando
  estás dentro de una playlist, además de las opciones que ya tenía
  ("Guardar/Quitar de Tus favoritos", "Eliminar de tu Biblioteca").

Después de esto volví a correr `tsc --noEmit` en modo estricto y
compilé `App.css` con el CLI de Tailwind v4 para confirmar que nada
quedó roto, y grep sobre todos los `.tsx` para confirmar que no quedó
ningún `<path d="...">` repetido en dos lugares ni ninguna clase CSS sin
usar.

## Archivos NUEVOS

- `Dashboard/PlaylistSection.tsx`
- `Dashboard/hooks/usePlaylists.ts`
- `Dashboard/types/playlist.ts`
- `Dashboard/utils/colors.ts` (paleta + degradado)
- `Dashboard/utils/playback.ts` (la función compartida de play/pause)
- `Dashboard/components/EditPlaylistModal.tsx`
- `Dashboard/components/AddSongsToPlaylistModal.tsx`

## Archivos MODIFICADOS

- `Dashboard/Dashboard.tsx`, `Dashboard/hooks/useMusicLibrary.ts`,
  `Dashboard/components/Resume.tsx`, `Dashboard/components/SongRow.tsx`,
  `Dashboard/components/FavoritesSection.tsx`,
  `Dashboard/components/SongContextMenu.tsx`,
  `Dashboard/components/IconSprite.tsx`,
  `SidebarIzquierdo/SidebarIzquierdo.tsx`, `App.css`.

## Sin cambios (incluidos para poder pegar la carpeta completa)

`constants.ts`, `services/*`, `types/song.ts`, `utils/format.ts`,
`utils/mapSongToTrack.ts`, `AddSongsModal.tsx`, `LibrarySection.tsx`,
`SortDropdown.tsx`, `WitubeModal.tsx`.

## Cómo funciona (sin cambios respecto a la v1)

1. **Crear**: "Crear +" → crea "Mi playlist n°1", luego n°2, n°3... y te
   lleva directo a su vista.
2. **Color random**: cada playlist recibe un color de una paleta fija al
   crearse, usado en el degradado del banner.
3. **Portada**: click en la portada grande → "Editar datos" + abre el
   selector de foto automáticamente. Click en el título → "Editar
   datos" sin abrir el selector.
4. **Sidebar**: cada playlist replica el hover/reproduciendo/pausa de
   "Tus favoritos" (imágenes 8/9/10 que mandaste) — y ahora, con el
   sprite compartido, literalmente usa el mismo SVG en vez de una copia.
5. **Agregar/quitar canciones**: "+ Agregar canciones" abre el buscador
   de tu biblioteca; el menú contextual de una canción dentro de una
   playlist permite quitarla de ahí sin borrarla de la biblioteca.
