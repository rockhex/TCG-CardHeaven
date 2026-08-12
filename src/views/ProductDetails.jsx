import { useEffect,useState } from 'react';
import ContainerBasic from '../components/atoms/ContainerBasic';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from '../components/atoms/Badge';
import Price from '../components/atoms/Price';
import Button from '../components/atoms/Button';
import {
  fetchProductById,
  selectCurrentProduct,
  selectCurrentProductStatus,
  clearCurrentProduct,
} from '../store/slices/catalogSlice';
import { addToCart } from '../store/slices/cartSlice';
import { selectIsLoggedIn, selectUserId } from '../store/slices/authSlice';

const rarityConfig = {
  1: { label: 'Common', color: 'primary', variant: 'outline' },
  2: { label: 'Rare', color: 'primary', variant: 'outline' },
  3: { label: 'Holo', color: 'accent', variant: 'outline' },
  4: { label: 'Super Rare', color: 'secondary', variant: 'outline' },
  5: { label: 'Secret Rare', color: 'secondary', variant: 'filled' }
};


const BagIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"/></svg>
)




const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userId = useSelector(selectUserId);
  const product = useSelector(selectCurrentProduct);
  const status = useSelector(selectCurrentProductStatus);
  const loading = status === 'loading' || status === 'idle';
  const error = status === 'failed';
  const [stockError, setStockError] = useState(null);
  const cartItems = useSelector(state => state.cart.items);

  // 🔥 calcular carrito y stock restante (IMPORTANTE: fuera del handler)
  const cartItem = cartItems.find(
    item => item.itemId === product?.itemId
  );

  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const remainingStock = (product?.stock || 0) - cartQuantity;


  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

 
  const handleAddToCart = () => {
  if (!isLoggedIn) {
    navigate('/ingresar');
    return;
  }

  
  if (remainingStock <= 0) {
    setStockError('No hay más stock disponible');
    return;
  }

  dispatch(addToCart({
    userId,
    itemId: product.itemId,
    quantity: 1
  }));
};


  if (loading) {
    return <section className="py-12 min-h-screen"><ContainerBasic><p className="text-body">Cargando producto…</p></ContainerBasic></section>;
  }

  if (error || !product) {
    return (
      <section className="py-12 min-h-screen">
        <ContainerBasic>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Producto no encontrado</h2>
          <Link to="/catalogo" className="hover:underline">Volver al catálogo</Link>
        </ContainerBasic>
      </section>
    );
  }

  const rarityInfo = product.rarity ? rarityConfig[product.rarity] : null;

  return (<section className="py-12 min-h-screen" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
    <ContainerBasic className="grid grid-cols-12 gap-6">
      <p className="col-span-12 text-sm mb-4 text-body">
        <Link to="/catalogo" className="uppercase hover:underline">SETS</Link> &gt; <Link to="/catalogo" className="uppercase hover:underline">{product.setName}</Link> &gt; <span className="uppercase font-bold">{product.name}</span>
      </p>
      <div className="col-span-12 md:col-span-5 p-6 bg-surface shadow-md h-fit">
        <img src={product.imageUrl} alt={product.name} className="w-full h-auto rounded-lg shadow-md" />
      </div>
      <div className="col-span-12 md:col-span-6 md:col-end-13">
        {rarityInfo && (<Badge variant={rarityInfo.variant} color={rarityInfo.color}>
          {rarityInfo.label}
        </Badge>)}
        <h2 className="text-4xl font-display font-bold my-4" style={{ color: 'var(--color-primary)' }}>
          {product.name}
        </h2>
        <Price originalPrice={product.price} discountedPrice={product.discountedPrice} className="mb-6" />
        <p className="text-base text-body mb-6">
          {product.description || 'Descripción detallada del producto. Aquí puedes incluir información sobre la carta, su historia, características especiales, etc.'}
        </p>
        <div className="mb-4">
          <p className="text-sm text-body mb-2">
  Stock disponible: <span className="font-bold">{remainingStock}</span>
</p>
          
        </div>
        <Button color="secondary" className="w-full" onClick={handleAddToCart}  disabled = {product.stock <= 0} leftIcon={<BagIcon />}>
           {product.stock > 0 ? 'Añadir al Carrito' : 'Sin stock'}
        </Button>
      </div>
      <div className="col-span-12 mt-12">
        <h3 className="text-2xl font-display font-bold pb-6 border-b-2 border-primary mb-6">
          Detalles del Producto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-display font-semibold mb-2">Set</h4>
            <p className="text-base text-body">{product.setName}</p>
          </div>
          <div>
            <h4 className="text-lg font-display font-semibold mb-2">Juego</h4>
            <p className="text-base text-body">{product.gameName}</p>
          </div>
          <div>
            <h4 className="text-lg font-display font-semibold mb-2">Rareza</h4>
            <p className="text-base text-body">{rarityInfo ? `${product.rarity}: ${rarityInfo.label}` : 'No especificada'}</p>
          </div>
          <div>
            <h4 className="text-lg font-display font-semibold mb-2">Condición</h4>
            <p className="text-base text-body">{product.condition || 'No especificada'}</p>
          </div>
        </div>
      </div>
      { product.cards && product.cards.length > 0 && (
        <div className="col-span-12 mt-12">
          <h3 className="text-2xl font-display font-bold pb-6 border-b-2 border-primary mb-6">
            Contenido del Mazo
          </h3>
          <div className="flex flex-col">
            {product.cards.map((card) => (
              <DeckContent key={card.cardId} card={card} />
            ))}
          </div>
        </div>
      )}
    </ContainerBasic>
  </section>)
}

const DeckContent = ({ card }) => {
  const rarityInfo = card.rarity ? rarityConfig[card.rarity] : null;
  return (
    <Link to={`/producto/${card.cardId}`} className={"flex justify-between items-center p-4 border-b border-neutral hover:bg-surface transition-colors " + (card.rarity >= 4 ? "bg-secondary/30" : "")}>
      <div className='flex items-center gap-3'>
        <div className="px-3 py-2 text-sm text-center">
          {card.quantity}x
        </div>
        <h4 className="text-sm font-semibold">{card.name}</h4>
      </div>
      <div className='flex items-center gap-3'>
        { rarityInfo && (<p className="text-sm uppercase">{rarityInfo.label}</p>)}
        <ArrowIcon className='w-5 h-5' />
      </div>
    </Link>
  );
}

const ArrowIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
      <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
  </svg>
);

export default ProductDetails
