import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Globe,
  Share2
} from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', marginTop: '4rem', borderTop: '1px solid #1e293b' }}>
      
      {/* Customer Benefits Bar */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2.5rem 0', backgroundColor: '#131d33' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37,99,235,0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Free Shipping</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>On all orders above ₹999 across India</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Secure Payment</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>100% encrypted UPI & Card checkout</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>Easy Returns</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>7-day hassle-free replacement policy</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(168,85,247,0.15)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Headphones size={24} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700 }}>24/7 Dedicated Support</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Instant assistance whenever you need</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem'
        }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" className="vendo-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <div className="vendo-logo-icon" style={{ boxShadow: 'none' }}>V</div>
              <span className="vendo-logo-text" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VENDO
              </span>
            </Link>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Shop Smart. Live Better. VENDO is India's premium curated destination for modern electronics, high fashion, luxury beauty, and everyday lifestyle essentials.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {/* Instagram */}
              <a href="#instagram" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* Twitter / X */}
              <a href="#twitter" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </a>
              {/* Facebook */}
              <a href="#facebook" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#linkedin" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>About VENDO</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/about">Company Story</Link></li>
              <li><Link to="/careers">Careers & Culture</Link></li>
              <li><Link to="/press">Newsroom & Press</Link></li>
              <li><Link to="/sustainability">Eco Initiatives</Link></li>
              <li><Link to="/investors">Investor Relations</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/faq">Help Center & FAQ</Link></li>
              <li><Link to="/returns">Shipping & Deliveries</Link></li>
              <li><Link to="/returns">Exchange & Returns</Link></li>
              <li><Link to="/contact">Report an Issue</Link></li>
            </ul>
          </div>

          {/* Shopping Categories */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Shopping</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/shop?category=electronics">Electronics & Tech</Link></li>
              <li><Link to="/shop?category=fashion">Men & Women Fashion</Link></li>
              <li><Link to="/shop?category=beauty">Beauty & Personal Care</Link></li>
              <li><Link to="/shop?category=home-living">Home & Living</Link></li>
              <li><Link to="/shop?category=sports">Sports & Outdoor</Link></li>
              <li><Link to="/shop?category=accessories">Luxury Accessories</Link></li>
            </ul>
          </div>

          {/* Policies & Contact */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Policies & Contact</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Notice</Link></li>
              <li><Link to="/security">Payment Security</Link></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Phone size={14} color="#3b82f6" /> 1800-419-VENDO
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#3b82f6" /> support@vendo.com
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#3b82f6" /> Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div style={{
          borderTop: '1px solid #1e293b',
          marginTop: '3rem',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div>
            &copy; {new Date().getFullYear()} <strong>VENDO</strong> Technologies Pvt Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#cbd5e1' }}>
            <span>Accepted Payments:</span>
            <span style={{ backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>UPI</span>
            <span style={{ backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>RuPay</span>
            <span style={{ backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>Visa</span>
            <span style={{ backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>Mastercard</span>
            <span style={{ backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
