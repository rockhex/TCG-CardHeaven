import Button from './Button';

/**
 * ConfirmDialog Component
 * Modal de confirmación controlado, renderizado con React (sin manipular el DOM
 * imperativamente). Se monta sólo cuando `open` es true.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Si el diálogo está visible
 * @param {string} props.title - Título del diálogo
 * @param {React.ReactNode} props.message - Texto/contenido del cuerpo
 * @param {string} props.confirmText - Texto del botón de confirmación (default: 'Confirmar')
 * @param {string} props.cancelText - Texto del botón de cancelar (default: 'Cancelar')
 * @param {string} props.confirmColor - Color del botón de confirmación (default: 'error')
 * @param {boolean} props.loading - Deshabilita los botones mientras se procesa
 * @param {Function} props.onConfirm - Callback al confirmar
 * @param {Function} props.onCancel - Callback al cancelar / cerrar
 * @returns {React.ReactElement|null}
 */
export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={loading ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md p-6 shadow-md border border-neutral"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-display font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          {title}
        </h3>
        {message && <p className="text-neutral mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="outline" color="neutral" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button color={confirmColor} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando…' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
