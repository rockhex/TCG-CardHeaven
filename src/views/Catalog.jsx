import { ProductCard } from '../components/ProductCard/ProductCard';
import { Button } from '../components/atoms/Button';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, selectProductsStatus, selectProductsError } from '../store/slices/catalogSlice';
import { addToCart } from '../store/slices/cartSlice';
import { selectIsLoggedIn, selectUserId } from '../store/slices/authSlice';

// Etiquetas de los niveles de rareza (presentación de los enteros que devuelve el back).
const RARITY_LABELS = { 1: 'Common', 2: 'Rare', 3: 'Holo', 4: 'Super Rare', 5: 'Secret Rare' };

function toggle(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);
  const loading = status === 'loading' || status === 'idle';
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userId = useSelector(selectUserId);

  // El catálogo se pide una sola vez (el thunk se auto-deduplica vía `condition`).
  // La búsqueda NO re-pega al backend: filtra client-side sobre lo ya cargado.
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (itemId) => {
    if (!isLoggedIn) {
      navigate('/ingresar');
      return;
    }
    dispatch(addToCart({ userId, itemId, quantity: 1 }));
  };

  const [showFilters, setShowFilters] = useState(false);
  const [selectedGames, setSelectedGames] = useState(new Set());
  const [selectedSets, setSelectedSets] = useState(new Set());
  const [selectedRarities, setSelectedRarities] = useState(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('relevance');

  // Opciones de filtro derivadas del catálogo real (no hardcodeadas).
  const games = useMemo(
    () => [...new Set(products.map((p) => p.gameName).filter(Boolean))].sort(),
    [products]
  );
  const sets = useMemo(
    () => [...new Set(products.map((p) => p.setName).filter(Boolean))].sort(),
    [products]
  );
  const rarities = useMemo(
    () => [...new Set(products.map((p) => p.rarity).filter((r) => r != null))].sort((a, b) => a - b),
    [products]
  );

  const priceOf = (p) => (p.discountedPrice ?? p.price);

  const visibleProducts = useMemo(() => {
    const term = search?.trim().toLowerCase();
    let list = products.filter((p) => {
      if (term && !p.name?.toLowerCase().includes(term)) return false;
      if (selectedGames.size && !selectedGames.has(p.gameName)) return false;
      if (selectedSets.size && !selectedSets.has(p.setName)) return false;
      if (selectedRarities.size && !selectedRarities.has(p.rarity)) return false;
      if (priceMin !== '' && priceOf(p) < Number(priceMin)) return false;
      if (priceMax !== '' && priceOf(p) > Number(priceMax)) return false;
      return true;
    });

    if (sort === 'price-low') list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === 'price-high') list = [...list].sort((a, b) => priceOf(b) - priceOf(a));

    return list;
  }, [products, search, selectedGames, selectedSets, selectedRarities, priceMin, priceMax, sort]);

  const checkbox = (label, checked, onChange) => (
    <label key={label} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
      <input
        type="checkbox"
        className="w-5 h-5 cursor-pointer"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: 'var(--color-primary)' }}
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <section className="py-12 min-h-screen" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Catálogo de Productos
          </h2>
          <p className="text-base" style={{ color: 'var(--color-neutral)' }}>
            {search
              ? `Resultados para "${search}".`
              : 'Explora nuestra selección curada de cartas coleccionables prístinas, autenticadas y graduadas para el coleccionista exigente.'}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Toggle Button (Mobile) */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              color="primary"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between"
            >
              <span>Filtros</span>
              <span>{showFilters ? '✕' : '☰'}</span>
            </Button>
          </div>

          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 lg:flex-shrink-0`}>
            <div className="space-y-6 rounded-lg p-6 shadow-md" style={{ backgroundColor: 'var(--color-surface)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Filtros</h3>

              {/* Game Filter */}
              {games.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-on-surface)' }}>Juego</h4>
                  <div className="space-y-2">
                    {games.map((g) =>
                      checkbox(g, selectedGames.has(g), () => setSelectedGames((s) => toggle(s, g)))
                    )}
                  </div>
                </div>
              )}

              {/* Set Filter */}
              {sets.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-on-surface)' }}>Set</h4>
                  <div className="space-y-2">
                    {sets.map((s) =>
                      checkbox(s, selectedSets.has(s), () => setSelectedSets((prev) => toggle(prev, s)))
                    )}
                  </div>
                </div>
              )}

              {/* Rarity Filter */}
              {rarities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-on-surface)' }}>Rareza</h4>
                  <div className="space-y-2">
                    {rarities.map((r) =>
                      checkbox(RARITY_LABELS[r] || `Nivel ${r}`, selectedRarities.has(r), () =>
                        setSelectedRarities((prev) => toggle(prev, r))
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-on-surface)' }}>Rango de Precio</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs" style={{ color: 'var(--color-neutral)' }}>Precio Mínimo</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full px-3 py-2 rounded border text-sm mt-1"
                      style={{ borderColor: 'var(--color-outline)', backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: 'var(--color-neutral)' }}>Precio Máximo</label>
                    <input
                      type="number"
                      placeholder="$1000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full px-3 py-2 rounded border text-sm mt-1"
                      style={{ borderColor: 'var(--color-outline)', backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm" style={{ color: 'var(--color-neutral)' }}>
                Mostrando {visibleProducts.length} productos
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="sort" className="text-sm" style={{ color: 'var(--color-on-surface)' }}>Ordenar por:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 rounded border text-sm"
                  style={{ borderColor: 'var(--color-outline)', backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {loading && <p className="text-center py-12 text-body">Cargando productos…</p>}
            {error && <p className="text-center py-12" style={{ color: 'var(--color-error)' }}>No se pudieron cargar los productos.</p>}

            {!loading && !error && (
              visibleProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      image={product.imageUrl}
                      name={product.name}
                      set={product.setName}
                      gameName={product.gameName}
                      price={product.price}
                      discountedPrice={product.discountedPrice}
                      rarity={product.rarity}
                      stock = {product.stock}
                      link={`/producto/${product.id}`}
                      onAddToCart={() => handleAddToCart(product.itemId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--color-neutral)' }}>
                  <p className="text-lg">No hay productos disponibles</p>
                </div>
              )
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Catalog
