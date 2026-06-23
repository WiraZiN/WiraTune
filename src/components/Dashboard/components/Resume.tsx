import { Format } from '../utils/format';

interface DashboardProps {
  songCount: number;
  favoriteCount: number;
  totalDurationSeconds: number;
}

export function Resume({ songCount, favoriteCount, totalDurationSeconds }: DashboardProps) {
  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="dash-title">
        Resumen rápido de tu música
      </h1>
      <p className="dash-sub">
        Aquí verás un resumen general de tu biblioteca antes de la lista de canciones.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Canciones</span>
          <span className="stat-val">{songCount}</span>
          <span className="stat-desc">Canciones cargadas en tu biblioteca.</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Playlists</span>
          <span className="stat-val">0</span>
          <span className="stat-desc">Crea tu primera playlist.</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Favoritos</span>
          <span className="stat-val">{favoriteCount}</span>
          <span className="stat-desc">Tus canciones favoritas aparecerán aquí.</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Duración total</span>
          <span className="stat-val">{Format.totalDuration(totalDurationSeconds)}</span>
          <span className="stat-desc">La duración total de tu biblioteca.</span>
        </div>
      </div>
    </section>
  );
}

