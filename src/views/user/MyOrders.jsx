import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Badge } from "../../components/atoms/Badge"
import Button from "../../components/atoms/Button"
import ContainerBasic from "../../components/atoms/ContainerBasic"
import { selectIsLoggedIn, selectUserId } from "../../store/slices/authSlice"
import { fetchUserOrders, selectUserOrders, selectUserOrdersStatus } from "../../store/slices/ordersSlice"
import { statusInfo, formatDate, money } from "../../utils/orderStatus"

const MyOrders = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userId = useSelector(selectUserId);
  const orders = useSelector(selectUserOrders);
  const status = useSelector(selectUserOrdersStatus);
  const loading = status === 'loading';
  const error = status === 'failed';

  useEffect(() => {
    if (userId) dispatch(fetchUserOrders(userId));
  }, [dispatch, userId]);

  return (
    <section className="py-12 bg-surface-container-low min-h-screen">
      <ContainerBasic>
        <h2 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Historial de Pedidos
        </h2>
        <p className="text-neutral mb-6">Revisa tus adquisiciones pasadas y haz un seguimiento del estado de las entregas actuales. Cada transacción representa una pieza histórica seleccionada.</p>

        {!isLoggedIn && (
          <p className="text-body">Iniciá sesión para ver tus pedidos. <Link to="/ingresar" className="underline">Ingresar</Link></p>
        )}

        {isLoggedIn && loading && <p className="text-body">Cargando pedidos…</p>}
        {isLoggedIn && error && <p style={{ color: 'var(--color-error)' }}>No se pudieron cargar los pedidos.</p>}
        {isLoggedIn && !loading && !error && orders.length === 0 && (
          <p className="text-body">Todavía no tenés pedidos. <Link to="/catalogo" className="underline">Explorá el catálogo</Link>.</p>
        )}

        <ul className="flex flex-col gap-6">
          {orders.map((order) => {
            const info = statusInfo(order.status);
            return (
              <li key={order.id} className="w-full p-6 bg-surface shadow-md">
                <div className="flex justify-between md:items-center gap-4">
                  <div className="flex flex-col">
                    <p className="text-xs text-neutral font-family-display">Pedido: #{order.id.slice(0, 8)}</p>
                    <p>{formatDate(order.placedAt)}</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col">
                      <p className="text-xs text-neutral font-family-display">Total</p>
                      <p>{money(order.totalAmount)}</p>
                    </div>
                    <Badge variant={info.variant} color={info.color}>{info.label}</Badge>
                  </div>
                </div>

                <div className="w-full h-px my-6" style={{ backgroundColor: 'var(--color-neutral)' }} />

                <div className="text-center"><Button variant="text"><Link to={`/usuario/pedido/${order.id}`}>Ver Detalles del Pedido</Link></Button></div>
              </li>
            );
          })}
        </ul>
      </ContainerBasic>
    </section>
  )
}

export default MyOrders
