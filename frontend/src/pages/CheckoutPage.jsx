import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  Plus,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressAPI, orderAPI, couponAPI } from '../services/api';

const CheckoutPage = () => {
  const { cartItems, cartSummary, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Coupon passed from cart
  const initialCoupon = location.state?.couponCode || '';
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Stepper state (1: Address, 2: Payment, 3: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    saveAddress: true
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems.length, navigate]);

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await addressAPI.getAddresses();
        if (res.data.success && res.data.addresses.length > 0) {
          setSavedAddresses(res.data.addresses);
          const defaultAddr = res.data.addresses.find(a => a.is_default) || res.data.addresses[0];
          setSelectedAddressId(defaultAddr.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      } catch (err) {
        console.error('Error loading addresses:', err.message);
        setUseNewAddress(true);
      }
    };

    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  // Validate coupon if passed
  useEffect(() => {
    if (initialCoupon && cartSummary.subtotal > 0) {
      couponAPI.validateCoupon(initialCoupon, cartSummary.subtotal)
        .then(res => {
          if (res.data.success) {
            setAppliedCoupon(res.data.coupon);
          }
        })
        .catch(err => console.log('Coupon auto-validation failed:', err.message));
    }
  }, [initialCoupon, cartSummary.subtotal]);

  // Pricing calculations
  const subtotal = cartSummary.subtotal || 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shipping);

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);

      const orderPayload = {
        paymentMethod,
        couponCode: appliedCoupon?.code || null
      };

      if (!useNewAddress && selectedAddressId) {
        orderPayload.addressId = selectedAddressId;
      } else {
        if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.pincode) {
          addToast('Please fill in all required shipping address fields.', 'error');
          setCurrentStep(1);
          setPlacingOrder(false);
          return;
        }
        orderPayload.shippingAddress = newAddress;
      }

      const res = await orderAPI.createOrder(orderPayload);
      if (res.data.success) {
        addToast('Order placed successfully!', 'success');
        await fetchCart(); // Refresh cart in state
        navigate(`/order-success/${res.data.order.order_number}`, { state: { order: res.data.order } });
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      
      {/* Checkout Progress Stepper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {[
          { step: 1, label: 'Delivery Address' },
          { step: 2, label: 'Payment Method' },
          { step: 3, label: 'Review & Confirm' }
        ].map((s) => (
          <div
            key={s.step}
            onClick={() => s.step < currentStep && setCurrentStep(s.step)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: s.step < currentStep ? 'pointer' : 'default',
              opacity: currentStep === s.step ? 1 : currentStep > s.step ? 0.8 : 0.4
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: currentStep >= s.step ? 'var(--accent)' : 'var(--border)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              {currentStep > s.step ? <CheckCircle2 size={18} /> : s.step}
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="checkout-layout-grid">
        
        {/* Left Column: Active Step Details */}
        <div>
          
          {/* STEP 1: Address */}
          {currentStep === 1 && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <MapPin size={22} color="var(--accent)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Delivery Address</h2>
              </div>

              {/* Saved Addresses Selector */}
              {savedAddresses.length > 0 && !useNewAddress && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedAddressId === addr.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                        backgroundColor: selectedAddressId === addr.id ? 'var(--accent-light)' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{addr.full_name}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{addr.phone}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                          {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="btn btn-outline btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Plus size={16} />
                    <span>Deliver to a New Address</span>
                  </button>
                </div>
              )}

              {/* Add New Address Form */}
              {(useNewAddress || savedAddresses.length === 0) && (
                <div>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(false)}
                      style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}
                    >
                      ← Back to saved addresses
                    </button>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address / House No / Flat / Colony *</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Flat 402, Green Glen Heights, Outer Ring Road, Bellandur"
                      value={newAddress.address_line}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        placeholder="Karnataka"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode *</label>
                      <input
                        type="text"
                        placeholder="560103"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newAddress.saveAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, saveAddress: e.target.checked })}
                    />
                    <span>Save this address to my profile for future orders</span>
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-primary"
                style={{ marginTop: '1.75rem', gap: '0.5rem' }}
              >
                <span>Continue to Payment</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {currentStep === 2 && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <CreditCard size={22} color="var(--accent)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Select Payment Method</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {/* Cash On Delivery */}
                <label style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'COD' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'COD' ? 'var(--accent-light)' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <Banknote size={18} color="var(--accent)" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Pay in cash or through UPI upon package delivery at your doorstep.
                    </p>
                  </div>
                </label>

                {/* Instant UPI */}
                <label style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'UPI' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'UPI' ? 'var(--accent-light)' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <QrCode size={18} color="var(--accent)" />
                      <span>UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Instant</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Simulated secure UPI payment transfer for demo checkout.
                    </p>
                    {paymentMethod === 'UPI' && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="form-input"
                          style={{ maxWidth: '280px', fontSize: '0.85rem' }}
                          placeholder="yourname@upi"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'CARD' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  backgroundColor: paymentMethod === 'CARD' ? 'var(--accent-light)' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <CreditCard size={18} color="var(--accent)" />
                      <span>Credit or Debit Card</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Safe sandbox payment simulation (no real card details required).
                    </p>
                    {paymentMethod === 'CARD' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginTop: '0.85rem', maxWidth: '380px' }}>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                          placeholder="Card Number"
                        />
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                          placeholder="MM/YY"
                        />
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem' }}
                          placeholder="CVV"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <span>Review Order</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Place Order */}
          {currentStep === 3 && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={22} color="var(--accent)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Review & Place Order</h2>
              </div>

              {/* Delivery Address Summary */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>DELIVERY ADDRESS</span>
                  <button onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Change</button>
                </div>
                {useNewAddress ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>{newAddress.full_name}</strong> ({newAddress.phone})<br />
                    {newAddress.address_line}, {newAddress.city}, {newAddress.state} - {newAddress.pincode}
                  </p>
                ) : (
                  (() => {
                    const a = savedAddresses.find(x => x.id === selectedAddressId) || savedAddresses[0];
                    return (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <strong>{a?.full_name}</strong> ({a?.phone})<br />
                        {a?.address_line}, {a?.city}, {a?.state} - {a?.pincode}
                      </p>
                    );
                  })()
                )}
              </div>

              {/* Payment Summary */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT METHOD</span>
                  <button onClick={() => setCurrentStep(2)} style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Change</button>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {paymentMethod === 'COD' && 'Cash on Delivery'}
                  {paymentMethod === 'UPI' && `UPI Transfer (${upiId})`}
                  {paymentMethod === 'CARD' && `Card Payment (${cardNumber})`}
                </p>
              </div>

              {/* Order Items Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {cartItems.map((item) => (
                  <div key={item.cart_item_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                    <img src={item.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ₹{Number(item.line_total).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-outline"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, gap: '0.5rem' }}
                >
                  <Lock size={18} />
                  <span>{placingOrder ? 'Confirming Order...' : `Place Order • ₹${Number(finalTotal).toLocaleString('en-IN')}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Price Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Total ({cartSummary.itemCount})</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 700 }}>- ₹{Number(couponDiscount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span>
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
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>
                ₹{Number(finalTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46', display: 'flex', gap: '0.5rem' }}>
            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
            <span>Guaranteed Safe Checkout. Your personal information is encrypted with bank-grade 256-bit SSL protocols.</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
