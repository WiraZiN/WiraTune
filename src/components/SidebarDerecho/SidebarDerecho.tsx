import React, { useState, useEffect, useCallback } from "react";

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEK_SIZE     = 7;
const RGB_THRESHOLD = 365;

const RGB_COLORS = [
  "#ff0000", "#ff7300", "#fffb00",
  "#48ff00", "#00ffd5", "#002bff",
  "#7a00ff", "#ff00c8",
];

const STREAK_COLOR_TIERS: [number, string][] = [
  [1,   "#ffd54f"], // Tier 1 — Amarillo suave   (  1–9   días)
  [10,  "#ff9800"], // Tier 2 — Naranja           ( 10–19  días)
  [20,  "#27c7ff"], // Tier 3 — Azul eléctrico    ( 20–29  días)
  [30,  "#19d86f"], // Tier 4 — Verde             ( 30–49  días)
  [50,  "#ff003c"], // Tier 5 — Rojo intenso      ( 50–99  días)
  [100, "#ff10f0"], // Tier 6 — Fucsia neón       (100–199 días)
  [200, "#8f00ff"], // Tier 7 — Violeta           (200–364 días)
  // Tier RGB (≥ 365) → RGB_COLORS ciclando cada 180 ms
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

// ─── Utilidades puras ─────────────────────────────────────────────────────────

function todayAtMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getActiveDaysInCycle(days: number): number {
  if (days === 0) return 0;
  const remainder = days % WEEK_SIZE;
  return remainder === 0 ? WEEK_SIZE : remainder;
}

function getStreakColor(days: number, rgbIndex: number): string {
  if (days === 0) return "#6f6f6f";
  if (days >= RGB_THRESHOLD) return RGB_COLORS[rgbIndex];
  for (let i = STREAK_COLOR_TIERS.length - 1; i >= 0; i--) {
    if (days >= STREAK_COLOR_TIERS[i][0]) return STREAK_COLOR_TIERS[i][1];
  }
  return "#6f6f6f";
}

// ─── Componente ───────────────────────────────────────────────────────────────

const SidebarDerecho: React.FC = () => {
  const [streak, setStreak]                 = useState(368);
  const [cycleStartDate, setCycleStartDate] = useState<Date>(todayAtMidnight);
  const [rgbColorIndex, setRgbColorIndex]   = useState(0);

  // Loop RGB: cicla colores cada 180 ms solo cuando streak ≥ 365
  useEffect(() => {
    const id = setInterval(() => {
      if (streak >= RGB_THRESHOLD) {
        setRgbColorIndex((prev) => (prev + 1) % RGB_COLORS.length);
      }
    }, 180);
    return () => clearInterval(id);
  }, [streak]);

  // Valores derivados del estado
  const activeDays   = getActiveDaysInCycle(streak);
  const currentColor = getStreakColor(streak, rgbColorIndex);
  const isRgbMode    = streak >= RGB_THRESHOLD;
  const streakText   = streak === 1 ? "1 día" : `${streak} días`;
  const progressPct  = `${(activeDays / WEEK_SIZE) * 100}%`;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // +1 día; avanza la ventana semanal al completar un ciclo de 7
  const simularReproduccion = useCallback(() => {
    setStreak((prev) => {
      if (prev > 0 && prev % WEEK_SIZE === 0) {
        setCycleStartDate((d) => {
          const next = new Date(d);
          next.setDate(d.getDate() + WEEK_SIZE);
          return next;
        });
      }
      return prev + 1;
    });
  }, []);

  // Reinicia racha y ventana al estado inicial
  const perderRacha = useCallback(() => {
    setStreak(0);
    setCycleStartDate(todayAtMidnight());
  }, []);

  // Salta al umbral RGB para testear el tier máximo
  const recuperarRacha = useCallback(() => {
    setStreak(RGB_THRESHOLD);
    setCycleStartDate(todayAtMidnight());
  }, []);

  // ─── Datos del grid ───────────────────────────────────────────────────────

  const gridDays = Array.from({ length: WEEK_SIZE }, (_, i) => {
    const date = new Date(cycleStartDate);
    date.setDate(cycleStartDate.getDate() + i);
    return { date, isActive: i < activeDays };
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <article className="streak-card">

      {/* ── Llama animada + contador de días ───────────────────────── */}
      <div className="streak-hero">

        {/* Aura circular */}
        <div className="streak-flame-ring">
          <svg
            className="streak-flame-svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{
              color:  currentColor,
              filter: `drop-shadow(0 0 18px ${currentColor})`,
            }}
          >
            <path d="M13.5 2s.5 2.5-1 4.5-4 2.5-4 7A5.5 5.5 0 0 0 14 19a5 5 0 0 0 5-5c0-4.5-3.5-6-5.5-12Zm-2 9.5c0-1.7 1.2-2.7 2.2-4 .1 1.2.9 2 1.6 2.8.8.9 1.7 1.9 1.7 3.7A3 3 0 0 1 14 17a3.5 3.5 0 0 1-3.5-3.5Z" />
          </svg>
        </div>

        {/* Texto "N días" */}
        <p className="streak-count" aria-live="polite">
          {streakText}
        </p>
      </div>

      {/* ── Barra de progreso semanal ────────────────────────────────
          Se oculta cuando streak ≥ 365 (modo RGB activado)
      ─────────────────────────────────────────────────────────────── */}
      {!isRgbMode && (
        <div
          className="streak-progress-track"
          role="progressbar"
          aria-label="Progreso semanal"
          aria-valuemin={0}
          aria-valuemax={7}
          aria-valuenow={activeDays}
        >
          <div
            className="streak-progress-fill"
            style={{ width: progressPct, background: currentColor }}
          />
        </div>
      )}

      {/* ── Grid de 7 días desde cycleStartDate ─────────────────────
          border y boxShadow dinámicos → inline style por tier de color
      ─────────────────────────────────────────────────────────────── */}
      <div
        className="streak-grid"
        aria-label="Días activos de la semana actual"
      >
        {gridDays.map(({ date, isActive }, i) => (
          <div
            key={i}
            className="streak-day"
            style={
              isActive
                ? {
                    border:    `1px solid ${currentColor}`,
                    boxShadow: isRgbMode
                      ? `0 0 14px ${currentColor}`
                      : `0 0 12px ${currentColor}55`,
                  }
                : undefined
            }
          >
            <span className="streak-day__name">
              {DAY_NAMES[date.getDay()]}
            </span>
            <span className="streak-day__number">
              {date.getDate()}
            </span>
            <span className="streak-day__month">
              {MONTH_NAMES[date.getMonth()]}.
            </span>
            <span className="streak-day__fire" aria-hidden="true">
              {isActive ? "🔥" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* ── Botones de control (simulación de demo) ──────────────── */}
      <div
        className="streak-controls"
        role="group"
        aria-label="Controles de simulación"
      >
        <button
          className="streak-btn streak-btn--primary"
          onClick={simularReproduccion}
        >
          Simular reproducción
        </button>
        <button
          className="streak-btn streak-btn--secondary"
          onClick={perderRacha}
        >
          Perder racha
        </button>
        <button
          className="streak-btn streak-btn--ghost"
          onClick={recuperarRacha}
        >
          Recuperar racha
        </button>
      </div>

    </article>
  );
};

export default SidebarDerecho;