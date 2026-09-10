# Equinox POS Dashboard 🛒

A high-performance, real-time Point of Sale (POS) and Inventory Management system. Built with a modern web frontend and an ultra-fast C++ backend for heavy mathematical calculations.

### 🔴 Test it Live: [Click here to view the Live Demo](https://equinox-pos.onrender.com)

---

## ✨ Features

- **Next-Gen POS Interface:** Lightning-fast barcode scanning, cart management, and seamless checkout flow.
- **C++ Calculation Engine:** Complex order discounts, tax calculations, and totals are delegated to an optimized C++ binary for zero-latency processing.
- **Admin Command Center:** Real-time dashboard for inventory analytics, stock management, and demand forecasting.
- **Global Discounts & Promotions:** Create complex rules (flat rates, percentages, thresholds, specific item triggers) that instantly reflect at checkout.
- **Role-Based Security:** Strict access separation between Cashiers and Store Admins, guarded by a secure local SQLite database.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend (API):** Next.js Serverless Routes
- **Backend (Engine):** C++11 
- **Database:** SQLite3

---

## 🔐 How to Test the Live Demo

To test out the different features of the application, you can log into the live website using either of these default roles:

**1. Store Admin (Full Access & Dashboard)**
- **Employee ID:** `admin`
- **Password:** `equinox@123`
*(Log in as an Admin to add new products, view real-time stock levels, hire/fire employees, and create global store discounts).*

**2. Cashier (POS Checkout Only)**
- **Employee ID:** `USR-8888`
- **Password:** `demo123`
*(Log in as a Cashier to scan items, build a customer cart, and generate a printable receipt).*
