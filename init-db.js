const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

async function initDb(customDbPath = null) {
  const dbPath = customDbPath || process.env.DB_PATH || path.resolve(process.cwd(), 'pos.db');
  console.log("Checking database schema & tables in " + dbPath + "...");

  const db = new sqlite3.Database(dbPath);

  const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

  const execAsync = (sql) => new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await execAsync(schema);
  }

  // Safe schema migrations for existing SQLite databases
  await runAsync("ALTER TABLE Sales ADD COLUMN payment_method VARCHAR(100) DEFAULT 'UPI (krishraj453@okicici)'").catch(() => {});
  await runAsync("ALTER TABLE Sales ADD COLUMN payment_id VARCHAR(100)").catch(() => {});
  await runAsync("ALTER TABLE Sales ADD COLUMN upi_ref_id VARCHAR(100)").catch(() => {});

  // Ensure default demo user exists
  await runAsync(`
    INSERT OR IGNORE INTO Users (name, email, mobile, password, role, address)
    VALUES ('Demo Shopper', 'user@equinox.com', '9876543210', 'user123', 'user', 'IIIT Nagpur, waranga, Nagpur-441108')
  `);
  await runAsync(`UPDATE Users SET address = 'IIIT Nagpur, waranga, Nagpur-441108' WHERE email = 'user@equinox.com'`).catch(() => {});
  await runAsync(`UPDATE Sales SET delivery_address = 'IIIT Nagpur, waranga, Nagpur-441108' WHERE customer_email = 'user@equinox.com'`).catch(() => {});

  // Ensure admin user exists
  await runAsync(`
    INSERT OR IGNORE INTO Users (name, email, mobile, password, role, address)
    VALUES ('System Admin', 'admin@equinox.com', 'admin', 'equinox@123', 'Admin', 'Equinox Supermarket HQ')
  `);

  await runAsync(`
    INSERT OR IGNORE INTO Employees (id, name, role, password)
    VALUES ('admin', 'System Admin', 'Admin', 'equinox@123')
  `);

  // Run full seed data (products, orders, return requests)
  const seed = require('./scripts/seed-data.js');
  await seed.run(db);

  console.log("Database initialized & ready.");
  db.close();
}

if (require.main === module) {
  initDb().catch((err) => {
    console.error("Init-db error:", err);
    process.exit(1);
  });
}

module.exports = { initDb };
