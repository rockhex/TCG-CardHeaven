import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContainerBasic from '../../components/atoms/ContainerBasic';
import { Badge } from '../../components/atoms/Badge';
import { fetchAllOrders, selectAdminOrders, selectAdminOrdersStatus } from '../../store/slices/adminSlice';
import { statusInfo, formatDate, money } from '../../utils/orderStatus';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'SHIPPED', label: 'En Tránsito' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const Orders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAdminOrders);
  const status = useSelector(selectAdminOrdersStatus);
  const loading = status === 'loading' || status === 'idle';
  const error = status === 'failed';
  const [filters, setFilters] = useState({ search: '', estado: '' });

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filters.estado && o.status !== filters.estado) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customerName ?? '').toLowerCase().includes(q) ||
        (o.customerEmail ?? '').toLowerCase().includes(q)
      );
    });
  }, [orders, filters]);

  return (
    <ContainerBasic>
      <h2 className="text-4xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        Gestión de Pedidos
      </h2>
      <p className="text-neutral">Listado de todos los pedidos de la tienda.</p>
      {loading && <p className="mt-6 text-body">Cargando pedidos…</p>}
      {error && <p className="mt-6" style={{ color: 'var(--color-error)' }}>No se pudieron cargar los pedidos.</p>}
      {!loading && !error && (<>
        <div className="p-6 bg-surface shadow-md mt-8">
          <div className="flex justify-between gap-6">
            <div className="w-[50%] flex flex-col">
              <label htmlFor="search">Buscar ID, Cliente o Email</label>
              <input type="text" name="search" id="search" placeholder="ej. Juan Pérez" className="p-3 border-neutral border" value={filters.search} onChange={handleChange} />
            </div>
            <div className="w-[50%] flex flex-col">
              <label htmlFor="estado-select">Estado</label>
              <select
                id="estado-select"
                name="estado"
                value={filters.estado}
                onChange={handleChange}
                className="p-3 border-neutral border"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-surface shadow-md mt-8 w-full overflow-x-scroll">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral">
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[15%]">ID del Pedido</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[20%]">Cliente</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[15%]">Fecha</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[20%]">Estado</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[20%]">Total</th>
                <th className="py-5 px-4 text-xs font-bold text-neutral tracking-wider w-[10%] text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const info = statusInfo(order.status);
                return (
                  <tr key={order.id} className="hover:bg-neutral/50 transition-colors">
                    <td className="py-5 px-4 text-sm font-bold text-primary pr-6 leading-relaxed">#{order.id.slice(0, 8)}</td>
                    <td className="py-5 px-4 text-sm text-neutral">{order.customerName}</td>
                    <td className="py-5 px-4 text-sm font-bold">{formatDate(order.placedAt)}</td>
                    <td className="py-5 px-4 text-sm font-bold">
                      <Badge color={info.color} variant={info.variant}>{info.label}</Badge>
                    </td>
                    <td className="py-5 px-4 text-sm font-medium text-primary">{money(order.totalAmount)}</td>
                    <td className="py-5 px-4 text-center">
                      <Link to={`/admin/pedido/${order.id}`} className="text-neutral hover:text-primary p-1 transition-colors inline-flex items-center justify-center" aria-label="Ver detalle">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z"/></svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 px-4 text-center text-neutral">No hay pedidos que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>)}
    </ContainerBasic>
  );
};

export default Orders
