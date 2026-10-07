import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  TicketPercent, 
  ExternalLink,
  Store
} from 'lucide-react';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: TicketPercent },
  ];

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '1.5rem 1rem'
    }}>
      {/* Brand */}
      <div style={{ padding: '0 0.5rem 1.5rem', borderBottom: '1px solid #1e293b' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="vendo-logo-icon">V</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>VENDO</div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Admin Suite
            </div>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1.5rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            })}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Store Link */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1e293b',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={16} />
            <span>Live Store</span>
          </div>
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside style={{
        width: '240px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'none'
      }} className="admin-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex'
        }}>
          <div 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} 
            onClick={() => setMobileOpen(false)} 
          />
          <div style={{ width: '260px', height: '100%', position: 'relative', zIndex: 101 }}>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .admin-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
