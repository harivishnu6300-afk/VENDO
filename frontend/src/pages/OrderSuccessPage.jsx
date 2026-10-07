import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Calendar, Truck } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container" style={{ padding: '4rem 1.25rem 6rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3.5rem 2.5rem' }}>
        
        {/* Animated Success Badge */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle2 size={48} />
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Thank you for shopping with VENDO. We have received your order and are preparing it for express dispatch.
        </p>

        {/* Order Info Badge */}
        <div style={{
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border)',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Reference Number</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
              {orderNumber || order?.order_number}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Estimated Delivery</div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Truck size={15} color="var(--accent)" />
                <span>3 - 5 Business Days</span>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Payment Status</div>
              <div style={{ fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                {order?.payment_method === 'COD' ? 'Cash on Delivery (Pending)' : 'Paid Online (Confirmed)'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
            <Package size={18} />
            <span>Track My Order</span>
          </Link>
          <Link to="/shop" className="btn btn-outline btn-lg" style={{ gap: '0.5rem' }}>
            <Home size={18} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
