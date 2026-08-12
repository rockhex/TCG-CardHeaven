import { Routes, Route, Outlet } from 'react-router-dom';
import Home from './views/Home';
import AboutUs from './views/AboutUs';
import Authentication from './views/Authentication';
import Catalog from './views/Catalog';
import CheckOut from './views/CheckOut';
import ProductDetails from './views/ProductDetails';
import Orders from './views/admin/Orders';
import EditProduct from './views/admin/EditProduct';
import Stock from './views/admin/Stock';
import PageNotFound from './views/errors/PageNotFound';
import MyOrders from './views/user/MyOrders';
import OrderDetails from './views/user/OrderDetails';
import { Navbar } from './components/Navbar/Navbar';
import AdminLayout from './views/admin/AdminLayout';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/atoms/ScrollToTop';
import Cart from './views/Cart';
import UnavailableItemModal from './components/UnavailableItemModal/UnavailableItemModal';

// Layout de la tienda: Navbar + contenido + Footer (no se usa en el panel admin).
// El modal de "producto no disponible" vive acá para cubrir cualquier vista que
// agregue al carrito (catálogo, detalle, home, carrito).
const StorefrontLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
    <UnavailableItemModal />
  </>
);

function App() {
  return (<>
    <ScrollToTop />
    <Routes>
      {/* Storefront (público + usuario) */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/ingresar" element={<Authentication />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/finalizar-compra" element={<CheckOut />} />
        <Route path="/producto/:id" element={<ProductDetails />} />

        {/* User Routes */}
        <Route path="/usuario/pedidos" element={<MyOrders />} />
        <Route path="/usuario/pedido/:id" element={<OrderDetails />} />

        {/* Error Routes */}
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* Admin Routes (layout propio con sidebar) */}
      <Route path="/admin/" element={<AdminLayout />}>
        <Route path="" element={<Stock />} />
        <Route path="inventario" element={<Stock />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="pedido/:id" element={<OrderDetails />} />
        <Route path="producto/editar/:id" element={<EditProduct />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  </>)
}

export default App
