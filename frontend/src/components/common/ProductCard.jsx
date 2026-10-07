import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const inWishlist = isWishlisted(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || addingToCart) return;

    setAddingToCart(true);
    await addToCart(product.id, 1);
    setAddingToCart(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const imageSrc = product.primary_image || product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: '#ffffff',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow-sm)'
      }}
    >
      {/* Badges Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {product.discount > 0 && (
          <span className="badge badge-deal">
            {product.discount}% OFF
          </span>
        )}
        {product.is_featured === 1 && (
          <span className="badge badge-featured">
            Featured
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        aria-label="Wishlist"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: inWishlist ? '#fee2e2' : 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: inWishlist ? 'var(--danger)' : 'var(--text-muted)',
          transition: 'transform 0.2s ease'
        }}
      >
        <Heart size={18} fill={inWishlist ? 'var(--danger)' : 'none'} />
      </button>

      {/* Product Image Link */}
      <Link
        to={`/product/${product.slug || product.id}`}
        style={{
          position: 'relative',
          paddingTop: '80%',
          width: '100%',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
          display: 'block'
        }}
      >
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
          }}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Out of Stock
          </div>
        )}
      </Link>

      {/* Card Content Body */}
      <div style={{
        padding: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Category & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>
              {product.category_name || product.category_slug || 'General'}
            </span>
            {product.brand && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                {product.brand}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            lineHeight: '1.4',
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--text-main)'
          }}>
            <Link to={`/product/${product.slug || product.id}`} style={{ color: 'inherit' }}>
              {product.name}
            </Link>
          </h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.15rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              <span>{parseFloat(product.rating || 0).toFixed(1)}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({product.review_count || 0})
            </span>

            {/* Stock status indicator */}
            {isOutOfStock ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700, marginLeft: 'auto' }}>
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, marginLeft: 'auto' }}>
                Only {product.stock} left
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                {product.stock} available
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.original_price > product.price && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                ₹{Number(product.original_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-dark'}`}
            style={{
              width: '100%',
              padding: '0.65rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              opacity: isOutOfStock ? 0.6 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingBag size={15} />
            <span>{isOutOfStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;