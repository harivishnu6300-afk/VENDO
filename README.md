# VENDO — Production Full-Stack E-Commerce Platform

> **"Shop Smart. Live Better."**

VENDO is a modern, production-grade full-stack e-commerce web application engineered with a **React + Vite** frontend, a high-performance **Node.js + Express** REST backend, and a relational **MySQL** database with parameterized queries and transactional integrity.

---

## 🌟 Key Features

### 🛍️ Storefront Experience
- **Responsive Modern UI**: Built with a sleek design system featuring rounded geometry, soft shadows, hover transitions, and zero horizontal overflow across mobile, tablet, and desktop.
- **Dynamic Homepage**:
  - Promotional hero banner with dual call-to-actions.
  - Department showcases across 6 core categories.
  - Flash Deals section with live real-time countdown timer.
  - Curated Featured, Trending, and New Arrival collections.
  - Trust indicators (Free Shipping on ₹999+, 7-day returns, secure checkout).
- **Advanced Shop & Catalog Search**:
  - Full-text search matching product names, brands, descriptions, and categories.
  - Multi-attribute filtering: Category, Brand, Price Range, Minimum Rating, and Stock availability.
  - Sort by: Price (Low to High / High to Low), Newest Arrivals, Customer Rating, and Popularity.
  - Pagination, loading skeletons, and interactive filter chips.
- **Comprehensive Product Details**:
  - Multi-image zoom gallery with thumbnail switching.
  - Live stock indicators with low-stock warnings.
  - Quantity selectors with inventory threshold bounds.
  - Technical specifications table.
  - Customer review breakdown and verified purchaser review submission form.
  - Related product recommendations.
- **Database-Backed Shopping Cart**:
  - Real-time stock verification to prevent ordering beyond available units.
  - Quantity steppers with instant subtotal and tax calculation.
  - Free shipping progress indicator (₹999 threshold).
  - Promotional coupon engine (`VENDO10`, `SAVE20`, `WELCOME500`).
- **Multi-Step Checkout & Orders**:
  - Address book management with default address support.
  - Multiple payment methods: Cash on Delivery (COD), Instant UPI simulation, and Credit/Debit Card sandbox.
  - Atomic MySQL transactions ensuring stock reduction and cart clearing on checkout.
  - Generation of unique order identifiers (e.g., `VND-100001`).
  - Visual order timeline progression: `Pending` → `Confirmed` → `Packed` → `Shipped` → `Delivered`.
- **Persistent Wishlist**:
  - MySQL-backed wishlist storage per user with one-click transfer to cart.
- **Customer Account Dashboard**:
  - Personal profile management (Name, Phone).
  - Saved address book with add/delete controls.
  - Password updating with bcrypt re-hashing.

---

### 🛡️ Administrative Portal
- **Role-Based Authorization**:
  - Admin middleware shielding administrative routes and REST endpoints (`requireAdmin`).
- **Executive Analytics Dashboard**:
  - KPIs: Total Gross Revenue (₹), Total Orders, Catalog Size, Customer Accounts, Pending Dispatches, and Low Stock Alerts.
  - Revenue trends and daily volume charts.
  - Department distribution analytics.
- **Catalog & Inventory Management**:
  - Add, edit, and delete products.
  - Set selling prices, original prices, automatic discount calculation, and stock counts.
  - Flag products as Featured, Trending, or Flash Deals.
- **Category Taxonomy Management**:
  - Create and edit department categories with cover imagery.
  - Safety constraints preventing deletion of categories containing active products.
- **Order Fulfillment & Logistics**:
  - Filter orders by status and search by customer name, email, or order number.
  - Interactive status dropdown directly synchronizing updates to the customer's live order page.
  - Automatic inventory restocking when an order is cancelled.
- **User Directory**:
  - View all registered customers, order counts, and lifetime spend.
  - One-click account activation / deactivation.
- **Promotional Coupon Manager**:
  - Create percentage-off or flat-discount voucher codes with minimum order limits and expiry dates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Lucide React, Custom CSS Design System |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`), CORS, Dotenv |
| **Database** | MySQL 8.0+, `mysql2/promise` Connection Pooling, Parameterized Queries, Relational Schema |
| **Currency** | Indian Rupee (`₹` INR) formatting across all financial records |

---

## 📂 Project Structure

```
VENDO/
├── frontend/                     # React Vite Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, ProductCard, LoadingSkeleton, Modal
│   │   │   └── admin/            # AdminSidebar, AdminHeader
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── ProductDetailsPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetailsPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── admin/            # AdminDashboard, Products, Categories, Orders, Users, Coupons
│   │   ├── layouts/              # MainLayout, AdminLayout
│   │   ├── services/             # api.js (Axios Client & Endpoints)
│   │   ├── context/              # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── index.css             # Unified VENDO Design System
│   │   ├── App.jsx               # Router Configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                      # VITE_API_URL
│   └── .env.example
│
├── backend/                      # Express.js REST API
│   ├── config/
│   │   └── db.js                 # MySQL2 Promise Connection Pool
│   ├── controllers/              # auth, product, category, cart, wishlist, order, admin, review, address, coupon
│   ├── middleware/               # JWT auth, requireAdmin, centralized errorHandler
│   ├── routes/                   # auth, product, category, cart, wishlist, order, admin, address, coupon
│   ├── services/
│   │   └── seed.js               # Database population service
│   ├── server.js                 # Express Application Entry
│   ├── package.json
│   ├── .env                      # Database & JWT configuration
│   └── .env.example
│
└── database/
    └── schema.sql                # Complete relational schema (14 tables)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** v18+ or v20+
- **MySQL Server** 8.0+ running on `localhost:3306`

---

### Step 1: Database Setup
1. Ensure your MySQL server is running.
2. Execute the schema file located in `database/schema.sql`:

```bash
# Using MySQL CLI
mysql -u root -p < database/schema.sql
```

*(Or open MySQL Workbench / phpMyAdmin and run the contents of `database/schema.sql`)*.

---

### Step 2: Backend Configuration & Seeding
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env` (refer to `.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=vendo
   JWT_SECRET=vendo_production_secret_key_2026
   ```

3. Seed the database with 24 realistic products, categories, coupons, and test accounts:
   ```bash
   npm run seed
   ```

4. Start the backend REST server:
   ```bash
   npm start
   # Server will run at http://localhost:5000
   ```

---

### Step 3: Frontend Configuration & Run
1. In a new terminal window, navigate to the `frontend/` folder:
   ```bash
   cd frontend
   npm install
   ```

2. Verify or create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Storefront will run at http://localhost:5173
   ```

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@vendo.com` | `Admin@123` | Full Store + Admin Suite (`/admin`) |
| **Customer** | `customer@vendo.com` | `Customer@123` | Storefront, Wishlist, Cart, Orders |

> **Pro-Tip**: The login page features instant **Customer Demo** and **Admin Demo** autofill buttons for rapid testing.

---

## 🎟️ Active Demo Promotional Coupons

- `VENDO10` — 10% Discount on orders over ₹999 (Max cap: ₹2,500)
- `SAVE20` — 20% Discount on orders over ₹4,999 (Max cap: ₹5,000)
- `WELCOME500` — ₹500 Flat Off on orders over ₹1,999

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve logged-in user profile
- `PUT /api/auth/profile` — Update name or phone number
- `PUT /api/auth/change-password` — Change account password

### Catalog & Products
- `GET /api/products` — Multi-filtered catalog search & pagination
- `GET /api/products/filters/meta` — Filter metadata (categories, brands, price boundaries)
- `GET /api/products/:id` — Detailed product view with reviews and related items
- `POST /api/products` — Admin create product
- `PUT /api/products/:id` — Admin update product details/pricing/stock
- `DELETE /api/products/:id` — Admin delete product
- `GET /api/products/:id/reviews` — Fetch product reviews
- `POST /api/products/:id/reviews` — Submit verified customer review

### Shopping Cart & Wishlist
- `GET /api/cart` — Retrieve user's cart and calculated totals
- `POST /api/cart` — Add product to cart with inventory check
- `PUT /api/cart/:itemId` — Update quantity with stock ceiling
- `DELETE /api/cart/:itemId` — Remove item from cart
- `DELETE /api/cart` — Clear all items
- `GET /api/wishlist` — View wishlist items
- `POST /api/wishlist` — Toggle item in wishlist
- `POST /api/wishlist/:id/move-to-cart` — Transfer item directly to cart

### Orders & Checkout
- `POST /api/orders` — Place order with address, coupon, and atomic stock reduction
- `GET /api/orders` — Customer order history
- `GET /api/orders/:id` — Detailed order view with live status tracking

### Administrator
- `GET /api/admin/dashboard` — Analytics, sales figures, and inventory alerts
- `GET /api/admin/orders` — Master order list with status filtering
- `PUT /api/admin/orders/:id/status` — Advance or cancel order status
- `GET /api/admin/users` — Customer directory and spend volume
- `PUT /api/admin/users/:id/status` — Toggle user activation status
- `GET /api/admin/coupons` — List promo codes
- `POST /api/admin/coupons` — Issue new promo voucher
- `DELETE /api/admin/coupons/:id` — Revoke coupon

---

## 🛡️ Security Features
- **Parameterized SQL Queries**: All database operations utilize prepared statements via `mysql2/promise` to eliminate SQL injection vulnerabilities.
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (10 rounds); passwords are never stored or exposed in plaintext.
- **Stateless Authorization**: JSON Web Tokens (JWT) verified on protected customer and admin endpoints.
- **Atomic Checkout Transactions**: Rollback mechanisms ensure product stock and payment logs maintain consistency even during race conditions.
- **Payment Sandbox**: Safe checkout flow simulating UPI, Card, and COD without capturing real sensitive financial data.

---

## 🤝 Support & License

Created for **VENDO Technologies Pvt Ltd**.
All rights reserved © 2026.
