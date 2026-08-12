import { Badge } from "../components/atoms/Badge";
import Button from "../components/atoms/Button";
import ContainerBasic from "../components/atoms/ContainerBasic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsLoggedIn, selectUserId, selectAuth } from "../store/slices/authSlice";
import { selectCartItems, clearCart, removeFromCart } from "../store/slices/cartSlice";
import { fetchProducts, selectProducts, selectProductsStatus, selectProductNames } from "../store/slices/catalogSlice";
import { createAddress } from "../store/slices/addressesSlice";
import { checkout } from "../store/slices/ordersSlice";
import { money } from "../utils/orderStatus";

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userId = useSelector(selectUserId);
  const { email } = useSelector(selectAuth);
  const items = useSelector(selectCartItems);
  const products = useSelector(selectProducts);
  const productNames = useSelector(selectProductNames);
  const productsStatus = useSelector(selectProductsStatus);

  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showUnavailable, setShowUnavailable] = useState(false);
  // Copia de los productos que quitamos del carrito por no estar disponibles. El
  // carrito ya no los tiene, pero los conservamos acá para seguir mostrando el
  // aviso (banner) y el modal con su nombre y motivo.
  const [removedItems, setRemovedItems] = useState([]);
  // itemIds para los que ya pedimos el remove: evita doble dispatch (StrictMode) y
  // reintentos en renders sucesivos mientras el remove está en vuelo.
  const removalRequested = useRef(new Set());

  // En el checkout necesitamos stock FRESCO para validar disponibilidad: forzamos
  // el refetch aunque el catálogo ya esté en caché de haber navegado la tienda.
  useEffect(() => {
    dispatch(fetchProducts({ force: true }));
  }, [dispatch]);

  // --- Líneas reales del carrito (itemId -> producto) ---
  const byItemId = useMemo(() => {
    const map = new Map();
    for (const p of products) map.set(p.itemId, p);
    return map;
  }, [products]);

  // El catálogo ya está cargado: recién entonces podemos distinguir un producto
  // "eliminado" (no aparece en el catálogo) de uno que todavía no terminó de cargar.
  const productsLoaded = productsStatus === 'succeeded';

  const lines = items.map((it) => {
    const product = byItemId.get(it.itemId);
    const price = Number(product?.price ?? 0);
    const stock = Number(product?.stock ?? 0);
    // Solo evaluamos disponibilidad cuando el catálogo terminó de cargar.
    const deleted = productsLoaded && !product;       // ya no existe en el catálogo
    // No alcanza con stock > 0: el backend rechaza el checkout si el stock es menor
    // a la cantidad pedida (resolvePrice -> "Insufficient stock"). Replicamos esa
    // regla acá para detectarlo antes de enviar.
    const outOfStock = productsLoaded && !!product && stock < it.quantity;
    const available = !deleted && !outOfStock;
    // Un producto eliminado ya no está en el catálogo y el carrito solo guarda su
    // itemId. Recuperamos su nombre de la caché de nombres (productNames), que
    // conserva lo visto antes de que se eliminara; si tampoco está ahí, genérico.
    const displayName = product?.name ?? productNames[it.itemId] ?? 'Producto ya no disponible';
    const reason = deleted
      ? 'Eliminado del catálogo'
      : (outOfStock ? (stock <= 0 ? 'Sin stock' : `Stock insuficiente (quedan ${stock})`) : null);
    return {
      itemId: it.itemId,
      quantity: it.quantity,
      name: displayName,
      img: product?.imageUrl,
      price,
      stock,
      deleted,
      outOfStock,
      available,
      reason,
      lineTotal: price * it.quantity,
    };
  });

  const unavailableLines = lines.filter((l) => !l.available);
  // Solo las líneas disponibles cuentan para el total a pagar.
  const total = lines.reduce((sum, l) => sum + (l.available ? l.lineTotal : 0), 0);

  // Quitamos del carrito los productos que ya no se pueden comprar (eliminados o
  // sin stock suficiente). Antes guardamos una copia en removedItems para seguir
  // avisando al usuario en el banner y el modal con su nombre y motivo, ya que una
  // vez fuera del carrito dejan de estar en `lines`. unavailableKey hace que el
  // efecto corra solo cuando cambia el conjunto de no disponibles, no en cada render.
  const unavailableKey = unavailableLines.map((l) => l.itemId).join(',');
  useEffect(() => {
    if (!productsLoaded || !userId || unavailableLines.length === 0) return;
    setRemovedItems((prev) => {
      const vistos = new Set(prev.map((p) => p.itemId));
      const nuevos = unavailableLines.filter((l) => !vistos.has(l.itemId));
      return nuevos.length ? [...prev, ...nuevos] : prev;
    });
    setShowUnavailable(true);
    unavailableLines.forEach((l) => {
      if (removalRequested.current.has(l.itemId)) return;
      removalRequested.current.add(l.itemId);
      dispatch(removeFromCart({ userId, itemId: l.itemId }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailableKey, productsLoaded, userId, dispatch]);

  // --- Formulario ---
  const [datosCheckout, setDatosCheckout] = useState({
    email: email ?? "",
    nombre: "",
    apellido: "",
    direccion: "",
    ciudad: "",
    pais: "",
    codigo: "",
    tarjetaNumero: "",
    tarjetaVence: "",
    tarjetaCvv: "",
    tarjetaNombre: ""
  });

  const [validationCheckout, setValidationCheckout] = useState({
    email: true,
    nombre: true,
    apellido: true,
    direccion: true,
    ciudad: true,
    pais: true,
    codigo: true,
    tarjetaNumero: true,
    tarjetaVence: true,
    tarjetaCvv: true,
    tarjetaNombre: true
  });

  const checkFieldValidity = (field, value) => {
    if (metodoPago !== 'tarjeta' && field.startsWith('tarjeta')) {
      return true;
    }

    switch (field) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'nombre':
      case 'apellido':
        return value.trim().length >= 2;
      case 'direccion':
      case 'ciudad':
      case 'pais':
        return value.trim().length > 0;
      case 'codigo':
        return value.trim().length >= 4;
      case 'tarjetaNumero':
        return value.replace(/\s/g, '').length === 16;
      case 'tarjetaVence':
        return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value);
      case 'tarjetaCvv':
        return /^\d{3,4}$/.test(value);
      case 'tarjetaNombre':
        return value.trim().length >= 3;
      default:
        return true;
    }
  };

  const validateField = (field, value) => {
    setValidationCheckout(prev => ({
      ...prev,
      [field]: checkFieldValidity(field, value)
    }));
  };

  const validateForm = () => {
    const newValidationState = Object.keys(datosCheckout).reduce((acc, key) => {
      acc[key] = checkFieldValidity(key, datosCheckout[key]);
      return acc;
    }, {});

    setValidationCheckout(newValidationState);
    return Object.values(newValidationState).every((isValid) => isValid === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    setDatosCheckout(prev => ({ ...prev, [name]: value }));
  };

  const getInputClassName = (isValid) => `p-3 border outline-none transition-colors focus:ring-2 ${
    !isValid
      ? 'border-error bg-red-50 focus:ring-red-200'
      : 'border-neutral focus:border-primary focus:ring-gray-100'
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      navigate('/ingresar');
      return;
    }
    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }
    if (unavailableLines.length > 0) {
      setShowUnavailable(true);
      return;
    }
    if (!validateForm()) {
      setError('Revisá los campos marcados en rojo antes de continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const address = await dispatch(createAddress({
        userId,
        data: {
          street: datosCheckout.direccion,
          city: datosCheckout.ciudad,
          country: datosCheckout.pais,
          zipCode: datosCheckout.codigo,
        },
      })).unwrap();
      const order = await dispatch(checkout({
        userId,
        data: {
          addressId: address.id,
          paymentProvider: metodoPago,
          externalProcessorId: `web-${userId}-${Date.now()}`,
        },
      })).unwrap();
      await dispatch(clearCart(userId));
      navigate(`/usuario/pedido/${order.id}`);
    } catch (err) {
      // El checkout puede fallar porque un ítem dejó de estar disponible entre que
      // se cargó el catálogo y se confirmó la compra (eliminado o sin stock). En ese
      // caso refrescamos el catálogo y mostramos el modal de no disponibles, no el
      // error crudo del backend ("Card not found ...").
      const message = err?.message ?? err;
      const availabilityError =
        err?.status === 404 || /not found for item|insufficient stock/i.test(String(message));
      if (availabilityError) {
        // Algún ítem dejó de estar disponible entre que cargó el catálogo y se
        // confirmó la compra. Refrescamos el catálogo: el efecto de arriba detectará
        // los no disponibles, los quitará del carrito y abrirá el modal.
        dispatch(fetchProducts({ force: true }));
        return;
      }
      setError(typeof message === 'string' ? message : 'No se pudo confirmar la compra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ContainerBasic className="py-12 min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">

        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="col-span-12 md:col-span-7">
          <h2 className="text-2xl font-display font-bold my-4" style={{ color: 'var(--color-primary)' }}>Información de Contacto</h2>
          <div className="w-full flex flex-col">
            <label htmlFor="email" className="text-sm mb-2 font-medium">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="coleccionista@ejemplo.com"
              className={getInputClassName(validationCheckout.email)}
              value={datosCheckout.email}
              onChange={handleChange}
            />
            {!validationCheckout.email && <span className="text-red-500 text-xs mt-1">Ingresa un correo electrónico válido.</span>}
          </div>

          <div className="w-full h-px my-8" style={{ backgroundColor: 'var(--color-neutral)' }} />

          <h2 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Dirección de Envío</h2>
          <div className="grid grid-cols-12 gap-6 items-start">

            <div className="col-span-6 w-full flex flex-col">
              <label htmlFor="nombre" className="text-sm mb-2 font-medium">Nombre</label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                placeholder="Juan"
                className={getInputClassName(validationCheckout.nombre)}
                value={datosCheckout.nombre}
                onChange={handleChange}
              />
              {!validationCheckout.nombre && <span className="text-red-500 text-xs mt-1">Mínimo 2 caracteres.</span>}
            </div>

            <div className="col-span-6 w-full flex flex-col">
              <label htmlFor="apellido" className="text-sm mb-2 font-medium">Apellido</label>
              <input
                type="text"
                name="apellido"
                id="apellido"
                placeholder="Perez"
                className={getInputClassName(validationCheckout.apellido)}
                value={datosCheckout.apellido}
                onChange={handleChange}
              />
              {!validationCheckout.apellido && <span className="text-red-500 text-xs mt-1">Mínimo 2 caracteres.</span>}
            </div>

            <div className="col-span-12 w-full flex flex-col">
              <label htmlFor="direccion" className="text-sm mb-2 font-medium">Dirección</label>
              <input
                type="text"
                name="direccion"
                id="direccion"
                placeholder="Lima 757"
                className={getInputClassName(validationCheckout.direccion)}
                value={datosCheckout.direccion}
                onChange={handleChange}
              />
              {!validationCheckout.direccion && <span className="text-red-500 text-xs mt-1">La dirección es obligatoria.</span>}
            </div>

            <div className="col-span-4 w-full flex flex-col">
              <label htmlFor="ciudad" className="text-sm mb-2 font-medium">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                id="ciudad"
                placeholder="CABA"
                className={getInputClassName(validationCheckout.ciudad)}
                value={datosCheckout.ciudad}
                onChange={handleChange}
              />
              {!validationCheckout.ciudad && <span className="text-red-500 text-xs mt-1">Campo obligatorio.</span>}
            </div>

            <div className="col-span-4 w-full flex flex-col">
              <label htmlFor="pais" className="text-sm mb-2 font-medium">País</label>
              <input
                type="text"
                name="pais"
                id="pais"
                placeholder="Argentina"
                className={getInputClassName(validationCheckout.pais)}
                value={datosCheckout.pais}
                onChange={handleChange}
              />
              {!validationCheckout.pais && <span className="text-red-500 text-xs mt-1">Campo obligatorio.</span>}
            </div>

            <div className="col-span-4 w-full flex flex-col">
              <label htmlFor="codigo" className="text-sm mb-2 font-medium">Código Postal</label>
              <input
                type="text"
                name="codigo"
                id="codigo"
                placeholder="1073"
                className={getInputClassName(validationCheckout.codigo)}
                value={datosCheckout.codigo}
                onChange={handleChange}
              />
              {!validationCheckout.codigo && <span className="text-red-500 text-xs mt-1">C.P. inválido.</span>}
            </div>
          </div>

          <div className="w-full h-px my-8" style={{ backgroundColor: 'var(--color-neutral)' }} />

          {/* MÉTODOS DE PAGO */}
          <div className="mt-5 border border-neutral overflow-hidden bg-surface shadow-sm">
            <div className={`transition-colors ${metodoPago === 'tarjeta' ? 'bg-neutral/10' : 'bg-surface'}`}>
              <label className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="metodo-pago"
                    value="tarjeta"
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral accent-primary"
                  />
                  <span className="font-bold text-primary text-sm sm:text-base">Tarjeta de Crédito</span>
                </div>
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </label>

              {metodoPago === 'tarjeta' && (
                <div className="p-4 bg-surface border-t border-neutral space-y-4">
                  <div>
                    <label className="block text-sm mb-2 font-medium">Número de Tarjeta</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="tarjetaNumero"
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        className={`w-full ${getInputClassName(validationCheckout.tarjetaNumero)}`}
                        value={datosCheckout.tarjetaNumero}
                        onChange={handleChange}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    {!validationCheckout.tarjetaNumero && <span className="text-red-500 text-xs mt-1">Deben ser 16 números.</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="block text-sm mb-2 font-medium">Fecha de Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        name="tarjetaVence"
                        placeholder="MM / AA"
                        maxLength="5"
                        className={getInputClassName(validationCheckout.tarjetaVence)}
                        value={datosCheckout.tarjetaVence}
                        onChange={handleChange}
                      />
                      {!validationCheckout.tarjetaVence && <span className="text-red-500 text-xs mt-1">Formato MM/AA requerido.</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm mb-2 font-medium">Código de Seguridad</label>
                      <div className="relative">
                        <input
                          type="password"
                          name="tarjetaCvv"
                          placeholder="XXX"
                          maxLength="4"
                          className={`w-full ${getInputClassName(validationCheckout.tarjetaCvv)}`}
                          value={datosCheckout.tarjetaCvv}
                          onChange={handleChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      {!validationCheckout.tarjetaCvv && <span className="text-red-500 text-xs mt-1">Código inválido (3-4 dígitos).</span>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm mb-2 font-medium">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      name="tarjetaNombre"
                      placeholder="Juan Perez"
                      className={getInputClassName(validationCheckout.tarjetaNombre)}
                      value={datosCheckout.tarjetaNombre}
                      onChange={handleChange}
                    />
                    {!validationCheckout.tarjetaNombre && <span className="text-red-500 text-xs mt-1">Ingresa el nombre impreso en la tarjeta.</span>}
                  </div>
                </div>
              )}
            </div>

            <div className={`border-t border-neutral transition-colors ${metodoPago === 'transferencia' ? 'bg-neutral/10' : 'bg-surface'}`}>
              <label className="flex items-center p-4 cursor-pointer select-none">
                <input
                  type="radio"
                  name="metodo-pago"
                  value="transferencia"
                  checked={metodoPago === 'transferencia'}
                  onChange={() => setMetodoPago('transferencia')}
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral accent-primary"
                />
                <span className="ml-3 font-bold text-primary text-sm sm:text-base">Transferencia Bancaria</span>
              </label>

              {metodoPago === 'transferencia' && (
                <div className="p-5 bg-surface border-t border-neutral text-center text-sm text-gray-600">
                  <p>Te mostraremos los datos del CBU/Alias en el siguiente paso para coordinar la acreditación de tu pedido.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div
            className="space-y-6 p-6 shadow-sm border-neutral border"
            style={{ backgroundColor: 'var(--color-surface-container-low)' }}
          >
            <h2 className="text-2xl font-display font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Resumen del Pedido</h2>

            {lines.length === 0 && <p className="text-gray-500 text-sm">Tu carrito está vacío.</p>}

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {lines.map((item) => (
                <div
                  key={item.itemId}
                  className={`grid grid-cols-6 gap-4 items-center ${item.available ? '' : 'opacity-60'}`}
                >
                  <div className="relative">
                    <Badge className="absolute top-[-5px] right-[-5px]">{item.quantity}</Badge>
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.name}
                        className={`w-full h-auto rounded-sm object-cover border border-neutral/30 ${item.available ? '' : 'grayscale'}`}
                      />
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className={`font-bold text-sm leading-tight ${item.available ? '' : 'text-gray-400'}`}>{item.name}</p>
                    {!item.available ? (
                      <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-error)' }}>
                        {item.reason}
                      </p>
                    ) : (
                      item.quantity > 1 && (
                        <p className="text-xs text-gray-500 mt-0.5">{money(item.price)} c/u</p>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-end col-span-2">
                    {item.available ? (
                      <p className="font-bold text-sm">{money(item.lineTotal)}</p>
                    ) : (
                      <p className="font-bold text-sm line-through text-gray-400">{money(item.lineTotal)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-px my-4" style={{ backgroundColor: 'var(--color-neutral)' }} />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">{money(total)}</p>
              </div>
            </div>

            <div className="w-full h-px my-4" style={{ backgroundColor: 'var(--color-neutral)' }} />

            <div className="flex justify-between">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold">{money(total)}</p>
            </div>

            {removedItems.length > 0 && (
              <div className="border border-error bg-red-50 px-4 py-3">
                <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                  Quitamos de tu carrito productos que ya no están disponibles.{' '}
                  <button
                    type="button"
                    onClick={() => setShowUnavailable(true)}
                    className="underline font-semibold"
                  >
                    Ver detalle
                  </button>
                </p>
              </div>
            )}

            {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

            <Button
              type="submit"
              color="secondary"
              className="w-full"
              disabled={submitting || lines.length === 0 || unavailableLines.length > 0}
            >
              {submitting ? 'Procesando…' : 'Confirmar Compra'}
            </Button>
          </div>
        </aside>
      </form>

      {/* Modal: items que quitamos del carrito por no estar disponibles (eliminados o sin stock) */}
      {showUnavailable && removedItems.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowUnavailable(false)}
        >
          <div
            className="w-full max-w-md border border-neutral bg-surface shadow-lg"
            style={{ backgroundColor: 'var(--color-surface-container-low)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 p-6 border-b border-neutral">
              <svg className="h-6 w-6 shrink-0" style={{ color: 'var(--color-error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-display font-bold" style={{ color: 'var(--color-primary)' }}>
                  Productos no disponibles
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quitamos de tu carrito los siguientes productos porque ya no están disponibles
                  (se quedaron sin stock o fueron eliminados del catálogo). Podés continuar con el
                  resto de tu compra.
                </p>
              </div>
            </div>

            <ul className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
              {removedItems.map((item) => (
                <li key={item.itemId} className="flex items-center gap-3">
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-10 h-10 object-cover grayscale border border-neutral/30 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-neutral/10 border border-neutral/30 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{item.name}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>
                      {item.reason}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-3 p-6 border-t border-neutral">
              <Button type="button" color="neutral" variant="outline" onClick={() => setShowUnavailable(false)}>
                Cerrar
              </Button>
              <Button type="button" color="primary" onClick={() => navigate('/carrito')}>
                Ir al carrito
              </Button>
            </div>
          </div>
        </div>
      )}
    </ContainerBasic>
  );
};

export default CheckOut
