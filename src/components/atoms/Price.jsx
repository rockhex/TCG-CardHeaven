
/**
 * Price component for displaying product prices
 * Supports optional discount with strikethrough original price
 * Used in: product cards, product detail page, cart items
 * 
 * @param {object} props
 * @param {number} props.originalPrice - Original price (always shown)
 * @param {number} props.discountedPrice - Discounted price (optional)
 * @param {string} props.layout - 'side' (default) | 'stacked' - Position of original price relative to discounted
 * @param {string} props.currency - Currency symbol (default: '$')
 * @param {number} props.decimals - Number of decimal places (default: 2)
 * @param {boolean} props.showDiscountBadge - Show discount percentage badge (default: true)
 * @param {string} props.className - Additional CSS classes
 */
export const Price = ({
  originalPrice,
  discountedPrice,
  layout = 'side',
  currency = '$',
  decimals = 2,
  showDiscountBadge = true,
  className = ''
}) => {
  // Format price with currency and decimals
  const formatPrice = (price) => {
    return `${currency}${parseFloat(price).toFixed(decimals)}`;
  };

  // Calculate discount percentage if both prices exist
  const discountPercentage = 
    discountedPrice && originalPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : null;

  const hasDiscount = discountedPrice && discountedPrice < originalPrice;

  if (!hasDiscount) {
    // No discount: just show original price prominently
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span
          className="text-lg font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          {formatPrice(originalPrice)}
        </span>
      </div>
    );
  }

  // With discount
  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {/* Discounted price - prominent */}
        <span
          className="text-2xl font-bold"
          style={{ color: 'var(--color-secondary)' }}
        >
          {formatPrice(discountedPrice)}
        </span>

        {/* Original price - small, strikethrough */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm line-through"
            style={{ color: 'var(--color-neutral)' }}
          >
            {formatPrice(originalPrice)}
          </span>

          {/* Discount badge */}
          {showDiscountBadge && discountPercentage && (
            <span
              className="text-xs font-bold px-2 py-0.5"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-secondary-content)'
              }}
            >
              -{discountPercentage}%
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: side layout
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      {/* Discounted price - prominent */}
      <span
        className="text-2xl font-bold"
        style={{ color: 'var(--color-secondary)' }}
      >
        {formatPrice(discountedPrice)}
      </span>

      {/* Original price + discount badge - smaller */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm line-through"
          style={{ color: 'var(--color-neutral)' }}
        >
          {formatPrice(originalPrice)}
        </span>

        {/* Discount badge */}
        {showDiscountBadge && discountPercentage && (
          <span
            className="text-xs font-bold px-2 py-0.5"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-secondary-content)'
            }}
          >
            -{discountPercentage}%
          </span>
        )}
      </div>
    </div>
  );
};

export default Price;
