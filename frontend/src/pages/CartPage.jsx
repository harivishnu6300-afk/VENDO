import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  Check, 
  ShieldCheck, 
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { couponAPI } from '../services/api';

const CartPage = () => {
  const { cartItems, cartSummary, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '3rem' }}>
          <ShoppingBag size={54} color="var(--accent)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your Cart is Waiting</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Sign in to view your saved items, synchronize across devices, and proceed to secure checkout.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Sign In to View Cart
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <ShoppingBag size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Looks like you haven't added anything to your cart yet. Explore our latest drops and deals!
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Start Shopping Now
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await couponAPI.validateCoupon(couponCode.trim(), cartSummary.subtotal);
      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    addToast('Coupon removed.', 'info');
  };

  const handleProceedToCheckout = () => {
    const outOfStockItem = cartItems.find(item => item.stock <= 0);
    if (outOfStockItem) {
      addToast(`"${outOfStockItem.name}" is out of stock. Please remove it to proceed.`, 'error');
      return;
    }
    const exceedItem = cartItems.find(item => item.quantity > item.stock);
    if (exceedItem) {
      addToast(`Only ${exceedItem.stock} items are available.`, 'error');
      return;
    }
    navigate('/checkout', { state: { couponCode: appliedCoupon?.code } });
  };

  // Calculations including coupon
  const subtotal = cartSummary.subtotal || 0;
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - couponDiscountAmount + shipping);

  const freeShippingProgress = Math.min(100, (subtotal / 999) * 100);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      
      {/* Page Title & Clear Cart Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Shopping Cart
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            You have <strong>{cartSummary.itemCount}</strong> item(s) in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="btn btn-outline btn-sm"
          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
        >
          <Trash2 size={15} />
          <span>Clear All</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="cart-layout-grid">
        
        {/* Left Column: Cart Items List */}
        <div>
          {/* Free Shipping Progress Indicator */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: '#1e40af' }}>
                {subtotal >= 999
                  ? '🎉 Congratulations! You unlocked FREE Standard Shipping!'
                  : `Add ₹${(999 - subtotal).toLocaleString('en-IN')} more to get FREE Delivery!`}
              </span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#dbeafe', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${freeShippingProgress}%`,
                backgroundColor: 'var(--accent)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Items Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Product Thumbnail */}
                <Link
                  to={`/product/${item.slug || item.product_id}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: '#f8fafc',
                    flexShrink: 0,
                    border: '1px solid var(--border)'
                  }}
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>

                {/* Info & Quantity */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      {item.brand && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                          {item.brand}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem', marginBottom: '0.4rem' }}>
                        <Link to={`/product/${item.slug || item.product_id}`} style={{ color: 'inherit' }}>
                          {item.name}
                        </Link>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                          {item.original_price > item.price && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                              ₹{Number(item.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {item.stock <= 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700 }}>
                            Out of Stock
                          </span>
                        ) : item.stock <= 5 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>
                            Only {item.stock} left
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {item.stock} available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      style={{ color: 'var(--text-light)', hover: { color: 'var(--danger)' } }}
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        style={{ padding: '0.35rem 0.65rem' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        style={{ padding: '0.35rem 0.65rem', opacity: item.quantity >= item.stock ? 0.4 : 1 }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Line Total: </span>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                        ₹{Number(item.line_total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
          
          {/* Coupon Box */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} color="var(--accent)" />
              <span>Apply Coupon / Voucher</span>
            </h3>

            {appliedCoupon ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid #a7f3d0'
              }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#065f46', fontSize: '0.9rem' }}>{appliedCoupon.code}</span>
                  <p style={{ fontSize: '0.75rem', color: '#047857' }}>Saved ₹{appliedCoupon.discount_amount} on this order</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="e.g. VENDO10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="btn btn-dark btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Available Promo Pills */}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCouponCode('VENDO10')}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--surface-subtle)', border: '1px dashed var(--border)', fontWeight: 600 }}
              >
                VENDO10 (10% off)
              </button>
              <button
                type="button"
                onClick={() => setCouponCode('WELCOME500')}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--surface-subtle)', border: '1px dashed var(--border)', fontWeight: 600 }}
              >
                WELCOME500 (₹500 off)
              </button>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({cartSummary.itemCount} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {cartSummary.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Catalog Discount</span>
                  <span style={{ fontWeight: 700 }}>
                    - ₹{Number(cartSummary.discount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span style={{ fontWeight: 700 }}>
                    - ₹{Number(couponDiscountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>

              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>
                  ₹{Number(finalTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem', gap: '0.6rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} color="var(--success)" />
              <span>Safe 256-bit Encrypted SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
