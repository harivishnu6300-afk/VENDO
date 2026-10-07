import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserCheck, UserX, ShoppingBag, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const { addToast } = useToast();
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminAPI.getAllUsers(params);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminAPI.updateUserStatus(user.id, { status: newStatus });
      if (res.data.success) {
        addToast(`User ${user.full_name} is now ${newStatus}.`, 'info');
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    // Client-side guard: ensure caller is admin
    if (currentAdmin?.role !== 'admin') {
      addToast('Only administrators can delete user accounts.', 'error');
      return;
    }

    // Guard: prevent deleting self
    if (user.id === currentAdmin?.id) {
      addToast('You cannot delete your own admin account.', 'error');
      return;
    }

    // Guard: prevent deleting admin accounts
    if (user.role === 'admin') {
      addToast('Admin accounts cannot be deleted.', 'error');
      return;
    }

    // Mandatory confirmation prompt
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      const res = await adminAPI.deleteUser(user.id);
      if (res.data.success) {
        addToast(res.data.message || `User ${user.full_name} deleted successfully.`, 'success');
        await fetchUsers();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
          User Directory & Access Control
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Inspect registered customer profiles, transaction totals, and security states.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <input
              type="text"
              placeholder="Search by full name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
            />
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn btn-dark btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Contact</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Orders Placed</th>
                <th style={{ padding: '1rem' }}>Total Spent</th>
                <th style={{ padding: '1rem' }}>Joined Date</th>
                <th style={{ padding: '1rem' }}>Account Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: u.role === 'admin' ? '#ede9fe' : 'var(--accent-light)',
                      color: u.role === 'admin' ? '#7c3aed' : 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      {u.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{u.id}</div>
                    </div>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone'}</div>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-featured' : 'badge-secondary'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    {u.order_count || 0}
                  </td>

                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ₹{Number(u.total_spent || 0).toLocaleString('en-IN')}
                  </td>

                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          color: u.status === 'active' ? 'var(--warning)' : 'var(--success)',
                          borderColor: u.status === 'active' ? '#fcd34d' : '#a7f3d0'
                        }}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Delete button: only for admin, cannot delete self or other admins */}
                      {currentAdmin?.role === 'admin' && u.id !== currentAdmin?.id && u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={deletingId === u.id}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            color: 'var(--danger)',
                            borderColor: '#fca5a5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            opacity: deletingId === u.id ? 0.6 : 1,
                            cursor: deletingId === u.id ? 'not-allowed' : 'pointer'
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                          <span>{deletingId === u.id ? 'Deleting...' : 'Delete User'}</span>
                        </button>
                      )}

                      {u.id === currentAdmin?.id && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0.35rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                          You
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
