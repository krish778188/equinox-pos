const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

async function run(existingDb = null) {
  const db = existingDb || new sqlite3.Database(process.env.DB_PATH || path.resolve(process.cwd(), 'pos.db'));
  const shouldClose = !existingDb;

  console.log("Seeding verified products and order history into pos.db...");

  const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

  const BASELINE_DATE = new Date("2026-10-15T00:00:00.000Z");
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function getDynamicExpiryDate(originalStr, currentDate = new Date()) {
    if (!originalStr || originalStr === "N/A" || originalStr.trim() === "") return "N/A";
    const parts = originalStr.trim().split(/\s+/);
    let origDate = null;
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = MONTH_NAMES.indexOf(parts[1]);
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== -1 && !isNaN(year)) {
        origDate = new Date(Date.UTC(year, month, day));
      }
    }
    if (!origDate) {
      origDate = new Date(originalStr);
    }
    if (isNaN(origDate.getTime())) return originalStr;

    const diffMs = origDate.getTime() - BASELINE_DATE.getTime();
    const targetDate = new Date(currentDate.getTime() + diffMs);
    const d = targetDate.getUTCDate().toString().padStart(2, "0");
    const m = MONTH_NAMES[targetDate.getUTCMonth()];
    const y = targetDate.getUTCFullYear();
    return `${d} ${m} ${y}`;
  }

  // 1. Seed all 41 verified products from products-data.json
  const productsFilePath = path.join(__dirname, 'products-data.json');
  if (fs.existsSync(productsFilePath)) {
    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
    const now = new Date();
    for (const p of products) {
      const dynamicExpiry = getDynamicExpiryDate(p.expiry_date, now);
      await runAsync(`
        INSERT INTO Products (id, name, category, price, stock, brand, batch_no, expiry_date, description, image_url, unit, mrp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, category=excluded.category, price=excluded.price,
          stock=excluded.stock, brand=excluded.brand, batch_no=excluded.batch_no,
          expiry_date=excluded.expiry_date, description=excluded.description,
          image_url=excluded.image_url, unit=excluded.unit, mrp=excluded.mrp
      `, [p.id, p.name, p.category, p.price, p.stock, p.brand, p.batch_no, dynamicExpiry, p.description, p.image_url, p.unit, p.mrp]);
    }
    console.log(`Loaded ${products.length} catalog products with dynamic expiry dates.`);
  }

  // 2. Seed default order history for Demo Shopper (user@equinox.com)
  const now = new Date();
  const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const d4 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const d28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

  // Clean old sample user orders and defunct POS sales
  await runAsync(`DELETE FROM Line_Items WHERE sale_id IN (SELECT id FROM Sales WHERE customer_name IS NULL OR customer_name = 'qwe' OR id <= 6)`);
  await runAsync(`DELETE FROM Sales WHERE customer_name IS NULL OR customer_name = 'qwe' OR id <= 6`);
  await runAsync(`DELETE FROM Sales WHERE customer_email = 'user@equinox.com'`);

  // Order 1: 2 days ago (STATUS: Order Placed - ready for admin to mark Delivered!)
  const o1 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (585.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Order Placed', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', 'UPI (krishraj453@okicici)', 'UPI-TXN-984210928341', ?)
  `, [d2]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-01', 1)`, [o1.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-03', 1)`, [o1.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-veg-02', 2)`, [o1.lastID]);

  // Order 2: 4 days ago (ELIGIBLE: ~3 days remaining)
  const o2 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (560.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', 'UPI (krishraj453@okicici)', 'UPI-TXN-874102948192', ?)
  `, [d4]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-bty-02', 1)`, [o2.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-01', 1)`, [o2.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-06', 1)`, [o2.lastID]);

  // Order 3: 7 days ago (REFUNDED)
  const o3 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (490.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Refunded', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', 'UPI (krishraj453@okicici)', 'UPI-TXN-763192847102', ?)
  `, [d7]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-lfs-03', 1)`, [o3.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-stn-01', 2)`, [o3.lastID]);

  // Order 4: 14 days ago (EXPIRED - NOT ELIGIBLE)
  const o4 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (445.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', 'Cash on Delivery', 'COD-PAY-49102834', ?)
  `, [d14]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-02', 1)`, [o4.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-04', 1)`, [o4.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-05', 1)`, [o4.lastID]);

  // Order 5: 28 days ago (EXPIRED - NOT ELIGIBLE)
  const o5 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (1085.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', 'Cash on Delivery', 'COD-PAY-28491029', ?)
  `, [d28]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-hsd-01', 1)`, [o5.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-hsd-02', 1)`, [o5.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-lfs-01', 1)`, [o5.lastID]);

  // 3. Seed default return requests for admin portal
  await runAsync(`DELETE FROM ReturnRequests`);

  // Request 1: Pending request on Order 2
  await runAsync(`
    INSERT INTO ReturnRequests (sale_id, bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status, created_at)
    VALUES (?, ?, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Dove Intense Repair Shampoo (340ml)', 'Damaged bottle received with minor leakage during transit', 240.00, 'Pending', ?)
  `, [o2.lastID, `INV-${o2.lastID.toString().padStart(5, '0')}`, d4]);
  await runAsync(`UPDATE Sales SET status = 'Return Requested' WHERE id = ?`, [o2.lastID]);

  // Customer 2: Priya Patel (Pending return request)
  await runAsync(`DELETE FROM Sales WHERE customer_email = 'priya@example.com'`);
  const oPriya = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, payment_method, payment_id, created_at)
    VALUES (485.00, 'Priya Patel', '9812345678', 'priya@example.com', 'Return Requested', 'Flat 102, Palm Meadows, Whitefield, Bengaluru - 560066', 'UPI (krishraj453@okicici)', 'UPI-TXN-652019482019', ?)
  `, [d2]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-02', 1)`, [oPriya.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-03', 2)`, [oPriya.lastID]);

  await runAsync(`
    INSERT INTO ReturnRequests (sale_id, bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status, created_at)
    VALUES (?, ?, 'Priya Patel', '9812345678', 'priya@example.com', 'Tata Tea Gold Leaf Blend (500g), Parle-G Biscuits', 'Wrong item variant dispatched by store', 320.00, 'Pending', ?)
  `, [oPriya.lastID, `INV-${oPriya.lastID.toString().padStart(5, '0')}`, d2]);

  // Request 3: Approved return on Order 3 (Refunded)
  await runAsync(`
    INSERT INTO ReturnRequests (sale_id, bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status, created_at, reviewed_at)
    VALUES (?, ?, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Fast&Up Charge Vitamin C + Zinc (20 Tabs)', 'Duplicate order placed by mistake', 490.00, 'Approved', ?, ?)
  `, [o3.lastID, `INV-${o3.lastID.toString().padStart(5, '0')}`, d7, d4]);

  console.log("Seeding completed successfully with default return requests and catalog!");
  if (shouldClose) {
    db.close();
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
}

module.exports = { run };
