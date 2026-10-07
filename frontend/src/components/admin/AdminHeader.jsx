import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ onMobileToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMobileToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-main)'
          }}
          className="admin-mobile-toggle"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Operations & Management
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'var(--surface-subtle)',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-full)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.full_name} (Admin)</span>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.4rem', color: 'var(--danger)', borderColor: '#fecaca' }}
          title="Sign out of admin console"
        >
          <LogOut size={15} />
          <span>Exit</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .admin-mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default AdminHeader;
