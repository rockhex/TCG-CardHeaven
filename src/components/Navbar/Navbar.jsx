import { useEffect, useState } from 'react';
import { CartButton } from './CartButton';
import { LoginButton } from './LoginButton';
import ContainerBasic from '../atoms/ContainerBasic';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsLoggedIn, selectIsAdmin, selectUserId, logout as logoutAction } from '../../store/slices/authSlice';
import { fetchCart, selectCartCount, resetCart } from '../../store/slices/cartSlice';

/**
 * Navbar Component
 * Responsive navigation bar with search, logo, links, auth, and cart
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.cartItemCount - Number of items in cart (default: 0)
 * @param {boolean} props.isLoggedIn - User authentication state (default: false)
 * @param {Function} props.onSearch - Callback when search is submitted
 * @param {Function} props.onCartClick - Callback when cart button is clicked
 * @param {Function} props.onLoginClick - Callback when login button is clicked
 * @param {Function} props.onSettingsClick - Callback when settings is clicked
 * @param {Function} props.onOrdersClick - Callback when orders is clicked
 * @param {Function} props.onAddressesClick - Callback when addresses is clicked
 * @param {Function} props.onLogoutClick - Callback when logout is clicked
 * @param {Function} props.onNavLinkClick - Callback when navigation link is clicked (receives link name)
 * @returns {React.ReactElement} Navbar component
 */

// SVG Icons
const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);



const MenuIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin = useSelector(selectIsAdmin);
  const userId = useSelector(selectUserId);
  const cartItemCount = useSelector(selectCartCount);

  // Recarga el carrito del backend cada vez que cambia el usuario logueado,
  // igual que hacía el useEffect dentro de CartProvider.
  useEffect(() => {
    if (userId) dispatch(fetchCart(userId));
    else dispatch(resetCart());
  }, [userId, dispatch]);

  const handleLogout = () => {
    dispatch(logoutAction());
    dispatch(resetCart());
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/catalogo?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const handleCartClick = () => navigate('/carrito');

  const navLinks = [
    { label: 'Catálogo', value: 'catalogo' },
    { label: 'Nosotros', value: 'nosotros' },
  ];

  return (
    <nav
      className="border-b sticky top-0 z-20"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-outline)'
      }}
    >
    
      <ContainerBasic>
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between h-16 gap-8">
          {/* Left: Search */}
          <div className="flex-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all" style={{ 
              backgroundColor: isSearchFocused ? 'rgba(26, 26, 26, 0.05)' : 'transparent',
              borderBottom: isSearchFocused ? '2px solid var(--color-primary)' : '1px solid var(--color-outline)'
            }}>
              <button
                type="submit"
                className="hover:opacity-70 transition-opacity shrink"
                style={{ color: 'var(--color-primary)' }}
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Buscar cartas..."
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 bg-transparent focus:outline-none text-base"
                style={{ color: 'var(--color-primary)' }}
              />
            </form>
          </div>

          {/* Center: Logo */}
          <div className="flex-auto flex justify-center">
            <Link to="/">
                <h1
                className="text-2xl font-display font-bold whitespace-nowrap"
                style={{ color: 'var(--color-primary)' }}
                >
                    Card Heaven
                </h1>
            </Link>
          </div>

          {/* Right: Navigation + Auth + Cart */}
          <div className="flex items-center justify-end gap-4 xl:gap-6 flex-auto">
            {/* Navigation Links */}
            <div className="flex items-center gap-4 xl:gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.value}
                  to={`/${link.value}`}
                  className="text-sm font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Vertical Divider */}
            <div
              className="w-px h-6"
              style={{ backgroundColor: 'var(--color-outline)' }}
            />

            {/* Auth Button or Profile Icon */}
            <LoginButton
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              onLogoutClick={handleLogout}
            />

            {/* Cart Button */}
            <CartButton
              itemCount={cartItemCount}
              onClick={handleCartClick}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/">
            <h1
                className="text-lg sm:text-2xl font-display font-bold whitespace-nowrap"
                style={{ color: 'var(--color-primary)' }}
            >
                Card Heaven
            </h1>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchFocused(!isSearchFocused)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>

            {/* Auth Button or Profile Icon */}
            <LoginButton
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              onLogoutClick={handleLogout}
            />

            {/* Cart Button */}
            <CartButton
              itemCount={cartItemCount}
              onClick={handleCartClick}
            />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchFocused && (
          <div className="lg:hidden py-4 border-t" style={{ borderColor: 'var(--color-outline)' }}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2">
              <button
                type="submit"
                className="hover:opacity-70 transition-opacity shrink-0"
                style={{ color: 'var(--color-primary)' }}
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent focus:outline-none text-base"
                style={{ color: 'var(--color-primary)' }}
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden border-t py-4"
            style={{ borderColor: 'var(--color-outline)' }}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.value}
                  to={`/${link.value}`}
                  className="text-sm font-semibold text-left hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </ContainerBasic>
    </nav>
  );
};
