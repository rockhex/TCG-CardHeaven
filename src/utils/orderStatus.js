// Traducción y estilo de los estados de pedido del backend (enum Order.Status).
// PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
const STATUS = {
  PENDING: { label: 'Pendiente', color: 'neutral', variant: 'filled' },
  PAID: { label: 'Pagado', color: 'info', variant: 'filled' },
  SHIPPED: { label: 'En Tránsito', color: 'secondary', variant: 'outline' },
  DELIVERED: { label: 'Entregado', color: 'success', variant: 'filled' },
  CANCELLED: { label: 'Cancelado', color: 'error', variant: 'filled' },
};

export function statusInfo(status) {
  return STATUS[status] || { label: status, color: 'neutral', variant: 'filled' };
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function money(n) {
  return `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
