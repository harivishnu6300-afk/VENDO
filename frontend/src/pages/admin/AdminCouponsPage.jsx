import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Trash2, Tag, Calendar } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const AdminCouponsPage = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('999');
  const [maxDiscount, setMaxDiscount] = useState('2000');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCoupons();
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      addToast('Coupon code and discount value are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminAPI.createCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrder || 0,
        max_discount_amount: maxDiscount || null,
        valid_until: validUntil || null
      });

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setModalOpen(false);
        setCode('');
        setDiscountValue('');
        fetchCoupons();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      const res = await adminAPI.deleteCoupon(id);
      if (res.data.success) {
        addToast(res.data.message, 'info');
        fetchCoupons();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Promotional Coupons & Vouchers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Issue discounts, set order thresholds, and monitor promo redemptions.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {coupons.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              border: '1.5px dashed var(--border)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '0.08em'
              }}>
                {c.code}
              </div>

              <button
                onClick={() => handleDeleteCoupon(c.id)}
                style={{ color: 'var(--danger)', padding: '0.3rem' }}
                title="Delete coupon"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
              <div>
                <strong>Benefit:</strong>{' '}
                {c.discount_type === 'percentage' ? `${c.discount_value}% Discount` : `₹${c.discount_value} Flat Off`}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Min Order: ₹{Number(c.min_order_amount).toLocaleString('en-IN')}
              </div>
              {c.max_discount_amount && (
                <div style={{ color: 'var(--text-muted)' }}>
                  Max Cap: ₹{Number(c.max_discount_amount).toLocaleString('en-IN')}
                </div>
              )}
              {c.valid_until && (
                <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Expires: {new Date(c.valid_until).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Promotional Coupon"
      >
        <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Coupon Code *</label>
            <input
              type="text"
              placeholder="e.g. FESTIVE25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="form-input"
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="form-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input
                type="number"
                min="1"
                placeholder={discountType === 'percentage' ? '15' : '500'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Min Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="999"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="2000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valid Until (Optional)</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCouponsPage;
