import { Badge } from "../../components/atoms/Badge";
import Button from "../../components/atoms/Button";
import ContainerBasic from "../../components/atoms/ContainerBasic"
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCards,
  createCard,
  deleteCard,
  selectCardsList,
} from '../../store/slices/cardsSlice';
import { fetchSets, selectSets } from '../../store/slices/setsSlice';
import ConfirmDialog from '../../components/atoms/ConfirmDialog';

const RARITY_OPTIONS = [
  { value: 1, label: 'Common' },
  { value: 2, label: 'Rare' },
  { value: 3, label: 'Holo' },
  { value: 4, label: 'Super Rare' },
  { value: 5, label: 'Secret Rare' },
];

// Estado de stock derivado de la cantidad disponible.
function stockState(stock) {
  if (stock === 0) return { label: 'AGOTADO', color: 'error' };
  if (stock <= 5) return { label: 'STOCK BAJO', color: 'warning' };
  return { label: 'EN STOCK', color: 'success' };
}

const empty = { name: '', setId: '', rarity: 1, stock: 0, price: '', imageUrl: '' };

const Stock = () => {
  const dispatch = useDispatch();
  const cards = useSelector(selectCardsList);
  const sets = useSelector(selectSets);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCards())
      .unwrap()
      .catch((e) => setError(e || 'No se pudo cargar el inventario.'));
    dispatch(fetchSets())
      .unwrap()
      .catch((e) => setError(e || 'No se pudo cargar el inventario.'));
  }, [dispatch]);

  // Set seleccionado: el elegido manualmente, o el primero disponible por defecto.
  const effectiveSetId = form.setId || sets[0]?.id || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await dispatch(createCard({
        setId: effectiveSetId,
        name: form.name,
        rarity: Number(form.rarity),
        condition: null,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl || null,
      })).unwrap();
      setForm({ ...empty, setId: effectiveSetId });
    } catch (err) {
      setError(err || 'No se pudo crear el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setError(null);
    setDeleting(true);
    try {
      await dispatch(deleteCard(toDelete.id)).unwrap();
      setToDelete(null);
    } catch (err) {
      setError(err || 'No se pudo eliminar el producto.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ContainerBasic>
      <h2 className="text-4xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        Gestión de Inventario
      </h2>
      <p className="text-neutral">Cree nuevos productos, gestione el inventario actual y supervise las variaciones de stock.</p>

      {error && <p className="mt-4" style={{ color: 'var(--color-error)' }}>{error}</p>}

      <div className="p-6 bg-surface shadow-md mt-8">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Añadir Nuevo Producto</h2>
        <div className="w-full h-px mt-4 mb-6" style={{ backgroundColor: 'var(--color-neutral)' }} />

        <form className="grid grid-cols-2 gap-4" onSubmit={handleCreate}>
          <div className="col-span-2 w-full flex flex-col">
            <label htmlFor="name" className="text-sm mb-2">Nombre del Producto</label>
            <input type="text" name="name" id="name" value={form.name} onChange={handleChange} required placeholder="Charizard Base" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-2 w-full flex flex-col">
            <label htmlFor="setId" className="text-sm mb-2">Set</label>
            <select name="setId" id="setId" value={effectiveSetId} onChange={handleChange} required className="p-3 border-neutral border">
              <option value="" disabled>Seleccioná un set…</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.gameName ? ` — ${s.gameName}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="rarity" className="text-sm mb-2">Rareza</label>
            <select name="rarity" id="rarity" value={form.rarity} onChange={handleChange} className="p-3 border-neutral border">
              {RARITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.value} — {o.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="stock" className="text-sm mb-2">Stock Inicial</label>
            <input type="number" name="stock" id="stock" value={form.stock} onChange={handleChange} min="0" placeholder="0" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="price" className="text-sm mb-2">Precio (USD)</label>
            <input type="number" name="price" id="price" value={form.price} onChange={handleChange} min="0" step="0.01" required placeholder="0.00" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="imageUrl" className="text-sm mb-2">URL de Imagen del Producto</label>
            <input type="url" name="imageUrl" id="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-2">
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-surface shadow-md mt-8">
        <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Tabla de Productos</h2>
        <div className="w-full h-px mt-4 mb-6" style={{ backgroundColor: 'var(--color-neutral)' }} />

        <div className="w-full overflow-x-scroll">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral">
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[30%]">Nombre del Producto</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[20%]">Set</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[15%]">Precio</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[10%]">Stock</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[15%]">Estado</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[10%] text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => {
                const estado = stockState(card.stock);
                return (
                  <tr key={card.id} className="hover:bg-neutral/50 transition-colors">
                    <td className="py-5 px-4 text-sm font-bold text-primary pr-6 leading-relaxed">{card.name}</td>
                    <td className="py-5 px-4 text-sm text-neutral">{card.setName}</td>
                    <td className="py-5 px-4 text-sm font-medium text-primary">
                      ${Number(card.price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-5 px-4 text-sm font-bold ${
                      card.stock === 0 ? 'text-error' : card.stock <= 5 ? 'text-warning' : 'text-neutral'
                    }`}>
                      {card.stock}
                    </td>
                    <td className="py-5 px-4">
                      <Badge color={estado.color}>{estado.label}</Badge>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <Link to={`/admin/producto/editar/${card.id}`} className="text-neutral hover:text-primary p-1 transition-colors inline-flex items-center justify-center" aria-label="Editar">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                      </Link>
                      <button onClick={() => setToDelete(card)} className="text-neutral hover:text-error p-1 transition-colors inline-flex items-center justify-center" aria-label="Eliminar">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {cards.length === 0 && (
                <tr><td colSpan={6} className="py-8 px-4 text-center text-neutral">No hay cartas cargadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar Producto"
        message={toDelete ? `¿Estás seguro de eliminar ${toDelete.name} permanentemente?` : ''}
        confirmText="Sí, Eliminar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </ContainerBasic>
  )
}

export default Stock
