import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ContainerBasic from '../components/atoms/ContainerBasic'
import { Badge } from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import { useNavigate } from 'react-router-dom'
import { selectIsLoggedIn, selectUserId } from '../store/slices/authSlice'
import { selectCartItems, addToCart, setQuantity, removeFromCart } from '../store/slices/cartSlice'
import { fetchProducts, selectProducts } from '../store/slices/catalogSlice'
import { money } from '../utils/orderStatus'

const Cart = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const userId = useSelector(selectUserId)
    const items = useSelector(selectCartItems)
    const products = useSelector(selectProducts)

    // El catálogo se usa para resolver nombre/precio/imagen de cada línea del carrito.
    // El thunk se auto-deduplica (`condition`): si ya está cargado, no re-pega.
    useEffect(() => {
        dispatch(fetchProducts())
    }, [dispatch])

    // Mapa itemId -> producto para resolver nombre/precio/imagen de cada línea.
    const byItemId = useMemo(() => {
        const map = new Map()
        for (const p of products) map.set(p.itemId, p)
        return map
    }, [products])

    const lines = items.map((it) => {
        const product = byItemId.get(it.itemId)
        const price = Number(product?.price ?? 0)
        
        return {
            itemId: it.itemId,
            quantity: it.quantity ?? 0,
            name: product?.name ?? 'Producto',
            img: product?.imageUrl,
            price,
            stock: product?.stock ?? 0,
            lineTotal: price * it.quantity,
        }
    })

    const total = lines.reduce((acc, l) => acc + l.lineTotal, 0)
    
    const hasStockIssues = lines.some(
            (item) => item.quantity > item.stock
            );
    const handleSetQuantity = (itemId, quantity) => {
        dispatch(setQuantity({ userId, itemId, quantity }))
    }

    const handleAddOne = (itemId) => {
        dispatch(addToCart({ userId, itemId, quantity: 1 }))
    }

    const handleRemove = (itemId) => {
        dispatch(removeFromCart({ userId, itemId }))
    }

    if (!isLoggedIn) {
        return (
            <ContainerBasic className="py-12 min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="space-y-6 p-6 shadow-sm border-neutral border max-w-2xl mx-auto text-center"
                    style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                    <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Carrito</h2>
                    <p className="text-gray-500">Iniciá sesión para ver tu carrito.</p>
                    <Button color="primary" onClick={() => navigate('/ingresar')}>Ingresar</Button>
                </div>
            </ContainerBasic>
        )
    }

    return (
        <ContainerBasic className="py-12 min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div
                className="space-y-6 p-6 shadow-sm border-neutral border max-w-2xl mx-auto"
                style={{ backgroundColor: 'var(--color-surface-container-low)' }}
            >
                <h2 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                    Carrito
                </h2>

                {lines.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                        <p className="text-gray-500">Tu carrito está vacío.</p>
                        <Button color="primary" onClick={() => navigate('/catalogo')}>
                            Volver al Catálogo
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 divide-y divide-neutral/10">
                            {lines.map((item, index) => (
                                <div
                                    key={item.itemId}
                                    className={`grid grid-cols-6 gap-4 items-center ${index > 0 ? 'pt-6' : ''}`}
                                >
                                    <div className="relative col-span-1">
                                        <Badge className="absolute top-[-5px] right-[-5px]">{item.quantity}</Badge>
                                        {item.img && <img src={item.img} alt={item.name} className="w-full h-auto rounded-sm object-cover aspect-square" />}
                                    </div>

                                    <div className="col-span-3 flex flex-col justify-center pl-2">
                                        <p className="font-bold font-family-display text-base md:text-lg leading-snug">{item.name}</p>

                                        <div className="flex items-center space-x-2 mt-2 text-xs">
                                            
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-2 mt-2 text-xs">
                                                    <button
                                                        type="button"
                                                        
                                                        onClick={() => {
                                                            const newQty =
                                                                item.quantity > item.stock
                                                                ? item.stock
                                                                : item.quantity - 1

                                                            handleSetQuantity(item.itemId, newQty)
                                                            }}
                                                        className="w-6 h-6 border border-neutral/50 flex items-center justify-center font-bold rounded-sm"
                                                    >
                                                        -
                                                    </button>

                                                    <span className="font-bold px-1">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => { if (item.quantity < item.stock) {
                                                                                    handleAddOne(item.itemId)}}}
                                                        disabled={item.quantity >= item.stock}
                                                        className={`w-6 h-6 border border-neutral/50 flex items-center justify-center font-bold rounded-sm transition-colors ${
                                                            item.quantity >= item.stock
                                                                ? 'opacity-50 cursor-not-allowed'
                                                                : 'hover:bg-black/5'
                                                        }`}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {item.quantity >= item.stock && (
                                                <div  className="mt-2 inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1"> 
                                                    <p className="text-error text-xs mt-1">
                                                       Solo hay {item.stock} unidad{item.stock !== 1 ? 'es' : ''} disponible{item.stock !== 1 ? 's' : ''}.
                                                    </p>
                                                </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.itemId)}
                                                className="text-neutral hover:text-error underline ml-4 font-medium transition-colors"
                                                aria-label="Eliminar"
                                            >
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Precio calculado (Precio Unitario * Cantidad) */}
                                    <div className="flex items-center justify-end col-span-2">
                                        <p className="font-bold font-family-display text-lg">
                                            {money(item.lineTotal)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="w-full h-px my-6" style={{ backgroundColor: 'var(--color-neutral)' }} />

                        <div className="flex justify-between items-baseline mb-6">
                            <p className="text-lg font-bold">Total</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                {money(total)}
                            </p>
                        </div>
                        
                        {hasStockIssues && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-700">
                            ⚠️ Hay productos que superan el stock disponible. Ajustá las cantidades para continuar.
                            </p>
                        </div>
                        )}
                        <Button
                            color="secondary"
                            className={`w-full ${
                                hasStockIssues ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={hasStockIssues}
                            onClick={() => navigate("/finalizar-compra")}
                            >
                            {hasStockIssues
                                ? 'Corregí el stock antes de continuar'
                                : 'Comprar'}
                            </Button>
                    </>
                )}
            </div>
        </ContainerBasic>
    )
}

export default Cart;
