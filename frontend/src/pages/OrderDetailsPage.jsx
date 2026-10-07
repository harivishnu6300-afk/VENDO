import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  ChevronLeft, 
  AlertCircle,
  XCircle,
  Box
} from 'lucide-react';
import { orderAPI } from '../services/api';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getOrderById(id);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <div className="skeleton" style={{ height: '350px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>We could not locate this order.</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const timelineSteps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    { key: 'packed', label: 'Packed & Processed', icon: Box },
    { key: 'shipped', label: 'Shipped (In Transit)', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepKey) => {
    const orderProgression = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIndex = orderProgression.indexOf(order.status);
    const stepIndex = orderProgression.indexOf(stepKey);

    if (order.status === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      
      {/* Top Back Link */}
      <Link
        to="/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.875rem',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}
      >
        <ChevronLeft size={16} />
        <span>Back to My Orders</span>
      </Link>

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Order {order.order_number}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Status: </span>
          <span className="badge" style={{
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            backgroundColor: order.status === 'delivered' ? 'var(--success-bg)' : order.status === 'cancelled' ? '#fee2e2' : 'var(--accent-light)',
            color: order.status === 'delivered' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : 'var(--accent)'
          }}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Visual Tracking Timeline Card */}
      <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '2rem' }}>
          Live Tracking Timeline
        </h2>

        {order.status === 'cancelled' ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecdd3',
            color: '#991b1b'
          }}>
            <XCircle size={28} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>This order has been cancelled</div>
              <p style={{ fontSize: '0.85rem' }}>Stock has been restored and any pending transactions have been refunded.</p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            position: 'relative'
          }} className="order-timeline-grid">
            {timelineSteps.map((step, idx) => {
              const status = getStepStatus(step.key);
              const isCompleted = status === 'completed';

              return (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--accent)' : '#f1f5f9',
                    color: isCompleted ? '#ffffff' : 'var(--text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    boxShadow: isCompleted ? '0 4px 10px rgba(37,99,235,0.3)' : 'none',
                    border: isCompleted ? 'none' : '2px solid var(--border)'
                  }}>
                    <step.icon size={20} />
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: isCompleted ? 700 : 500,
                    color: isCompleted ? 'var(--text-main)' : 'var(--text-light)'
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Order Items & Delivery Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="order-details-grid">
        
        {/* Left: Purchased Products Table */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Items Ordered ({order.items?.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                  alt=""
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.product_name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity} unit(s)
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  ₹{Number(item.total_price).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary Breakdown */}
          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>

            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span style={{ fontWeight: 700 }}>- ₹{Number(order.discount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 600 }}>{order.shipping === '0.00' || order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Total Paid / Payable</span>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)' }}>
                ₹{Number(order.total_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Delivery & Payment Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Delivery Address */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <MapPin size={18} color="var(--accent)" />
              <span>Shipping Address</span>
            </div>
            {order.delivery_address && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <strong>{order.delivery_address.full_name}</strong><br />
                Phone: {order.delivery_address.phone}<br />
                {order.delivery_address.address_line}<br />
                {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
              </p>
            )}
          </div>

          {/* Payment Info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <CreditCard size={18} color="var(--accent)" />
              <span>Payment Information</span>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div><strong>Method:</strong> {order.payment_method}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{
                  color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment?.transaction_id && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Transaction ID: {order.payment.transaction_id}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .order-timeline-grid {
            grid-template-columns: 1fr 1fr !important;
            row-gap: 2rem !important;
          }
          .order-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsPage;
