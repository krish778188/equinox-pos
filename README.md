# Equinox Supermarket & E-Commerce Platform 🛒

A modern, full-stack supermarket e-commerce web application and retail inventory management system. Built with **Next.js (React)**, **Tailwind CSS**, an **offline-capable SQLite** database, and a high-performance **C++ Object-Oriented Programming (OOP) calculation engine** for zero-latency checkout processing.

---

## 🏬 The Supermarket Model

Equinox is engineered around a modern grocery supermarket experience divided into two distinct portals:

### 1. 🛍️ Customer Supermarket Storefront (`/`)
- **Product Catalog**: 36+ everyday supermarket items across 7 departments:
  - 🥦🍎 **Vegetables and Fruits** *(Tomatoes, Onions, Potatoes, Apples, Bananas, Spinach)*
  - 🌾 **Grocery & Staples** *(Basmati Rice, Whole Wheat Sourdough Bread, Farm Brown Eggs, Extra Virgin Olive Oil, Sea Salt, Raw Honey)*
  - 🧼 **Household & Cleaning** *(Dettol Surface Cleaner Spray, Clorox Bleach Spray, Lavender Essential Oil, Scented Candle)*
  - 🧴 **Beauty & Personal Care** *(Herbal Soap Bar, Bamboo Shampoo, Bamboo Toothbrush Set, Gentle Face Cleanser, Daily Skincare Hydration Set)*
  - ☕ **Snacks & Drinks** *(Savory Ramen Noodles, Green & Herbal Tea Bags, Chocolate Chip Cookies, Potato Chips, Coca-Cola Can, Fresh Squeezed Orange Juice)*
  - 🏃 **Lifestyle & Wellness** *(Insulated Stainless Bottle, Morning Roast Coffee, Multivitamins, Memory Sleeping Pillow)*
  - 🍳 **Kitchen & Home** *(Cast Iron Dutch Oven, Ceramic Coffee Mug, Chef Knife Set, Kitchen Scissors, Canvas Tote Bag, Ergonomic Chair)*
- **Smart Cart Drawer**: Live slide-out cart with instant quantity adjustment, item deletion, delivery address switcher, and order breakdown.
- **Dynamic Checkout**: Supports Cash on Delivery (COD) and merchant UPI (`krishraj453@okicici`) with mandatory 12-digit UPI Reference / UTR ID verification.
- **Customer Account Management**: Self-service profile modal to update delivery address, mobile number, and change account passwords.
- **Live Order History & Delivery Tracking**: Customers track past orders with live status badges (*Order Placed*, *Packed*, *Dispatched*, *Delivered*), and can print thermal supermarket receipts.
- **7-Day Customer Return System**:
  - Customers can initiate return requests directly on any delivered order within 7 days.
  - Interactive selection of items, quantities, return reasons, and photo proofs.
  - Upon admin approval, customers receive an automated refund voucher code (`RET-XXXXXX`) that automatically discounts their next grocery order.

### 2. 📊 Store Admin Command Center
- **Executive Revenue Metrics**: Real-time sales revenue, active order counts, total catalog products, and pending returns.
- **Order Pipeline & Dispatch Desk**: Track incoming customer orders and advance fulfillment status (*Order Placed* → *Packed* → *Dispatched* → *Delivered*).
- **Return Requests Review Desk**: Review customer return claims, inspect reasons and photos, and issue 1-click approvals with auto-generated refund coupons.
- **Inventory & Expiry Control**: Monitor live stock quantities, low-stock alerts, batch numbers, and dynamic shelf-life expiry dates.
- **Promotions & Discount Engine**: Create active supermarket discount campaigns (percentage discounts, minimum order threshold discounts, or item-specific deals).

---

## ⚙️ C++ OOP Calculation Engine

All cart mathematics (subtotals, category taxation, and promotional discounts) are processed by an optimized C++ Object-Oriented binary (`backend/pos_backend`):

```
       [ Next.js API Route (/api/checkout) ]
                         │  (JSON Cart Payload via stdin)
                         ▼
             [ C++ OOP Engine (pos_backend) ]
       ┌─────────────────┴──────────────────┐
       ▼                                    ▼
[ Perishable : Product ]         [ Electronic : Product ]
(2% Food & Grocery Tax)          (10% Electronics Tax)
       └─────────────────┬──────────────────┘
                         │  (Polymorphic calculateTax() & Discount rules)
                         ▼
       [ Receipt JSON Streamed to stdout ]
```

- **Polymorphism**: `Perishable` and `Electronic` subclasses inherit from the abstract base `Product` class, dynamically calculating category-specific tax.
- **Smart Pointers**: Memory-safe execution using `std::unique_ptr<Product>` in polymorphic vector containers.
- **Resilient Fallback**: Next.js automatically falls back to an internal calculation runner if the binary is absent.

---

## 🗄️ Database Architecture (`pos.db`)

The application runs on a local SQLite3 database with automatic migrations:

- `Users`: Customer shopper accounts and store admin credentials with addresses and mobile numbers.
- `Products`: 36 verified supermarket products with categories, units, prices, MRPs, batch numbers, expiry dates, and high-resolution Unsplash images.
- `Sales`: Customer supermarket orders with delivery addresses, payment methods, UPI reference numbers, and delivery statuses.
- `Line_Items`: Order line items referencing purchased product IDs and quantities.
- `Return_Requests`: Customer return claims with reason, items list, and admin review statuses (`Pending`, `Approved`, `Rejected`).
- `Discounts`: Active promotional discount codes and auto-generated return refund vouchers (`RET-*`).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **C++ Compiler** (`g++` or `clang++` supporting C++11)
- **npm**

### 2. Installation
```bash
git clone https://github.com/krish778188/equinox-pos.git
cd equinox-pos/pos-inventory-dashboard
npm install
```

### 3. Compile the C++ Engine
```bash
cd backend
g++ -O3 -std=c++11 -Iinclude main.cpp -o pos_backend
cd ..
```

### 4. Seed Database
```bash
node init-db.js
```
*(Seeds the 36 verified supermarket items, demo shopper profile, order history, and default credentials).*

### 5. Launch the Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Credentials

| Role | Email / Identifier | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Demo Customer** | `user@equinox.com` | `user123` | Supermarket storefront browsing, cart, checkout, profile/password management, order tracking, and 7-day return requests. |
| **Store Admin** | `admin@equinox.com` | `equinox@123` | Store administration portal, inventory management, order fulfillment pipeline, return approvals, and discount rules. |

---

## ☁️ Deployment (Render / Docker)

The included `Dockerfile` builds a production Debian container that compiles the C++ engine with `g++` and packages the Next.js standalone server for zero-config deployment on **Render.com**.

---

## 📄 License
MIT License. Open source and free to use.
