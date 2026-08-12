import { Badge } from '../atoms/Badge';
import { Price } from '../atoms/Price';
import { Button } from '../atoms/Button';
import { Link } from 'react-router-dom';

/**
 * ProductCard Component
 * Displays trading card product information with image, details, and purchase options
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.image - Product image URL (card, booster, deck)
 * @param {string} props.name - Product name
 * @param {string} props.set - Game set name (e.g., "Base Set", "Jungle")
 * @param {string} props.gameName - Game name (e.g., "Pokémon", "Magic")
 * @param {number} props.price - Original price
 * @param {number} props.discountedPrice - Discounted price (optional)
 * @param {number} props.rarity - Rarity level 1-5 (optional: 3=Holo, 4=Super Rare, 5=Secret Rare)
 * @param {string} props.link - Link to product detail page
 * @param {Function} props.onAddToCart - Callback when add to cart button is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} ProductCard component
 */

// Map rarity levels to badge labels and colors
const rarityConfig = {
  3: { label: 'Holo', color: 'accent', variant: 'outline' },
  4: { label: 'Super Rare', color: 'secondary', variant: 'outline' },
  5: { label: 'Secret Rare', color: 'secondary', variant: 'filled' }
};

export const ProductCard = ({
  image,
  name,
  set,
  gameName,
  price,
  discountedPrice,
  rarity,
  link,
  stock,
  onAddToCart,
  className = ''
}) => {
  const showRarityBadge = rarity && rarity >= 3;
  const rarityInfo = rarityConfig[rarity];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0) return;
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-md transition-shadow hover:shadow-xl ${className}`}
      style={{
        borderColor: 'var(--color-outline)',
        backgroundColor: 'var(--color-surface)'
      }}
    >
      {/* Image container with rarity badge overlay */}
      <Link to={link}
        className="relative w-full aspect-square overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Rarity badge - top left corner */}
        {showRarityBadge && (
          <div className="absolute top-2 left-2">
            <Badge variant="filled" color={rarityInfo.color} variant={rarityInfo.variant}>
              {rarityInfo.label}
            </Badge>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="flex flex-col flex-grow p-4">
        <Link to={link}
        className="hover:opacity-70 transition-opacity">
          <h3
            className="text-base font-display font-semibold mb-2 line-clamp-2"
            style={{ color: 'var(--color-primary)' }}
          >
            {name}
          </h3>
        </Link>

        {/* Set and game info */}
        <p
          className="text-xs mb-4"
          style={{ color: 'var(--color-neutral)' }}
        >
          {set} • {gameName}
        </p>

        {/* Price */}
        <div className="mb-4">
          <Price
            originalPrice={price}
            discountedPrice={discountedPrice}
            showDiscountBadge={false}
            layout="side"
          />
        </div>

        {/* Add to cart button - grows to fill available space */}
        <div className="mt-auto">
          <Button
            variant="default"
            color="primary"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`w-full ${
              stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            > 
            {stock <= 0 ? 'Sin Stock' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
