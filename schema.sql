-- Database Schema for Equinox Supermarket (SQLite compatible)

CREATE TABLE IF NOT EXISTS Products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    brand VARCHAR(100),
    batch_no VARCHAR(100),
    expiry_date VARCHAR(100),
    description TEXT,
    image_url TEXT,
    unit VARCHAR(50),
    mrp DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Delivered',
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Line_Items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES Sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS ReturnRequests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    bill_no VARCHAR(100),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    items_summary TEXT,
    reason TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES Sales(id)
);

CREATE TABLE IF NOT EXISTS Discounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100),
    type VARCHAR(50),
    value DECIMAL(10, 2),
    threshold DECIMAL(10, 2),
    active BOOLEAN DEFAULT 1,
    product_id VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    id_type VARCHAR(50),
    govt_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
