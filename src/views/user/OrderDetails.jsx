import { Link, useLocation, useParams } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import Button from "../../components/atoms/Button"
import ContainerBasic from "../../components/atoms/ContainerBasic"
import { Badge } from "../../components/atoms/Badge"
import {
  fetchOrderById,
  cancelOrder,
  selectCurrentOrder,
  selectCurrentOrderStatus,
  selectCancelOrderStatus,
  selectCancelOrderError,
  clearCurrentOrder,
} from "../../store/slices/ordersSlice"
import { fetchProducts, selectProducts } from "../../store/slices/catalogSlice"
import { selectUserId } from "../../store/slices/authSlice"
import { statusInfo, formatDate, money } from "../../utils/orderStatus"

const CANCELLABLE = new Set(["PENDING", "PAID"]);

const OrderDetails = () => {
  const location = useLocation()
  const dispatch = useDispatch()

  const isAdmin = location.pathname.includes("/admin/")
  const { id } = useParams();
  const products = useSelector(selectProducts);
  const userId = useSelector(selectUserId);
  const order = useSelector(selectCurrentOrder);
  const orderStatus = useSelector(selectCurrentOrderStatus);
  const cancelStatus = useSelector(selectCancelOrderStatus);
  const cancelError = useSelector(selectCancelOrderError);
  const loading = orderStatus === 'loading' || orderStatus === 'idle';
  const error = orderStatus === 'failed';
  const cancelling = cancelStatus === 'loading';

  const handleCancel = async () => {
    if (!order) return;
    try {
      await dispatch(cancelOrder({ userId, orderId: order.id })).unwrap();
    } catch {
      // El error queda reflejado en cancelError (selector) y se muestra en el JSX más abajo.
    }
  };

  useEffect(() => {
    dispatch(fetchOrderById(id));
    dispatch(fetchProducts());
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id, products.length]);

  const byItemId = useMemo(() => {
    const map = new Map();
    for (const p of products) map.set(p.itemId, p);
    return map;
  }, [products]);

  if (loading) {
    return <section className="py-12"><ContainerBasic><p className="text-body">Cargando pedido…</p></ContainerBasic></section>;
  }
  if (error || !order) {
    return (
      <section className="py-12">
        <ContainerBasic>
          <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Pedido no encontrado</h2>
          <Link to="/usuario/pedidos" className="underline">Volver a Pedidos</Link>
        </ContainerBasic>
      </section>
    );
  }

  const info = statusInfo(order.status);
  const subtotal = order.items.reduce((sum, it) => sum + Number(it.unitPrice) * it.quantity, 0);
  const addr = order.address;

  return (
    <section className="py-12 bg-surface-container-low">
      <ContainerBasic>
        <Button variant="text" leftIcon={<ArrowLeftIcon/>} rightIcon style={{ paddingLeft: "0px" }}><Link to={ isAdmin ? "/admin/pedidos" : "/usuario/pedidos"}>Volver a Pedidos</Link></Button>
        <h2 className="text-4xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Pedido #{order.id.slice(0, 8)}
        </h2>
        <p className="flex justify-between shrink">Realizado el {formatDate(order.placedAt)} <Badge variant={info.variant} color={info.color}>{info.label}</Badge></p>

        <div className="w-full h-px my-6" style={{ backgroundColor: 'var(--color-neutral)' }} />

        <div className="grid grid-cols-12 gap-6">
          <div className="flex flex-col col-span-12 lg:col-span-7 gap-6">
            <h3 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
              Artículos Comprados
            </h3>

            {order.items.map((item) => {
              const product = byItemId.get(item.itemId);
              return (
                <div key={item.itemId} className="p-5 grid grid-cols-1 md:grid-cols-6 bg-surface shadow-md items-center gap-4">
                  <div className="shrink w-fit mx-auto">
                    {product?.imageUrl && <img src={product.imageUrl} alt={product?.name} className="w-full" />}
                  </div>
                  <div className="col-span-1 md:col-span-2 flex flex-col gap-4 py-4">
                    <span className="text-xl">{product?.name ?? `Ítem ${item.itemId.slice(0, 8)}`}</span>
                    <Badge className="w-fit">{item.itemType}</Badge>
                  </div>
                  <div className="col-span-1 md:col-span-3 col-end flex flex-col md:items-end justify-between gap-4 py-4">
                    <p className="text-xl">{money(item.unitPrice)}</p>
                    <p className="text-neutral">Cant: {item.quantity}</p>
                  </div>
                </div>
              );
            })}

            {!isAdmin && CANCELLABLE.has(order.status) && (<>
              <div
                className="w-full h-px my-6"
                style={{ backgroundColor: 'var(--color-neutral)' }}
              />

              <div className="w-full bg-neutral/5 border border-neutral p-6 flex justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                    ¿Necesitas cancelar?
                  </h3>
                  <p className="text-neutral">Tienes derecho a cancelar esta compra antes de que sea enviada.</p>
                  {cancelError && <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }}>{cancelError}</p>}
                </div>
                <Button variant="outline" color="error" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelando…' : 'Botón de Arrepentimiento'}
                </Button>
              </div>
            </>)}

          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 flex flex-col bg-surface shadow-md gap-4">
              <h3 className="text-xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Resumen del Pedido</h3>
              <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-neutral)' }} />
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{money(subtotal)}</p>
              </div>
              <div className="w-full h-px mt-4" style={{ backgroundColor: 'var(--color-neutral)' }} />
              <div className="flex justify-between">
                <p className="text-lg font-bold">Total</p>
                <p className="text-2xl font-bold">{money(order.totalAmount)}</p>
              </div>
            </div>

            {addr && (
              <div className="p-6 flex flex-col bg-surface shadow-md gap-4">
                <h3 className="text-xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>Detalles de Envío</h3>
                <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-neutral)' }} />
                <p>
                  {addr.street} <br />
                  {addr.city}{addr.zipCode ? `, ${addr.zipCode}` : ''} <br />
                  {addr.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </ContainerBasic>
    </section>
  )
}

const ArrowLeftIcon = ({className = "w-5 h5"}) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>
)

export default OrderDetails
