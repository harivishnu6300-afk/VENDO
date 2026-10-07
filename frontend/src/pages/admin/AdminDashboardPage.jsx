import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboardStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dashboard Overview</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card skeleton" style={{ height: '110px' }} />
          ))}
        </div>
      </div>
    );
  }

  const { stats, lowStockProducts, categoryDistribution, orderStatuses, recentOrders, salesTrend } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Executive Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time metrics, live financial overview, and customer sales activity.
        </p>
      </div>

      {/* 6 Metric Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Total Revenue */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active Sales Completed</span>
        </div>

        {/* Total Orders */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.totalOrders || 0}
          </div>
          <Link to="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Manage Orders</span> <ChevronRight size={12} />
          </Link>
        </div>

        {/* Total Products */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Catalog Items</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.totalProducts || 0}
          </div>
          <Link to="/admin/products" style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Manage Catalog</span> <ChevronRight size={12} />
          </Link>
        </div>

        {/* Total Customers */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customers</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.totalUsers || 0}
          </div>
          <Link to="/admin/users" style={{ fontSize: '0.75rem', color: '#0891b2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>View Customers</span> <ChevronRight size={12} />
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending / In Prep</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.pendingOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Needs Fulfillment</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Stock Items</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {stats?.lowStockCount || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Inventory Warning</span>
        </div>
      </div>

      {/* Visual Chart & Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="admin-charts-grid">
        
        {/* Sales Performance Visual */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Revenue Performance</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily volume and receipts</p>
            </div>
            <span className="badge badge-success">Live Tracked</span>
          </div>

          {/* Graphical Bar representation */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            height: '220px',
            paddingTop: '2rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.5rem'
          }}>
            {salesTrend && salesTrend.length > 0 ? (
              salesTrend.map((day, i) => {
                const maxRev = Math.max(...salesTrend.map(d => parseFloat(d.daily_revenue || 1)));
                const barHeight = Math.max(15, (parseFloat(day.daily_revenue) / maxRev) * 160);

                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{Math.round(parseFloat(day.daily_revenue) / 1000)}k
                    </div>
                    <div style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${barHeight}px`,
                      backgroundColor: 'var(--accent)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.date.substring(5)}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                Order transactions will populate the sales chart in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>Department Distribution</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Active inventory count by category</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryDistribution?.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{cat.product_count} items</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (cat.product_count / 10) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Table Row: Recent Orders & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }} className="admin-tables-grid">
        
        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Order</th>
                  <th style={{ padding: '0.5rem 0' }}>Customer</th>
                  <th style={{ padding: '0.5rem 0' }}>Total</th>
                  <th style={{ padding: '0.5rem 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 700, color: 'var(--accent)' }}>
                      <Link to="/admin/orders">{ord.order_number}</Link>
                    </td>
                    <td style={{ padding: '0.75rem 0' }}>{ord.customer_name}</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: 700 }}>₹{Number(ord.total_amount).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)' }}>
              Low Stock Warnings
            </h2>
            <Link to="/admin/products" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
              Restock
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3'
                  }}
                >
                  <img src={p.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {p.stock} Left
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                All inventory levels are healthy!
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-charts-grid, .admin-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
