import React from "react";
import Button from "./Button.jsx";
import "./ColorIncrementModal.css";

/**
 * Modal especializado para sugerir incremento de colores cuando no se encuentra solución
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {number} props.currentColors - Número actual de colores
 * @param {number} props.maxColors - Número máximo de colores permitido
 * @param {number} props.attempts - Intentos realizados
 * @param {string} props.algorithm - Nombre del algoritmo ejecutado
 * @param {Function} props.onRetryWithMoreColors - Callback para reintentar con más colores
 * @param {Function} props.onCancel - Callback para cancelar
 */
export default function ColorIncrementModal({
  isOpen,
  currentColors,
  maxColors,
  attempts,
  algorithm,
  onRetryWithMoreColors,
  onCancel,
}) {
  if (!isOpen) return null;

  const siguientesCantidadColores = currentColors + 1;
  const alcanzadoMaximo = siguientesCantidadColores > maxColors;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="color-increment-modal-backdrop" onClick={handleBackdropClick}>
      <div className="color-increment-modal" role="dialog" aria-modal="true">
        <h2 className="modal-title">
          No se encontró una solución válida
        </h2>

        <p className="modal-message">
          El algoritmo <strong>{algorithm}</strong> no pudo encontrar una coloración válida
          después de realizar los intentos especificados.
        </p>

        <div className="modal-details">
          <div className="detail-item">
            <strong>Intentos realizados:</strong>{' '}
            <span className="detail-value">{attempts.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <strong>Colores utilizados:</strong>{' '}
            <span className="detail-value">{currentColors}</span>
          </div>
          {!alcanzadoMaximo && (
            <div className="detail-item">
              <strong>Siguiente intento con:</strong>{' '}
              <span className="detail-value">{siguientesCantidadColores} colores</span>
            </div>
          )}
        </div>

        {alcanzadoMaximo ? (
          <>
            <p className="modal-message error-message">
              Ya se alcanzó el límite máximo de <strong>{maxColors} colores</strong>.
              <br />
              No es posible incrementar más colores.
            </p>
            <div className="modal-buttons">
              <Button
                variant="primary"
                onClick={onCancel}
                style={{ minWidth: '150px' }}
              >
                Entendido
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-message">
              ¿Desea intentar nuevamente con <strong>{siguientesCantidadColores} colores</strong>?
            </p>

            <div className="modal-buttons">
              <Button
                variant="secondary"
                onClick={onCancel}
                style={{ minWidth: '120px' }}
              >
                No, cancelar
              </Button>
              <Button
                variant="primary"
                onClick={onRetryWithMoreColors}
                style={{ minWidth: '120px' }}
              >
                Sí, reintentar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
