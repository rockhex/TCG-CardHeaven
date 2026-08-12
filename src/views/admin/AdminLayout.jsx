import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../../components/atoms/Button';
import { selectIsAdmin } from '../../store/slices/authSlice';
const AdminLayout = () => {
    const location = useLocation()
    const isAdmin = useSelector(selectIsAdmin);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen h-full max-h-screen bg-surface-container-low flex overflow-y-clip">
      
      {/* 1. BACKDROP (Fondo oscuro al abrir en móvil) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside
        className={`fixed top-0 inset-y-0 left-0 z-50 w-64 bg-surface border-r text-primary flex flex-col justify-between transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:h-screen`}
      >
        {/* Encabezado del Sidebar */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 bg-surface">
            <span className="text-xl font-bold font-family-display tracking-wider">ADMIN PANEL</span>
            
            {/* Botón para cerrar en móvil */}
            <button
              className="p-1 hover:bg-primary md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="h-6 w-6 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enlaces de Navegación */}
          <nav className="mt-6 px-4 space-y-2">
            <Link to="/admin/inventario" className={`flex items-center px-4 py-3 text-sm font-bold text-primary transition-colors ${location.pathname === "/admin/inventario" ? "border-l-3 border-primary bg-primary/5" : "hover:bg-primary/5"}`}>
              <span>Inventario</span>
            </Link>
            <Link to="/admin/pedidos" className={`flex items-center px-4 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors ${location.pathname === "/admin/pedidos" ? "border-l-3 border-primary bg-primary/5" : "hover:bg-primary/5"}`}>
              <span>Pedidos</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        <header className="h-17 bg-surface flex items-center px-4 md:px-6 justify-between z-40 border-b">
          <div className="flex items-center">
            {/* Botón Hamburguesa: Solo visible en móvil */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-neutral focus:outline-none md:hidden mr-4 p-1 rounded-md hover:bg-surface-bright"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-800"><span className='capitalize'>{location.pathname.split('/').filter(Boolean).pop()}</span></h1>
          </div>

          <Button variant='text'>
            <Link to={"/"}>Ir al sitio</Link>
          </Button>
        </header>

        {/* Renderizado de las vistas */}
        <main className="flex-1 p-4 md:p-6 max-h-screen overflow-y-auto" ref={containerRef}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default AdminLayout