import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ContainerBasic from '../../components/atoms/ContainerBasic';
import Button from '../../components/atoms/Button';
import { fetchCardById, updateCard, deleteCard, selectCurrentCard } from '../../store/slices/cardsSlice';
import { fetchSets, selectSets } from '../../store/slices/setsSlice';

const RARITY_OPTIONS = [
  { value: 1, label: 'Common' },
  { value: 2, label: 'Rare' },
  { value: 3, label: 'Holo' },
  { value: 4, label: 'Super Rare' },
  { value: 5, label: 'Secret Rare' },
];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const card = useSelector(selectCurrentCard);
  const sets = useSelector(selectSets);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch(fetchCardById(id)).unwrap(),
      dispatch(fetchSets()).unwrap(),
    ]).catch((err) => setError(err));
  }, [dispatch, id]);

  // Una vez que llega la carta del store, inicializa el form local de edición.
  useEffect(() => {
    if (card && card.id === id) {
      setForm({
        name: card.name ?? '',
        setId: card.setId ?? '',
        rarity: card.rarity ?? 1,
        condition: card.condition ?? '',
        stock: card.stock ?? 0,
        price: card.price ?? '',
        imageUrl: card.imageUrl ?? '',
      });
    }
  }, [card, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await dispatch(updateCard({
        id,
        data: {
          setId: form.setId,
          name: form.name,
          rarity: Number(form.rarity),
          condition: form.condition || null,
          price: Number(form.price),
          stock: Number(form.stock),
          imageUrl: form.imageUrl || null,
        },
      })).unwrap();
      navigate('/admin/inventario');
    } catch (err) {
      setError(err || 'No se pudo guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await dispatch(deleteCard(id)).unwrap();
      navigate('/admin/inventario');
    } catch (err) {
      setError(err || 'No se pudo eliminar el producto.');
    }
  };

  if (error && !form) {
    return <ContainerBasic><p style={{ color: 'var(--color-error)' }}>No se pudo cargar el producto.</p></ContainerBasic>;
  }
  if (!form) {
    return <ContainerBasic><p className="text-body">Cargando…</p></ContainerBasic>;
  }

  return (
    <ContainerBasic className="grid grid-cols-3 gap-6">
      <div className="col-span-3 lg:col-span-2">
        <h2 className="text-4xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Editar Producto</h2>

        {error && <p className="mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>}

        <form className="grid grid-cols-2 gap-4 p-6 bg-surface shadow-md" onSubmit={handleSubmit}>
          <div className="col-span-2 w-full flex flex-col">
            <label htmlFor="name" className="text-sm mb-2">Nombre del Producto</label>
            <input type="text" name="name" id="name" value={form.name} onChange={handleChange} required className="p-3 border-neutral border" />
          </div>
          <div className="col-span-2 w-full flex flex-col">
            <label htmlFor="setId" className="text-sm mb-2">Set</label>
            <select name="setId" id="setId" value={form.setId} onChange={handleChange} required className="p-3 border-neutral border">
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
            <label htmlFor="condition" className="text-sm mb-2">Condición</label>
            <input type="text" name="condition" id="condition" value={form.condition} onChange={handleChange} placeholder="Near Mint" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="stock" className="text-sm mb-2">Stock</label>
            <input type="number" name="stock" id="stock" value={form.stock} onChange={handleChange} min="0" className="p-3 border-neutral border" />
          </div>
          <div className="col-span-1 w-full flex flex-col">
            <label htmlFor="price" className="text-sm mb-2">Precio (USD)</label>
            <input type="number" name="price" id="price" value={form.price} onChange={handleChange} min="0" step="0.01" required className="p-3 border-neutral border" />
          </div>
          <div className="col-span-2 w-full flex flex-col">
            <label htmlFor="imageUrl" className="text-sm mb-2">URL de Imagen</label>
            <input type="url" name="imageUrl" id="imageUrl" value={form.imageUrl} onChange={handleChange} className="p-3 border-neutral border" />
          </div>
          <div className="col-span-2 flex gap-4">
            <Button type="submit" color="primary" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar Cambios'}</Button>
            <Button type="button" variant="outline" color="neutral" onClick={() => navigate('/admin/inventario')}>Cancelar</Button>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex items-start justify-center">
        {form.imageUrl && <img src={form.imageUrl} alt={form.name} className="w-full" />}
      </div>

      <div className="border-error bg-error/2 border col-span-3 p-6 grid grid-cols-3 gap-4 items-center">
        <div className="col-span-2">
          <h3 className="text-xl font-display font-bold mb-4 text-error">Eliminar Producto</h3>
          <p>Una vez eliminado este artículo no se puede recuperar.</p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" color="error" onClick={() => setShowDeleteModal(true)}>Eliminar</Button>
        </div>
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                
                <h3 className="text-lg font-bold text-error mb-2">
                  Confirmar eliminación
                </h3>

                <p className="text-sm mb-4">
                  Estás por eliminar este producto. Esta acción no se puede deshacer.
                </p>

                <p className="text-sm font-semibold mb-6">
                  ¿Estás completamente seguro?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 border rounded"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={async () => {
                      try {
                        await dispatch(deleteCard(id)).unwrap();
                        navigate('/admin/inventario');
                      } catch (err) {
                        setError(err || 'No se pudo eliminar el producto.');
                      }
                    }}
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </ContainerBasic>
  );
};

export default EditProduct
