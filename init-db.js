const sqlite3 = require('sqlite3');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './pos.db';

const db = new sqlite3.Database(dbPath);

db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Employees'", (err, row) => {
  if (!row) {
    console.log("Initializing database from schema.sql...");
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    
    // Split by semicolons and execute, plus add the Discounts table
    db.exec(schema + "\nCREATE TABLE IF NOT EXISTS Discounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100), type VARCHAR(50), value DECIMAL(10,2), threshold DECIMAL(10,2), active BOOLEAN DEFAULT 1, product_id VARCHAR(100));\nINSERT INTO Employees (id, name, role, password) VALUES ('admin', 'System Admin', 'Admin', 'equinox@123');\nINSERT OR IGNORE INTO Employees (id, name, role, password) VALUES ('USR-8888', 'Demo Cashier', 'Cashier', 'demo123');", (err) => {
      if (err) console.error("Error initializing DB:", err);
      else console.log("Database initialized successfully!");
      db.close();
    });
  } else {
    console.log("Database already initialized.");
    db.close();
  }
});
