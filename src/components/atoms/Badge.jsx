
/**
 * Badge Component
 * Display inline tags with variants and color support
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.variant - 'filled' (default) or 'outline'
 * @param {string} props.color - Color variant: 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'error', 'warning' (default: 'primary')
 * @param {React.ReactNode} props.children - Badge content/text
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Badge component
 */

// Predefined color+variant combinations to ensure Tailwind generates all classes at build time
const colorClassMap = {
  // Filled variants
  'filled-primary': 'bg-primary text-primary-content px-3 py-1 text-sm font-medium',
  'filled-secondary': 'bg-secondary text-secondary-content px-3 py-1 text-sm font-medium',
  'filled-accent': 'bg-accent text-accent-content px-3 py-1 text-sm font-medium',
  'filled-neutral': 'bg-neutral text-neutral-content px-3 py-1 text-sm font-medium',
  'filled-info': 'bg-info text-info-content px-3 py-1 text-sm font-medium',
  'filled-success': 'bg-success text-success-content px-3 py-1 text-sm font-medium',
  'filled-error': 'bg-error text-error-content px-3 py-1 text-sm font-medium',
  'filled-warning': 'bg-warning text-warning-content px-3 py-1 text-sm font-medium',

  // Outline variants
  'outline-primary': 'border border-primary text-primary px-3 py-1 text-sm font-medium bg-white',
  'outline-secondary': 'border border-secondary text-secondary px-3 py-1 text-sm font-medium bg-white',
  'outline-accent': 'border border-accent text-accent px-3 py-1 text-sm font-medium bg-white',
  'outline-neutral': 'border border-neutral text-neutral px-3 py-1 text-sm font-medium bg-white',
  'outline-info': 'border border-info text-info px-3 py-1 text-sm font-medium bg-white',
  'outline-success': 'border border-success text-success px-3 py-1 text-sm font-medium bg-white',
  'outline-error': 'border border-error text-error px-3 py-1 text-sm font-medium bg-white',
  'outline-warning': 'border border-warning text-warning px-3 py-1 text-sm font-medium bg-white',
};

export const Badge = ({
  variant = 'filled',
  color = 'primary',
  children,
  className = ''
}) => {
  const key = `${variant}-${color}`;
  const baseClasses = colorClassMap[key] || colorClassMap['filled-primary'];

  return (
    <span className={`${baseClasses} ${className}`}>
      {children}
    </span>
  );
};
