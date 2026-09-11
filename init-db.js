const fs = require('fs');

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

async function init() {
  if (tursoUrl && tursoToken) {
    console.log("Using Turso Database for Initialization");
    const { createClient } = require('@libsql/client');
    const client = createClient({ url: tursoUrl, authToken: tursoToken });
    
    try {
      const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Employees'");
      if (result.rows.length === 0) {
        console.log("Initializing database from schema.sql...");
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        
        // Split and run
        const queries = schema.split(';').filter(q => q.trim().length > 0);
        for (let q of queries) {
          await client.execute(q);
        }
        
        await client.execute("CREATE TABLE IF NOT EXISTS Discounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100), type VARCHAR(50), value DECIMAL(10,2), threshold DECIMAL(10,2), active BOOLEAN DEFAULT 1, product_id VARCHAR(100))");
        await client.execute("INSERT INTO Employees (id, name, role, password) VALUES ('admin', 'System Admin', 'Admin', 'equinox@123')");
        await client.execute("INSERT OR IGNORE INTO Employees (id, name, role, password) VALUES ('USR-8888', 'Demo Cashier', 'Cashier', 'demo123')");
        
        console.log("Database initialized successfully!");
      } else {
        console.log("Database already initialized.");
      }
    } catch (e) {
      console.error("Error initializing DB:", e);
    }
  } else {
    console.log("Using Local SQLite Database for Initialization");
    const sqlite3 = require('sqlite3');
    const dbPath = process.env.DB_PATH || './pos.db';
    const db = new sqlite3.Database(dbPath);

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Employees'", (err, row) => {
      if (!row) {
        console.log("Initializing database from schema.sql...");
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        
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
  }
}

init();
