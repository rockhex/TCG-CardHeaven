
/**
 * CartButton Component
 * Displays shopping cart icon with badge showing number of items
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.itemCount - Number of items in cart (default: 0)
 * @param {Function} props.onClick - Callback when cart button is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} CartButton component
 */

const CartIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M223.5-103.5Q200-127 200-160t23.5-56.5Q247-240 280-240t56.5 23.5Q360-193 360-160t-23.5 56.5Q313-80 280-80t-56.5-23.5Zm400 0Q600-127 600-160t23.5-56.5Q647-240 680-240t56.5 23.5Q760-193 760-160t-23.5 56.5Q713-80 680-80t-56.5-23.5ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></svg>
);

export const CartButton = ({
  itemCount = 0,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-2 hover:opacity-70 transition-opacity ${className}`}
      style={{ color: 'var(--color-primary)' }}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <CartIcon />
      
      {/* Badge with item count */}
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-secondary-content)'
          }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};
