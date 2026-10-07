import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Star,
  PackageOpen
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, moveToCart, loading } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <Heart size={54} color="var(--danger)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Please log in to your VENDO account to view your saved products across devices.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Sign In to Access Wishlist
          </Link>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0 && !loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Heart size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Save items you love by tapping the heart icon on any product. They will stay stored in your profile!
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
          My Wishlist
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          You have saved <strong>{wishlistItems.length}</strong> product(s) to purchase later.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        {wishlistItems.map((item) => {
          const isOutOfStock = item.stock <= 0;

          return (
            <div
              key={item.wishlist_item_id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Image & Remove Action */}
              <div style={{ position: 'relative', paddingTop: '80%', backgroundColor: '#f8fafc' }}>
                <Link to={`/product/${item.slug || item.product_id}`}>
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={item.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Link>

                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)'
                  }}
                  title="Remove from Wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                      {item.brand || item.category_name}
                    </span>
                    <span className={`badge ${isOutOfStock ? 'badge-danger' : item.stock <= 5 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                      {isOutOfStock ? 'Out of Stock' : item.stock <= 5 ? `Only ${item.stock} left` : `${item.stock} available`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.65rem' }}>
                    <Link to={`/product/${item.slug || item.product_id}`} style={{ color: 'inherit' }}>
                      {item.name}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                    {item.original_price > item.price && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                        ₹{Number(item.original_price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to Cart CTA */}
                <button
                  onClick={() => moveToCart(item.product_id)}
                  disabled={isOutOfStock}
                  className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', gap: '0.5rem', opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                >
                  <ShoppingBag size={16} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
