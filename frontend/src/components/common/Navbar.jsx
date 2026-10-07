import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Package, 
  Sliders, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartSummary } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Banner Notice */}
      <div style={{
        backgroundColor: 'var(--primary)',
        color: '#f8fafc',
        fontSize: '0.8rem',
        padding: '0.4rem 1rem',
        textAlign: 'center',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <Sparkles size={14} color="#f59e0b" />
        <span>Festive Mega Sale: Extra 10% OFF on all orders with code <strong>VENDO10</strong> | Free Delivery on orders over ₹999</span>
      </div>

      <div className="container" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Brand Logo */}
          <Link to="/" className="vendo-logo" style={{ textDecoration: 'none' }}>
            <div className="vendo-logo-icon">V</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="vendo-logo-text">VENDO</span>
              <span className="vendo-tagline">Shop Smart. Live Better.</span>
            </div>
          </Link>

          {/* Search Bar (Desktop / Tablet) */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{
              flex: 1,
              maxWidth: '540px',
              position: 'relative',
              display: 'none'
            }}
            className="navbar-search-desktop"
          >
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.75rem 0.65rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--surface-subtle)',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
              }}
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Right Action Icons & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Wishlist */}
            <Link
              to="/wishlist"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface-subtle)'
              }}
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface-subtle)'
              }}
              title="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartSummary.itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {cartSummary.itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="user-name-display">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '220px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem',
                    zIndex: 200,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.full_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                      {isAdmin && (
                        <span className="badge badge-featured" style={{ marginTop: '0.35rem', fontSize: '0.65rem' }}>
                          Administrator
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '0.35rem 0' }}>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.875rem',
                            color: 'var(--accent)',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <ShieldCheck size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-main)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <User size={16} /> My Account
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-main)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Package size={16} /> My Orders
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.35rem' }}>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--danger)',
                          borderRadius: 'var(--radius-sm)',
                          textAlign: 'left'
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm register-btn-desktop">
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-subtle)'
              }}
              className="mobile-menu-toggle"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          paddingTop: '0.75rem',
          marginTop: '0.5rem',
          borderTop: '1px solid #f1f5f9'
        }} className="desktop-nav-bar">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/shop" 
            className={`nav-link ${location.pathname === '/shop' && !location.search ? 'active' : ''}`}
          >
            Shop All
          </Link>
          <Link 
            to="/shop?category=electronics" 
            className={`nav-link ${location.search.includes('category=electronics') ? 'active' : ''}`}
          >
            Electronics
          </Link>
          <Link 
            to="/shop?category=fashion" 
            className={`nav-link ${location.search.includes('category=fashion') ? 'active' : ''}`}
          >
            Fashion
          </Link>
          <Link 
            to="/shop?category=beauty" 
            className={`nav-link ${location.search.includes('category=beauty') ? 'active' : ''}`}
          >
            Beauty
          </Link>
          <Link 
            to="/shop?category=home-living" 
            className={`nav-link ${location.search.includes('category=home-living') ? 'active' : ''}`}
          >
            Home & Living
          </Link>
          <Link 
            to="/shop?deals=true" 
            className={`nav-link nav-link-deal ${location.search.includes('deals=true') ? 'active' : ''}`}
          >
            <Flame size={16} /> Flash Deals
          </Link>
          <Link 
            to="/shop?sort=newest" 
            className={`nav-link nav-link-special ${location.search.includes('sort=newest') ? 'active' : ''}`}
          >
            <Sparkles size={16} /> New Arrivals
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: '#ffffff',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--surface-subtle)',
                fontSize: '0.95rem'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent)'
              }}
            >
              <Search size={18} />
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/" style={{ padding: '0.5rem 0', fontWeight: 600 }}>Home</Link>
            <Link to="/shop" style={{ padding: '0.5rem 0', fontWeight: 600 }}>Shop All</Link>
            <Link to="/shop?deals=true" style={{ padding: '0.5rem 0', fontWeight: 700, color: 'var(--deal-badge)' }}>🔥 Flash Deals</Link>
            <Link to="/shop?sort=newest" style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--accent)' }}>✨ New Arrivals</Link>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Categories</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link to="/shop?category=electronics" style={{ fontSize: '0.875rem' }}>Electronics</Link>
                <Link to="/shop?category=fashion" style={{ fontSize: '0.875rem' }}>Fashion</Link>
                <Link to="/shop?category=beauty" style={{ fontSize: '0.875rem' }}>Beauty</Link>
                <Link to="/shop?category=home-living" style={{ fontSize: '0.875rem' }}>Home & Living</Link>
                <Link to="/shop?category=sports" style={{ fontSize: '0.875rem' }}>Sports</Link>
                <Link to="/shop?category=accessories" style={{ fontSize: '0.875rem' }}>Accessories</Link>
              </div>
            </div>
            
            {isAdmin && (
              <Link to="/admin" style={{ padding: '0.5rem 0', fontWeight: 700, color: 'var(--accent)', borderTop: '1px solid var(--border)' }}>
                🛡️ Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Media Query Styles for Desktop/Mobile Navbar */}
      <style>{`
        @media (min-width: 900px) {
          .navbar-search-desktop { display: block !important; }
          .mobile-menu-toggle { display: none !important; }
          .desktop-nav-bar { display: flex !important; }
        }
        @media (max-width: 899px) {
          .desktop-nav-bar { display: none !important; }
          .register-btn-desktop { display: none !important; }
          .user-name-display { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
