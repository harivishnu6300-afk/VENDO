import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getUserOrders();
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="badge badge-success">✓ Delivered</span>;
      case 'shipped':
        return <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>🚚 Shipped</span>;
      case 'packed':
        return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>📦 Packed</span>;
      case 'confirmed':
        return <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>✓ Confirmed</span>;
      case 'cancelled':
        return <span className="badge badge-deal">✕ Cancelled</span>;
      default:
        return <span className="badge badge-secondary">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '2rem' }}>My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card skeleton" style={{ height: '140px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
          My Order History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          View, track, and manage all your past and active orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Orders Placed Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            When you purchase items from VENDO, your orders and real-time live tracking updates will appear here.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card"
              style={{
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)'
              }}
            >
              {/* Order Card Header */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent)' }}>
                      {order.order_number}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PLACED ON</span>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL AMOUNT</span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT</span>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {order.payment_method}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getStatusBadge(order.status)}
                  <Link
                    to={`/orders/${order.order_number || order.id}`}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    <span>View Tracking</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                      alt=""
                      style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.product_name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{Number(item.total_price).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
