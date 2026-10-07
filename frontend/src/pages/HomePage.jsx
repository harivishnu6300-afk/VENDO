import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  Percent,
  ChevronRight,
  Headphones,
  ShoppingBag
} from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flash deal countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, dealsRes, featRes, trendRes, newRes] = await Promise.all([
          categoryAPI.getCategories(),
          productAPI.getProducts({ deals: 'true', limit: 4 }),
          productAPI.getProducts({ featured: 'true', limit: 4 }),
          productAPI.getProducts({ trending: 'true', limit: 4 }),
          productAPI.getProducts({ sort: 'newest', limit: 4 })
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (dealsRes.data.success) setDeals(dealsRes.data.products || []);
        if (featRes.data.success) setFeatured(featRes.data.products || []);
        if (trendRes.data.success) setTrending(trendRes.data.products || []);
        if (newRes.data.success) setNewArrivals(newRes.data.products || []);
      } catch (err) {
        console.error('Error loading homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem', paddingBottom: '3rem' }}>
      
      {/* 1. Hero Banner */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '5rem 0',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Background Glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3rem'
          }}>
            {/* Hero Left Content */}
            <div style={{ maxWidth: '600px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#93c5fd',
                marginBottom: '1.5rem'
              }}>
                <Sparkles size={16} color="#60a5fa" />
                <span>Next-Generation Shopping Experience</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-display)'
              }}>
                Shop Smart.<br />
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Live Better.
                </span>
              </h1>

              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: '#cbd5e1',
                marginBottom: '2rem'
              }}>
                Discover premium curated electronics, high fashion apparel, luxury skincare, and smart living essentials delivered fast across India.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <Link to="/shop" className="btn btn-primary btn-lg" style={{ boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)' }}>
                  <span>Shop Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/shop?deals=true" className="btn btn-outline btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Flame size={18} color="#f87171" />
                  <span>Explore Deals</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.85rem',
                color: '#94a3b8'
              }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>100%</div>
                  <div>Authentic Brands</div>
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>₹999+</div>
                  <div>Free Delivery</div>
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem' }}>7 Days</div>
                  <div>Easy Returns</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#1e293b',
                position: 'relative'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                  alt="Sony Wireless Headphones"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />

                {/* Floating Product Highlight Card */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span className="badge badge-deal" style={{ marginBottom: '0.35rem' }}>14% OFF</span>
                    <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>Sony WH-1000XM5</h3>
                    <p style={{ color: '#93c5fd', fontSize: '0.85rem' }}>Industry-Leading Noise Cancellation</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem' }}>₹29,990</div>
                    <Link to="/product/sony-wh-1000xm5-wireless-headphones" className="btn btn-primary btn-sm" style={{ marginTop: '0.35rem' }}>
                      View Deal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore By Department
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Shop Popular Categories
            </h2>
          </div>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="card"
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.85rem',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80'}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {cat.product_count || 4} Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Deals Section */}
      <section className="container">
        <div style={{
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--deal-badge)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(220,38,38,0.3)'
              }}>
                <Flame size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b', lineHeight: 1.2 }}>
                  Lightning Flash Deals
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
                  Limited time deals with massive discounts. Grab yours before the timer runs out!
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #fecdd3'
            }}>
              <Clock size={16} color="#dc2626" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#991b1b' }}>Ends in:</span>
              <div style={{ display: 'flex', gap: '0.3rem', fontWeight: 800, color: '#dc2626' }}>
                <span style={{ backgroundColor: '#fee2e2', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                :
                <span style={{ backgroundColor: '#fee2e2', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                :
                <span style={{ backgroundColor: '#fee2e2', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}>
              {deals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Featured Products */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Handpicked By Experts
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Featured Products
            </h2>
          </div>
          <Link to="/shop?featured=true" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>
            <span>Explore All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Promotional Mid-Page Banner */}
      <section className="container">
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2.5rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ maxWidth: '550px', zIndex: 1 }}>
            <span className="badge badge-warning" style={{ marginBottom: '1rem', backgroundColor: '#fef3c7', color: '#92400e' }}>
              Special Festive Offer
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Save 10% Extra On Your First Purchase
            </h2>
            <p style={{ color: '#e0e7ff', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Apply coupon code <strong>VENDO10</strong> during checkout to unlock instant discounts across our entire catalog.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1.5px dashed #ffffff',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                letterSpacing: '0.1em',
                fontSize: '1.1rem'
              }}>
                VENDO10
              </div>
              <Link to="/shop" className="btn" style={{ backgroundColor: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
                Shop Collection
              </Link>
            </div>
          </div>

          <div style={{ zIndex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              minWidth: '130px'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹500</div>
              <div style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>Code: WELCOME500</div>
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              minWidth: '130px'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>20%</div>
              <div style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>Code: SAVE20</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals & Trending Tabs / Sections */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fresh Drops
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              New Arrivals
            </h2>
          </div>
          <Link to="/shop?sort=newest" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>
            <span>Explore All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Trending Now */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What Everyone Is Buying
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              Trending Products
            </h2>
          </div>
          <Link to="/shop?trending=true" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>
            <span>Explore All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
