const sqlite3 = require('sqlite3');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './pos.db';
const db = new sqlite3.Database(dbPath);

console.log("Checking database schema & tables in " + dbPath + "...");

db.serialize(() => {
  if (fs.existsSync('./schema.sql')) {
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error("Schema execution notice:", err.message);
    });
  }

  // Ensure default demo user exists
  db.run(`
    INSERT OR IGNORE INTO Users (name, email, mobile, password, role, address)
    VALUES ('Demo Shopper', 'user@equinox.com', '9876543210', 'user123', 'user', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103')
  `);

  // Ensure admin user exists
  db.run(`
    INSERT OR IGNORE INTO Users (name, email, mobile, password, role, address)
    VALUES ('System Admin', 'admin@equinox.com', 'admin', 'equinox@123', 'Admin', 'Equinox Supermarket HQ')
  `);

  db.run(`
    INSERT OR IGNORE INTO Employees (id, name, role, password)
    VALUES ('admin', 'System Admin', 'Admin', 'equinox@123')
  `);

  console.log("Database initialized & ready.");
  try {
    require('./scripts/seed-data.js');
  } catch (e) {
    console.error("Seed notice:", e.message);
  }
});

db.close();
