import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  ChevronRight, 
  Share2, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProductById(id);
        if (res.data.success) {
          setProduct(res.data.product);
          const primaryImg = res.data.product.images?.find(img => img.is_primary) || res.data.product.images?.[0];
          setSelectedImage(primaryImg ? primaryImg.image_url : '');
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          <div className="skeleton" style={{ width: '100%', height: '480px', borderRadius: 'var(--radius-xl)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ width: '30%', height: '24px' }} />
            <div className="skeleton" style={{ width: '85%', height: '36px' }} />
            <div className="skeleton" style={{ width: '40%', height: '20px' }} />
            <div className="skeleton" style={{ width: '50%', height: '32px' }} />
            <div className="skeleton" style={{ width: '100%', height: '100px' }} />
            <div className="skeleton" style={{ width: '100%', height: '48px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem', maxWidth: '450px', margin: '0 auto' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            The item you requested does not exist or may have been discontinued.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const inWishlist = isWishlisted(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const added = await addToCart(product.id, quantity);
    if (added !== false) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please login to write a verified review.', 'warning');
      return;
    }

    if (!reviewComment.trim()) {
      addToast('Please write a brief comment with your review.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await productAPI.addReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        // Refresh product details
        const refreshed = await productAPI.getProductById(product.id);
        if (refreshed.data.success) {
          setProduct(refreshed.data.product);
        }
        setReviewComment('');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      
      {/* Breadcrumb Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <Link to="/" style={{ hover: { color: 'var(--accent)' } }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?category=${product.category_slug}`}>{product.category_name}</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3.5rem',
        marginBottom: '4rem'
      }}>
        
        {/* Left: Product Images Gallery */}
        <div>
          <div style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            paddingTop: '85%'
          }}>
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '1.5rem',
                backgroundColor: '#f8fafc'
              }}
            />

            {product.discount > 0 && (
              <span className="badge badge-deal" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImage === img.image_url ? '2px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: '#ffffff',
                    padding: '4px',
                    flexShrink: 0
                  }}
                >
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Brand & Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.brand || product.category_name}
            </span>
            <span className={`badge ${isOutOfStock ? 'badge-danger' : product.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
              {isOutOfStock ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} available`}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          {/* Ratings & Reviews Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{parseFloat(product.rating || 0).toFixed(1)}</span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {product.review_count || 0} Customer Reviews
            </span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
              100% Verified Genuine
            </span>
          </div>

          {/* Price Block */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.original_price > product.price && (
              <>
                <span style={{ fontSize: '1.15rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{Number(product.original_price).toLocaleString('en-IN')}
                </span>
                <span className="badge badge-deal" style={{ fontSize: '0.8rem' }}>
                  Save ₹{Number(product.original_price - product.price).toLocaleString('en-IN')} ({product.discount}%)
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Quantity Selector & Wishlist */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Quantity:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff'
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  style={{ padding: '0.5rem 0.75rem', color: 'var(--text-main)', opacity: (quantity <= 1 || isOutOfStock) ? 0.4 : 1, cursor: (quantity <= 1 || isOutOfStock) ? 'not-allowed' : 'pointer' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  style={{ padding: '0.5rem 0.75rem', color: 'var(--text-main)', opacity: (quantity >= product.stock || isOutOfStock) ? 0.4 : 1, cursor: (quantity >= product.stock || isOutOfStock) ? 'not-allowed' : 'pointer' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="btn btn-outline"
              style={{
                gap: '0.5rem',
                color: inWishlist ? 'var(--danger)' : 'var(--text-main)',
                borderColor: inWishlist ? '#fca5a5' : 'var(--border)',
                backgroundColor: inWishlist ? '#fee2e2' : '#ffffff'
              }}
            >
              <Heart size={18} fill={inWishlist ? 'var(--danger)' : 'none'} />
              <span>{inWishlist ? 'Wishlisted' : 'Save to Wishlist'}</span>
            </button>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-outline'} btn-lg`}
              style={{
                borderColor: isOutOfStock ? 'var(--border)' : 'var(--accent)',
                color: isOutOfStock ? 'var(--text-muted)' : 'var(--accent)',
                fontWeight: 700,
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'} btn-lg`}
              style={{
                fontWeight: 700,
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
            </button>
          </div>

          {/* Trust Value Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            marginTop: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Truck size={18} color="var(--accent)" />
              <span>Free Delivery (₹999+)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <RotateCcw size={18} color="var(--accent)" />
              <span>7-Day Easy Returns</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--accent)" />
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Technical Details */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Technical Specifications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{key}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Write Review Section */}
      <section className="card" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Customer Ratings & Reviews
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {parseFloat(product.rating || 0).toFixed(1)}
              </span>
              <div>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(product.rating || 0) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Based on {product.reviews?.length || product.review_count || 0} reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Write a Review Box */}
        <div style={{
          backgroundColor: 'var(--surface-subtle)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Write a Review
          </h3>
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Your Rating:</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{ color: '#f59e0b' }}
                      aria-label={`${star} Stars`}
                    >
                      <Star size={22} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Share your experience with this product... Was the quality as expected? Would you recommend it?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-textarea"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Please sign in to your VENDO account to leave a verified rating and review.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {rev.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {rev.user_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '0.5rem', fontWeight: 600 }}>
                        ✓ Verified Buyer
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= rev.rating ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
              No reviews yet for this product. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {product.related && product.related.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Customers Also Viewed
            </h2>
            <Link to={`/shop?category=${product.category_slug}`} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
              View More
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;