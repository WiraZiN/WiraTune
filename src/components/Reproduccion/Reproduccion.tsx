import React, { useEffect, useRef, useState } from "react";
import { ItemBiblioteca } from "../../interfaces/itemBiblioteca";
import { MusicSvg } from "../../icons/music-svg";

interface ReproduccionProps {
  activeTrack: ItemBiblioteca | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const FALLBACK_DURATION = 230;

const Reproduccion: React.FC<ReproduccionProps> = ({
  activeTrack,
  isPlaying,
  setIsPlaying,
}) => {
  const [segundos, setSegundos] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [volume, setVolume] = useState(40);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(70);
  const [duracionTotalSegundos, setDuracionTotalSegundos] = useState(FALLBACK_DURATION);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isDragged = useRef(false);

  const canPlay = Boolean(activeTrack?.file);
  const trackName = activeTrack?.nombre ?? activeTrack?.title ?? "—";
  const trackArtist = activeTrack?.artista || "Artista desconocido";
  const currentVolume = isMuted ? 0 : volume;
  const pctProgreso = duracionTotalSegundos > 0 ? (segundos / duracionTotalSegundos) * 100 : 0;

  const formatearTiempo = (secs: number) => {
    const safeSecs = Math.max(0, Math.floor(secs));
    const mins = Math.floor(safeSecs / 60);
    const restantes = safeSecs % 60;
    return `${mins}:${restantes < 10 ? "0" : ""}${restantes}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = currentVolume / 100;
    audio.muted = isMuted || currentVolume === 0;
  }, [currentVolume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    setSegundos(0);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!audio || !activeTrack?.file) {
      setDuracionTotalSegundos(activeTrack?.dur ?? FALLBACK_DURATION);
      return;
    }

    const objectUrl = URL.createObjectURL(activeTrack.file);
    objectUrlRef.current = objectUrl;
    audio.src = objectUrl;
    audio.load();
    setDuracionTotalSegundos(activeTrack.dur ?? FALLBACK_DURATION);

    return () => {
      if (objectUrlRef.current === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrlRef.current = null;
      }
    };
  }, [activeTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    if (!canPlay) {
      if (isPlaying) setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      void audio.play().catch(err => {
        // AbortError ocurre al cambiar de canción: no es un fallo real, ignorar
        if ((err as DOMException).name !== 'AbortError') {
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [canPlay, isPlaying, setIsPlaying, activeTrack]); // ← añadir activeTrack

  useEffect(() => {
    if (!ghostRef.current) return;
    ghostRef.current.style.width = `${currentVolume}%`;
  }, [currentVolume, isVolumeDragging]);

  const handlePlayPause = () => {
    if (!activeTrack) return;
    if (!canPlay) return;
    setIsPlaying(!isPlaying);
  };

  const handleRepeatCycle = () => {
    if (!activeTrack) return;
    setRepeat(prev => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const handleShuffleToggle = () => {
    if (!activeTrack) return;
    setShuffle(!shuffle);
  };

  const handleMuteToggle = () => {
    if (isMuted || currentVolume === 0) {
      const restoredVolume = prevVolume > 0 ? prevVolume : 70;
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlay || !progressRef.current || !audioRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const nextSecond = Math.round(pct * duracionTotalSegundos);

    audioRef.current.currentTime = nextSecond;
    setSegundos(nextSecond);
  };

  const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = volumeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newVolume = Math.round(pct * 100);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const newVolume = Math.round(percent * 100);

    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (!ghostRef.current) return;
    ghostRef.current.style.width = `${percent * 100}%`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragged.current = true;
    setIsVolumeDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragged.current) return;
    handleMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragged.current = false;
    setIsVolumeDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (ghostRef.current) {
      ghostRef.current.style.width = `${currentVolume}%`;
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setSegundos(Math.floor(audioRef.current.currentTime));
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return;
    const duration = Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : 0;
    if (duration > 0) {
      setDuracionTotalSegundos(Math.floor(duration));
    } else if (activeTrack?.dur) {
      setDuracionTotalSegundos(activeTrack.dur);
    }
  };

  const handleAudioEnded = () => {
    if (!audioRef.current) return;

    if (repeat === "one" || repeat === "all") {
      audioRef.current.currentTime = 0;
      setSegundos(0);
      void audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }

    setIsPlaying(false);
    audioRef.current.currentTime = 0;
    setSegundos(0);
  };

  return (
    <footer className="app-footer">
      <div className="player" id="wt-player-root">
        <div className="player-left">
          <div className="player-thumb">
            <MusicSvg color='#404040' height='3em' width='3em' />
          </div>

          <div className="player-info">
            <span
              className={`player-title ${!activeTrack ? "is-empty" : ""}`}
              id="wt-title"
            >
              {trackName}
            </span>
            <span
              className={`player-artist ${!activeTrack ? "is-empty" : ""}`}
              id="wt-artist"
            >
              {trackArtist}
            </span>
          </div>
        </div>

        <div className="player-center">
          <div className="player-controls">
            <button
              className={`p-btn ${!activeTrack ? "is-disabled" : ""} ${shuffle ? "is-active" : ""}`}
              id="wt-shuffle"
              aria-label="Aleatorio"
              type="button"
              onClick={handleShuffleToggle}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <button
              className={`p-btn ${!activeTrack ? "is-disabled" : ""}`}
              id="wt-prev"
              aria-label="Anterior"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 20L9 12L19 4V20Z" />
                <rect x="5" y="4" width="2" height="16" rx="1" />
              </svg>
            </button>

            <button
              className={`p-play ${!activeTrack || !canPlay ? "is-disabled" : ""}`}
              id="wt-play"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              type="button"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <svg
                  id="wt-play-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  id="wt-play-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5V19L19 12L8 5Z" />
                </svg>
              )}
            </button>

            <button
              className={`p-btn ${!activeTrack ? "is-disabled" : ""}`}
              id="wt-next"
              aria-label="Siguiente"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 4L15 12L5 20V4Z" />
                <rect x="17" y="4" width="2" height="16" rx="1" />
              </svg>
            </button>

            <button
              className={`p-btn ${!activeTrack ? "is-disabled" : ""} ${repeat !== "off" ? "is-active" : ""}`}
              id="wt-repeat"
              aria-label="Repetir"
              type="button"
              onClick={handleRepeatCycle}
            >
              <svg
                id="wt-repeat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9A4 4 0 0 1 7 5H21" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13V15A4 4 0 0 1 17 19H3" />
              </svg>
              {repeat === "one" && <span className="repeat-badge-one">1</span>}
            </button>
          </div>

          <div className="progress-row">
            <span className="p-time" id="wt-current">
              {formatearTiempo(segundos)}
            </span>

            <div
              className={`progress-bar ${!activeTrack ? "is-disabled" : ""}`}
              id="wt-progress-bar"
              role="slider"
              aria-label="Progreso de reproducción"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pctProgreso}
              ref={progressRef}
              onClick={handleProgressSeek}
            >
              <div className="progress-ghost" id="wt-progress-ghost"></div>
              <div
                className="progress-fill"
                id="wt-progress-fill"
                style={{ width: `${pctProgreso}%` }}
              >
                <div className="progress-thumb"></div>
              </div>
            </div>

            <span className="p-time" id="wt-total">
              {formatearTiempo(duracionTotalSegundos)}
            </span>
          </div>
        </div>

        <div className="player-right">
          <div className="volume-container">
            <button
              className="volume-btn"
              id="wt-vol-btn"
              aria-label="Volumen"
              type="button"
              onClick={handleMuteToggle}
            >
              {isMuted || volume === 0 ? (
                <svg
                  id="wt-vol-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : volume <= 50 ? (
                <svg
                  id="wt-vol-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              ) : (
                <svg
                  id="wt-vol-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            <div className="volume-wrapper">
              <div
                className={`volume-bar ${isVolumeDragging ? "is-dragging" : ""}`}
                id="wt-vol-bar"
                role="slider"
                aria-label="Volumen"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={currentVolume}
                ref={volumeRef}
                onClick={handleVolumeSeek}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div
                  className="volume-ghost"
                  id="wt-vol-ghost"
                  ref={ghostRef}
                ></div>
                <div
                  className="volume-fill"
                  id="wt-vol-fill"
                  style={{ width: `${currentVolume}%` }}
                >
                  <div
                    className="volume-thumb"
                    style={{ right: "-6px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      </div>
    </footer>
  );
};

export default Reproduccion;
