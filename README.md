# Equinox POS Dashboard 🛒

A high-performance, real-time Point of Sale (POS) and Inventory Management system. Built with a modern web frontend and an ultra-fast C++ backend for heavy mathematical calculations.

## ✨ Features

- **Next-Gen POS Interface:** Lightning-fast barcode scanning, cart management, and seamless checkout flow.
- **C++ Calculation Engine:** Complex order discounts, tax calculations, and totals are delegated to an optimized C++ binary for zero-latency processing.
- **Admin Command Center:** Real-time dashboard for inventory analytics, stock management, and demand forecasting.
- **Global Discounts & Promotions:** Create complex rules (flat rates, percentages, thresholds, specific item triggers) that instantly reflect at checkout.
- **Role-Based Security:** Strict access separation between Cashiers and Store Admins, guarded by a secure local SQLite database.
- **Offline Capable Database:** Uses a single `pos.db` SQLite file for blazing fast read/writes without relying on external cloud databases.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend (API):** Next.js Serverless Routes
- **Backend (Engine):** C++11 (compiled to standard binary)
- **Database:** SQLite3

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- C++ Compiler (`g++`)
- SQLite

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile the C++ Engine
```bash
cd backend
g++ -O3 -std=c++11 -Iinclude main.cpp -o pos_backend
cd ..
```

### 3. Start the Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## ☁️ Deployment (Docker / Render)

This project includes a `Dockerfile` that automates compiling the C++ binary for Linux and starting the Next.js server. 

To deploy for free on **Render.com**:
1. Push this repository to GitHub (ensure `pos.db` is included so your initial products load).
2. Create a new **Web Service** on Render and connect your repository.
3. Render will automatically detect the `Dockerfile` and build the application.

*Note: On Render's free tier without a persistent disk, the `pos.db` file will reset to the original GitHub snapshot whenever the server sleeps. Attach a persistent volume to preserve data permanently.*

---

## 🔐 Default Credentials

**1. System Admin (Full Configuration)**
- **Employee ID:** `admin`
- **Password:** `equinox@123`

**2. Store Manager (Operations)**
- **Employee ID:** `manager`
- **Password:** `equinox`
*(Log in as an Admin/Manager to add new products, view real-time stock levels, hire/fire employees, and create global store discounts).*

**3. Cashier (POS Checkout Only)**
- **Employee ID:** `USR-8888`
- **Password:** `demo123`
*(Log in as a Cashier to scan items, build a customer cart, and generate a printable receipt).*
