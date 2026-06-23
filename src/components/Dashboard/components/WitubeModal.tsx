interface WitubeModalProps {
  onClose: () => void;
}

export function WitubeModal({ onClose }: WitubeModalProps) {
  return (
    <div
      className="modal-bg"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal wt-modal" role="dialog" aria-modal="true" aria-labelledby="wt-modal-ttl">
        <div className="modal-hdr">
          <span className="modal-ttl" id="wt-modal-ttl">WiTube</span>
          <button className="btn-close" type="button" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-bdy wt-modal-bdy">Hola mundo!</div>
      </div>
    </div>
  );
}

