import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ContainerBasic from "../components/atoms/ContainerBasic";
import homeImage from '../assets/home.jpg';
import Button from "../components/atoms/Button";
import { ProductCard } from "../components/ProductCard/ProductCard";
import { Link } from "react-router-dom";
import { fetchProducts, selectProducts, selectProductsStatus, selectProductsError } from "../store/slices/catalogSlice";
import { addToCart } from "../store/slices/cartSlice";
import { selectIsLoggedIn, selectUserId } from "../store/slices/authSlice";

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(selectProducts);
    const status = useSelector(selectProductsStatus);
    const productsError = useSelector(selectProductsError);
    const loading = status === 'loading' || status === 'idle';
    const error = !!productsError;
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const userId = useSelector(selectUserId);

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

    return ( <>
        <div className="bg-surface-container-low">
            <ContainerBasic className="py-20 grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 md:col-span-6">
                    <h2 className="text-6xl font-display font-bold mb-7" style={{ color: 'var(--color-primary)' }}>
                        Cura tu Legado <span className="text-secondary">con Artefactos Raros.</span>
                    </h2>
                    <p className="text-lg text-body max-w-2xl" style={{ color: 'var(--color-neutral)' }}>
                        Descubre una selección altamente curada de cartas coleccionables prístinas. Cada pieza autenticada, graduada y presentada para el coleccionista exigente.
                    </p>
                    <Button color="primary" className="my-6 md:mb-0">
                        <Link to="/catalogo">Explorar la Bóveda</Link>
                    </Button>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:col-end-12"><img src={homeImage} alt="Nuestra Historia" className="w-full h-auto rounded-lg shadow-md" /></div>
            </ContainerBasic>
        </div>
        <ContainerBasic className="py-20">
            <div className="flex items-center justify-between mb-9">
                <h2 className="text-2xl font-display font-bold text-center" style={{ color: 'var(--color-primary)' }}>
                    Lo Nuevo
                </h2>
                <Button variant="text" className="" link="/catalogo">
                    <Link to="/catalogo">
                        Ver Todas
                    </Link>
                </Button>
            </div>

            {loading && <p className="text-center text-body py-8">Cargando productos…</p>}
            {error && <p className="text-center py-8" style={{ color: 'var(--color-error)' }}>No se pudieron cargar los productos.</p>}

            {!loading && !error && (
                <div className="grid grid-cols-12 gap-8">
                    {products.slice(0, 4).map((product, index) => (
                        <ProductCard key={product.id}
                            image={product.imageUrl}
                            name={product.name}
                            set={product.setName}
                            gameName={product.gameName}
                            price={product.price}
                            discountedPrice={product.discountedPrice}
                            rarity={product.rarity}
                            link={`/producto/${product.id}`}
                            onAddToCart={() => handleAddToCart(product.itemId)}
                            className={"col-span-12 sm:col-span-4 lg:col-span-3" + (index === 3 ? ' hidden lg:flex' : '')}
                        />
                    ))}
                </div>
            )}
        </ContainerBasic>
    </> );
}

export default Home;
