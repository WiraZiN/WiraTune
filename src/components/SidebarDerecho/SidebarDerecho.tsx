import React, { useState, useEffect } from "react";

const SidebarDerecho: React.FC = () => {
  const [streakCount, setStreakCount] = useState(1); // Default to 4 days
  const [cpuUsage, setCpuUsage] = useState(6);
  const [ramUsage, setRamUsage] = useState(9);
  const [fps, setFps] = useState(120);
  const [ramGb, setRamGb] = useState(1.9);

  // Simulate stats updates to make the UI dynamic and feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return Math.max(2, Math.min(25, next));
      });

      setRamUsage((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const next = prev + change;
        return Math.max(5, Math.min(15, next));
      });

      setFps((prev) => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + change;
        return Math.max(110, Math.min(144, next));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update RAM GB display dynamically based on simulated percentage
  useEffect(() => {
    const nextGb = (16 * ramUsage) / 100;
    setRamGb(parseFloat(nextGb.toFixed(1)));
  }, [ramUsage]);

  const handleRecoverStreak = () => {
    setStreakCount(0);
  };

  // Days of the week
  const daysOfWeek = ["L", "M", "M", "J", "V", "S", "D"];
  // We can fill completion based on streakCount dynamically
  const isCompleted = (index: number) => {
    return index < streakCount;
  };

  return (
    <aside className="r-panel" id="sidebarDerecho">
      <div className="r-panel-scroll">
        <section className="r-card">
          <div aria-hidden="true" className="r-title-row streak-head-clean">
            <span className="r-card-title">Racha de Actividad</span>
          </div>
          <div className="streak-hero streak-hero-centered">
            <div className="flame-wrap">
              <svg
                aria-hidden="true"
                fill="currentColor"
                id="streakFlame"
                viewBox="0 0 24 24"
              >
                <path d="M13.5 2s.5 2.5-1 4.5-4 2.5-4 7A5.5 5.5 0 0 0 14 19a5 5 0 0 0 5-5c0-4.5-3.5-6-5.5-12Zm-2 9.5c0-1.7 1.2-2.7 2.2-4 .1 1.2.9 2 1.6 2.8.8.9 1.7 1.9 1.7 3.7A3 3 0 0 1 14 17a3.5 3.5 0 0 1-3.5-3.5Z" />
              </svg>
            </div>
            <div className="streak-info streak-info-centered">
              <div className="streak-count">
                <span id="streakCount">{streakCount}</span>{" "}
                <span id="streakDayUnit">
                  {streakCount === 1 ? "día" : "días"}
                </span>
              </div>
            </div>
          </div>
          <div className="streak-status" id="streakStatus">
            {streakCount > 0
              ? "¡Excelente progreso! Sigue adelante."
              : "Inicia tu racha de hoy"}
          </div>

          <div className="streak-grid" id="streakWeek">
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className={`streak-day-cell ${isCompleted(index) ? "completed" : ""}`}
              >
                <span className="streak-day-label">{day}</span>
                <div className="streak-day-dot">
                  {isCompleted(index) && (
                    <svg
                      className="icono-check-racha"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="streak-test-row streak-test-row-centered">
            <button
              className="streak-test-btn streak-recover-btn"
              id="streakRecoverBtn"
              type="button"
              onClick={handleRecoverStreak}
            >
              Recuperar racha
            </button>
          </div>
        </section>

        <section className="r-card">
          {/*Añadir gif*/}
          <img />
        </section>

        <div className="perf-stack">
          <section className="perf-card">
            <div
              className="perf-ring"
              id="cpuRing"
              style={
                {
                  "--p": cpuUsage,
                  "--accent": "#1db954",
                } as React.CSSProperties
              }
            >
              <div className="perf-center">
                <div className="perf-value" id="cpuValue">
                  {cpuUsage}%
                </div>
                <div className="perf-label">CPU</div>
                <div className="perf-note" id="cpuNote">
                  {fps} FPS aprox.
                </div>
              </div>
            </div>
          </section>

          <section className="perf-card">
            <div
              className="perf-ring"
              id="ramRing"
              style={
                {
                  "--p": ramUsage,
                  "--accent": "#4aa3ff",
                } as React.CSSProperties
              }
            >
              <div className="perf-center">
                <div className="perf-value" id="ramValue">
                  {ramUsage}%
                </div>
                <div className="perf-label">RAM</div>
                <div className="perf-note" id="ramNote">
                  {ramGb} GB usados
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
};

export default SidebarDerecho;
