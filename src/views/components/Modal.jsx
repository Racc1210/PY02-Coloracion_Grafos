import React from "react";
import { THEME_COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, Z_INDEX } from "../constants/theme.js";
import Button from "./Button.jsx";

/**
 * Componente Modal para mostrar alertas y advertencias con fondo oscurecido
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {'warning'|'error'|'info'|'success'} props.variant - Variante/tipo de modal
 * @param {string} props.confirmText - Texto del botón de confirmación
 * @param {string} props.cancelText - Texto del botón de cancelar (si es null, solo muestra confirmar)
 * @param {Function} props.onConfirm - Función ejecutada al confirmar (si es null, usa onClose)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'warning',
  confirmText = 'Aceptar',
  cancelText = null,
  onConfirm = null,
}) {
  if (!isOpen) return null;

  // Mapeo de colores por variante
  const coloresVariante = {
    warning: {
      title: '#f59e0b',
      icon: '⚠️',
      titleShadow: 'rgba(245, 158, 11, 0.3)',
    },
    error: {
      title: '#ef4444',
      icon: '❌',
      titleShadow: 'rgba(239, 68, 68, 0.3)',
    },
    info: {
      title: '#3b82f6',
      icon: 'ℹ️',
      titleShadow: 'rgba(59, 130, 246, 0.3)',
    },
    success: {
      title: '#22c55e',
      icon: '✓',
      titleShadow: 'rgba(34, 197, 94, 0.3)',
    },
  };

  const colores = coloresVariante[variant] || coloresVariante.warning;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.MODAL,
    animation: 'fadeIn 0.2s ease-out',
  };

  const modalStyle = {
    background: THEME_COLORS.BG_PRIMARY,
    border: `2px solid ${colores.title}`,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XXL,
    maxWidth: '420px',
    width: '85%',
    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px ${colores.titleShadow}`,
    animation: 'scaleIn 0.2s ease-out',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.LG,
    marginBottom: SPACING.XL,
  };

  const iconStyle = {
    fontSize: '2rem',
    lineHeight: 1,
  };

  const titleStyle = {
    margin: 0,
    fontSize: FONT_SIZE.XXL,
    fontWeight: '600',
    color: colores.title,
    textShadow: `0 0 10px ${colores.titleShadow}`,
  };

  const contentStyle = {
    fontSize: FONT_SIZE.BASE,
    color: THEME_COLORS.TEXT_SECONDARY,
    lineHeight: '1.6',
    marginBottom: SPACING.XXL,
  };

  const buttonsStyle = {
    display: 'flex',
    gap: SPACING.LG,
    justifyContent: 'flex-end',
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      <div style={backdropStyle} onClick={handleBackdropClick}>
        <div style={modalStyle} role="dialog" aria-modal="true">
          <div style={headerStyle}>
            <span style={iconStyle}>{colores.icon}</span>
            <h2 style={titleStyle}>{title}</h2>
          </div>
          <div style={contentStyle}>
            {children}
          </div>
          <div style={buttonsStyle}>
            {cancelText && (
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            <Button
              variant={variant === 'error' ? 'danger' : 'primary'}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
