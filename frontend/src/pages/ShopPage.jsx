import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Search,
  Star,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  PackageOpen,
} from "lucide-react";
import { productAPI } from "../services/api";
import ProductCard from "../components/common/ProductCard";
import { ProductGridSkeleton } from "../components/common/LoadingSkeleton";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "all",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true",
  );
  const [isDealsOnly, setIsDealsOnly] = useState(
    searchParams.get("deals") === "true",
  );
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(
    searchParams.get("featured") === "true",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "popularity",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  // Data states
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 12,
  });
  const [meta, setMeta] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 150000 },
  });
  const navbarCategories = [
    { id: "electronics", slug: "electronics", name: "Electronics" },
    { id: "fashion", slug: "fashion", name: "Fashion" },
    { id: "beauty", slug: "beauty", name: "Beauty" },
    { id: "home-living", slug: "home-living", name: "Home & Living" },
  ];

  const categoryOptions = [
    ...meta.categories,
    ...navbarCategories.filter(
      (navCategory) =>
        !meta.categories.some((category) => category.slug === navCategory.slug),
    ),
  ];

  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params when URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setSelectedBrand(searchParams.get("brand") || "all");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setMinRating(searchParams.get("rating") || "");
    setInStockOnly(searchParams.get("inStock") === "true");
    setIsDealsOnly(searchParams.get("deals") === "true");
    setIsFeaturedOnly(searchParams.get("featured") === "true");
    setSortBy(searchParams.get("sort") || "popularity");
    setCurrentPage(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  // Load filter metadata once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await productAPI.getFilterMeta();
        if (res.data.success) {
          setMeta(res.data);
        }
      } catch (err) {
        console.error("Failed to load filter metadata:", err.message);
      }
    };
    fetchMeta();
  }, []);

  // Fetch products based on active filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortBy,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== "all")
        params.category = selectedCategory;
      if (selectedBrand && selectedBrand !== "all")
        params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.rating = minRating;
      if (inStockOnly) params.inStock = "true";
      if (isDealsOnly) params.deals = "true";
      if (isFeaturedOnly) params.featured = "true";

      const res = await productAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            totalPages: 1,
            page: 1,
            limit: 12,
          },
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    sortBy,
    searchQuery,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isDealsOnly,
    isFeaturedOnly,
  ]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  // Update URL search parameters
  const applyFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery.trim()) newParams.set("search", searchQuery.trim());
    if (selectedCategory && selectedCategory !== "all")
      newParams.set("category", selectedCategory);
    if (selectedBrand && selectedBrand !== "all")
      newParams.set("brand", selectedBrand);
    if (minPrice) newParams.set("minPrice", minPrice);
    if (maxPrice) newParams.set("maxPrice", maxPrice);
    if (minRating) newParams.set("rating", minRating);
    if (inStockOnly) newParams.set("inStock", "true");
    if (isDealsOnly) newParams.set("deals", "true");
    if (isFeaturedOnly) newParams.set("featured", "true");
    if (sortBy && sortBy !== "popularity") newParams.set("sort", sortBy);
    newParams.set("page", "1");

    setSearchParams(newParams);
    setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setInStockOnly(false);
    setIsDealsOnly(false);
    setIsFeaturedOnly(false);
    setSortBy("popularity");
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
  };

  const filterSidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header & Clear */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 800,
            fontSize: "1.1rem",
          }}
        >
          <Filter size={18} color="var(--accent)" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleClearFilters}
          style={{
            fontSize: "0.8rem",
            color: "var(--accent)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <RotateCcw size={13} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "var(--text-main)",
          }}
        >
          Category
        </h4>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            maxHeight: "180px",
            overflowY: "auto",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="category"
              checked={selectedCategory === "all"}
              onChange={() => setSelectedCategory("all")}
            />
            <span>All Categories</span>
          </label>
          {categoryOptions.map((c) => (
            <label
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === c.slug}
                onChange={() => setSelectedCategory(c.slug)}
              />
              <span style={{ flex: 1 }}>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      {meta.brands.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.25rem",
          }}
        >
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "var(--text-main)",
            }}
          >
            Brand
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              maxHeight: "160px",
              overflowY: "auto",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === "all"}
                onChange={() => setSelectedBrand("all")}
              />
              <span>All Brands</span>
            </label>
            {meta.brands.map((b) => (
              <label
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === b}
                  onChange={() => setSelectedBrand(b)}
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div
        style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}
      >
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "var(--text-main)",
          }}
        >
          Price Range (₹)
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Min
            </label>
            <input
              type="number"
              placeholder="₹ 0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="form-input"
              style={{ padding: "0.45rem 0.6rem", fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Max
            </label>
            <input
              type="number"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="form-input"
              style={{ padding: "0.45rem 0.6rem", fontSize: "0.85rem" }}
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div
        style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}
      >
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "var(--text-main)",
          }}
        >
          Customer Rating
        </h4>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
        >
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === String(stars)}
                onChange={() => setMinRating(String(stars))}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
              >
                <span style={{ fontWeight: 600 }}>{stars}★</span>
                <span>& above</span>
              </div>
            </label>
          ))}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="rating"
              checked={minRating === ""}
              onChange={() => setMinRating("")}
            />
            <span>All Ratings</span>
          </label>
        </div>
      </div>

      {/* Availability & Deals */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            color: "var(--text-main)",
          }}
        >
          Special Filters
        </h4>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isDealsOnly}
            onChange={(e) => setIsDealsOnly(e.target.checked)}
          />
          <span style={{ color: "var(--deal-badge)", fontWeight: 600 }}>
            Flash Deals Only 🔥
          </span>
        </label>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "0.5rem" }}
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="container" style={{ padding: "2rem 1.25rem" }}>
      {/* Top Search & Filter Control Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "2rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "var(--text-main)",
            }}
          >
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Browse Catalog"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Showing <strong>{pagination.total}</strong> products
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-outline shop-mobile-filter-btn"
            style={{ display: "none" }}
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
          </button>

          {/* Sort Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const p = new URLSearchParams(searchParams);
                p.set("sort", e.target.value);
                p.set("page", "1");
                setSearchParams(p);
              }}
              className="form-select"
              style={{
                padding: "0.5rem 0.85rem",
                fontSize: "0.875rem",
                width: "auto",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "270px 1fr",
          gap: "2.5rem",
          alignItems: "start",
        }}
        className="shop-layout-grid"
      >
        {/* Desktop Sidebar */}
        <aside
          className="card shop-desktop-sidebar"
          style={{ padding: "1.5rem", position: "sticky", top: "100px" }}
        >
          {filterSidebarContent}
        </aside>

        {/* Product Grid Area */}
        <div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div
              className="card"
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-subtle)",
                  color: "var(--text-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PackageOpen size={36} />
              </div>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                No Products Found
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  maxWidth: "420px",
                  fontSize: "0.925rem",
                }}
              >
                We couldn't find any products matching your specific search or
                filters. Try adjusting your criteria or reset all filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn btn-primary"
                style={{ marginTop: "0.5rem" }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    marginTop: "3.5rem",
                    paddingTop: "2rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="btn btn-outline btn-sm"
                    style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`btn btn-sm ${currentPage === p ? "btn-primary" : "btn-outline"}`}
                      style={{ width: "38px", height: "38px", padding: 0 }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="btn btn-outline btn-sm"
                    style={{
                      opacity: currentPage >= pagination.totalPages ? 0.5 : 1,
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal Drawer */}
      {mobileFilterOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            style={{
              width: "85%",
              maxWidth: "340px",
              height: "100%",
              backgroundColor: "#ffffff",
              position: "relative",
              zIndex: 201,
              padding: "1.5rem",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{ color: "var(--text-muted)" }}
              >
                <X size={22} />
              </button>
            </div>
            {filterSidebarContent}
          </div>
        </div>
      )}

      {/* Responsive Media Query Styles */}
      <style>{`
        @media (max-width: 900px) {
          .shop-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .shop-desktop-sidebar {
            display: none !important;
          }
          .shop-mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShopPage;
