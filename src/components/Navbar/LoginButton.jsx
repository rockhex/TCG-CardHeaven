import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * LoginButton Component
 * Displays either a login button or user profile dropdown menu
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isLoggedIn - User authentication state
 * @param {Function} props.onLogoutClick - Callback when logout is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} LoginButton component
 */

const UserIcon = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const LoginButton = ({
  isLoggedIn = false,
  isAdmin = false,
  onLogoutClick,
  className = ''
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileMenuClick = (callback) => {
    if (callback) callback();
    setIsProfileDropdownOpen(false);
  };

  const profileMenuItems = [
    { label: 'Mis Pedidos', value: '/usuario/pedidos' },
    ...(isAdmin
      ? [
          { label: 'Inventario (Admin)', value: '/admin/inventario' },
          { label: 'Pedidos (Admin)', value: '/admin/pedidos' },
        ]
      : []),
  ];

  return (<>
    {!isLoggedIn ? (
        <Link
            to="/ingresar"
            className={`text-sm font-semibold hover:opacity-70 transition-opacity ${className}`}
            style={{ color: 'var(--color-primary)' }}
        >
            Ingresar
        </Link>
    ) : (
        <div className="relative" ref={profileDropdownRef}>
        <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`hover:opacity-70 transition-opacity ${className}`}
            style={{ color: 'var(--color-primary)' }}
            aria-label="User profile"
        >
            <UserIcon />
        </button>

        {/* Profile Dropdown Menu */}
        {isProfileDropdownOpen && (
            <div
            className="absolute right-0 mt-2 w-48 border rounded-lg shadow-lg py-2 z-3 flex flex-col gap-2"
            style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-outline)'
            }}
            >
            {profileMenuItems.map((item, index) => (
                <Link
                key={index}
                to={`${item.value}`}
                className="w-full text-left px-4 py-2 hover:opacity-70 transition-opacity text-sm"
                style={{ color: 'var(--color-primary)' }}
                >
                {item.label}
                </Link>
            ))}
                <div
              className="w-full h-px"
              style={{ backgroundColor: 'var(--color-outline)' }}
            />
                <button
                onClick={() => handleProfileMenuClick(onLogoutClick)}
                className="w-full text-left px-4 py-2 hover:opacity-70 transition-opacity text-sm"
                style={{ color: 'var(--color-primary)' }}
                >
                Cerrar sesión
                </button>
            </div>
        )}
        </div>
    )}
  </>);
};
