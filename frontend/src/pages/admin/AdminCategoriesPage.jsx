import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const AdminCategoriesPage = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await categoryAPI.updateCategory(editingCategory.id, {
          name: name.trim(),
          description,
          image_url: imageUrl
        });
        if (res.data.success) {
          addToast('Category updated successfully!', 'success');
          setModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await categoryAPI.createCategory({
          name: name.trim(),
          description,
          image_url: imageUrl
        });
        if (res.data.success) {
          addToast('Category created successfully!', 'success');
          setModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, count) => {
    if (count > 0) {
      addToast(`Cannot delete category with ${count} active products. Reassign them first.`, 'warning');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await categoryAPI.deleteCategory(id);
      if (res.data.success) {
        addToast('Category deleted.', 'info');
        fetchCategories();
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
            Category Taxonomy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Structure store departments, assign product hierarchies, and banner images.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'center',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              backgroundColor: 'var(--surface-subtle)',
              flexShrink: 0
            }}>
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {cat.name}
                </h3>
                <span className="badge badge-secondary">
                  {cat.product_count} items
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.85rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {cat.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEditModal(cat)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.product_count)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Home & Living"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              placeholder="Department highlights and summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
