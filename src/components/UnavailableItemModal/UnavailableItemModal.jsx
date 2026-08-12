import { useSelector, useDispatch } from 'react-redux';
import Button from '../atoms/Button';
import { selectUnavailableItemId, dismissUnavailable } from '../../store/slices/cartSlice';
import { selectProducts } from '../../store/slices/catalogSlice';

/**
 * Modal global de "producto no disponible".
 *
 * Se abre cuando un POST a /cart/items devolvió 404 (item sin stock o eliminado):
 * el thunk addToCart guarda el `unavailableItemId` en el store y este modal,
 * montado una sola vez en el layout de la tienda, reacciona a ese estado. No usa
 * useEffect: se muestra/oculta de forma derivada del estado de Redux.
 */
export const UnavailableItemModal = () => {
  const dispatch = useDispatch();
  const unavailableItemId = useSelector(selectUnavailableItemId);
  const products = useSelector(selectProducts);

  if (!unavailableItemId) return null;

  // Si la carta todavía figura en el catálogo cargado, mostramos su nombre.
  // Si fue eliminada, no estará y caemos a un mensaje genérico.
  const product = products.find((p) => p.itemId === unavailableItemId);

  const close = () => dispatch(dismissUnavailable());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="w-full max-w-md border border-neutral bg-surface shadow-lg"
        style={{ backgroundColor: 'var(--color-surface-container-low)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-6 border-b border-neutral">
          <svg
            className="h-6 w-6 shrink-0"
            style={{ color: 'var(--color-error)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-display font-bold" style={{ color: 'var(--color-primary)' }}>
              Producto no disponible
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {product
                ? <>«<span className="font-medium">{product.name}</span>» ya no está disponible.</>
                : 'El producto que intentaste agregar ya no está disponible.'}{' '}
              Es posible que se haya quedado sin stock o que haya sido eliminado del catálogo.
            </p>
          </div>
        </div>

        <div className="flex justify-end p-6">
          <Button type="button" color="primary" onClick={close}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnavailableItemModal;
