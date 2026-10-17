# Equinox Supermarket & Inventory Management System 🛒

A modern, full-stack e-commerce supermarket storefront and store administration command center. Built with a high-performance **Next.js** frontend, an **offline-capable SQLite** database, and an **ultra-fast C++ Object-Oriented Programming (OOP) calculation engine** for zero-latency cart, tax, and discount processing.

---

## 🛍️ Supermarket Model Overview

Equinox is designed as a unified supermarket retail platform with two tightly integrated experiences:

1. **Customer Supermarket Storefront (`/`)**: A seamless, modern grocery shopping interface with instant search, category filtering, cart drawer, UPI/COD checkout, order history, and a self-service 7-day return request workflow.
2. **Store Admin Command Center**: A management portal for real-time inventory monitoring, order status progression, return request approvals with automated refund coupon issuance, and promotional discount campaigns.

---

## 🏗️ Architecture & C++ OOP Backend Engine

The heavy mathematical cart computations are powered by a native **C++ Object-Oriented Programming (OOP) engine**:

- **Abstract Base Class (`Product`)**: Defines core product attributes (`id`, `name`, `price`, `quantity`), pure virtual methods (`virtual double calculateTax() const = 0`), and shared getters (`getSubtotal()`, `getTotal()`).
- **Inheritance & Polymorphism**:
  - `Perishable` class: Derived from `Product`, overrides `calculateTax()` to apply standard 2% grocery/produce tax.
  - `Electronic` class: Derived from `Product`, overrides `calculateTax()` to apply 10% consumer electronics/appliances tax.
- **Smart Pointers & Dynamic Dispatch**: Leverages modern `std::unique_ptr<Product>` in polymorphic `std::vector` containers to evaluate dynamic subtotals, category taxes, and global promo discounts.
- **Micro-Execution via Stdin/Stdout**: Next.js checkout routes (`/api/checkout`) stream JSON cart payloads into the compiled `backend/pos_backend` binary via IPC pipe and ingest structured receipt calculations with sub-millisecond execution times.
- **Zero-Downtime Fallback**: Includes an automatic JS runtime calculation fallback if the C++ binary is not compiled on the host machine.

---

## ✨ Key Features & Capabilities

### 🛒 Customer Supermarket Portal
- **Rich Visual Product Catalog**: 36+ verified supermarket products across 7 categories (*Beauty and Personal Care, Grocery, Household, Lifestyle, Others, Snacks and Drinks, Vegetables*).
- **Instant Search & Category Filtering**: Real-time keyword search, category tabs, stock indicators, and MRP/discount badges.
- **Smart Slide-Over Cart Drawer**: Real-time quantity adjustment, item deletion, subtotal calculations, and delivery address switcher.
- **Profile & Password Management**: Customers can update their delivery address, mobile phone number, and change their account password directly from the user profile modal.
- **Compulsory UPI Payment Flow**: Dynamic UPI payment dialog displaying merchant QR code (`krishraj453@okicici`) with mandatory 12-digit UPI UTR / Reference ID verification. Cash on Delivery (COD) is also supported.
- **Order Tracking & Printable Receipt**: View previous orders, track live status (*Order Placed*, *Packed*, *Dispatched*, *Delivered*), and print or download formatted thermal receipts.
- **7-Days Return & Automated Refund Vouchers**:
  - Delivered orders within 7 days display an interactive **"Return"** button.
  - Customers select returned items, reason, and comments.
  - Once reviewed and approved in the Admin Portal, customers receive a unique instant refund coupon code (e.g. `RET-XXXXXX`) that applies directly at checkout.

### 📊 Admin Command Center
- **Executive Analytics Dashboard**: Real-time Gross Revenue, Active Orders count, Total Products, and Return Requests stats.
- **Stock & Inventory Management**: Live inventory tracking, low-stock warnings, batch numbers, and dynamic expiry dates.
- **Order Fulfillment & Dispatch**: Track all incoming customer orders and progress their delivery status (*Order Placed* → *Packed* → *Dispatched* → *Delivered*).
- **Return Requests Review Desk**: Inspect customer return claims, approve or reject with comments, and automatically generate instant refund promo codes for customers.
- **Promotions & Discount Engine**: Create percentage discounts, flat threshold coupons, or product-specific deals.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS, Lucide Icons |
| **Backend API** | Next.js Serverless API Route Handlers (`app/api/*`) |
| **Computation Engine** | C++11 (Object-Oriented Programming, Polymorphic inheritance, JSON parser) |
| **Database** | SQLite3 (`pos.db`) with dynamic migrations and auto-seeding |
| **Containerization** | Docker multi-stage build (automates `g++` compilation + Node.js runtime) |

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **C++ Compiler** (`g++` or `clang++` supporting C++11)
- **npm** or **yarn**

### 1. Clone & Install
```bash
git clone https://github.com/krish778188/equinox-pos.git
cd equinox-pos/pos-inventory-dashboard
npm install
```

### 2. Compile the C++ Engine
```bash
cd backend
g++ -O3 -std=c++11 -Iinclude main.cpp -o pos_backend
cd ..
```

### 3. Initialize & Seed Database
```bash
node init-db.js
```
*(Seeds the verified 36-item supermarket catalog, demo customer order history, and default credentials).*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment (Docker / Render)

The repository includes a production-ready `Dockerfile` that:
1. Installs GCC/G++ in a Debian builder container.
2. Compiles `backend/main.cpp` into a high-performance Linux binary `pos_backend`.
3. Runs `init-db.js` to ensure the SQLite schema and seed catalog are ready.
4. Generates an optimized Next.js standalone production build.

### Deploying to Render:
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Choose **Web Service** and select **Docker** as the Environment.
3. Render will build the container, compile the C++ binary, and launch the service automatically.

---

## 🔐 Default Credentials

| Portal / Role | Email / Identifier | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Demo Shopper (Customer)** | `user@equinox.com` | `user123` | Full customer supermarket storefront, cart, checkout, profile/password management, live order history & 7-days returns. |
| **Store Admin** | `admin@equinox.com` | `equinox@123` | Full administrative command center, inventory, order processing, return request approvals, discount vouchers. |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
