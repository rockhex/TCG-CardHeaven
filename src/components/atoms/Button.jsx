
// Predefined class combinations for each color to ensure Tailwind generates them
const colorClassMap = {
  primary: {
    default: 'bg-primary text-primary-content border-primary hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-primary border-primary hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-primary border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  secondary: {
    default: 'bg-secondary text-secondary-content border-secondary hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-secondary border-secondary hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-secondary border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  accent: {
    default: 'bg-accent text-accent-content border-accent hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-accent border-accent hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-accent border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  success: {
    default: 'bg-success text-success-content border-success hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-success border-success hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-success border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  error: {
    default: 'bg-error text-error-content border-error hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-error border-error hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-error border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  info: {
    default: 'bg-info text-info-content border-info hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-info border-info hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-info border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  warning: {
    default: 'bg-warning text-warning-content border-warning hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-warning border-warning hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-warning border-transparent hover:opacity-70 active:opacity-50 px-0'
  },
  neutral: {
    default: 'bg-neutral text-neutral-content border-neutral hover:opacity-90 active:opacity-75',
    outline: 'bg-transparent text-neutral border-neutral hover:opacity-70 active:opacity-50',
    text: 'bg-transparent text-neutral border-transparent hover:opacity-70 active:opacity-50 px-0'
  }
};

/**
 * Button component with 3 variants: default, outline, text
 * Supports left and right icons
 * Text variant auto-includes arrow icon if rightIcon not provided
 * Uses Tailwind theme tokens for full color support
 * 
 * @param {object} props
 * @param {string} props.variant - 'default' | 'outline' | 'text' (default: 'default')
 * @param {string} props.color - 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'info' | 'warning' | 'neutral' (default: 'primary')
 * @param {React.ReactNode} props.children - Button text content
 * @param {React.ReactNode} props.leftIcon - Icon component (optional)
 * @param {React.ReactNode} props.rightIcon - Icon component (optional)
 * @param {boolean} props.disabled - Disabled state (default: false)
 * @param {string} props.className - Additional CSS classes
 * @param {...rest} props - All other HTML button attributes
 */
export const Button = ({
  variant = 'default',
  color = 'primary',
  children,
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Auto-add arrow for text variant if no rightIcon
  const finalRightIcon = variant === 'text' && !rightIcon ? (
    <ArrowIcon />
  ) : rightIcon;

  // Get color classes from map, fallback to primary if not found
  const colorClasses = colorClassMap[color]?.[variant] || colorClassMap.primary.default;

  // Base styles shared across all variants
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-body',
    'font-semibold',
    'px-6',
    'py-3',
    'transition-all',
    'duration-200',
    'cursor-pointer',
    'text-base',
    'border',
    'border-solid',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    colorClasses,
    className
  ].join(' ');

  return (
    <button
      className={baseClasses}
      disabled={disabled}
      {...rest}
    >
      {leftIcon && <span className="flex items-center justify-center">{leftIcon}</span>}
      {children}
      {finalRightIcon && <span className="flex items-center justify-center">{finalRightIcon}</span>}
    </button>
  );
};

/**
 * Default arrow icon for text variant
 * Renders a simple arrow right SVG inheriting color from parent
 */
const ArrowIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
      <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
  </svg>
);

export default Button;
