const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.DB_PATH || './pos.db');

async function run() {
  console.log("Seeding verified products and order history into pos.db...");

  const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

  // 1. Fix broken images
  await runAsync(`UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80' WHERE id = 'sku-bty-01'`);
  await runAsync(`UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80' WHERE id = 'sku-bty-03'`);
  await runAsync(`UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80' WHERE id = 'sku-bty-05'`);

  // 2. Add 'Others' category products with genuine verified photographs
  const newProducts = [
    ['sku-oth-01', 'Stainless Steel Vegetable Peeler', 'Others', 129.00, 40, 'Solimo', 'B-OTH-101', 'N/A', 'Ergonomic stainless steel dual-blade swivel peeler for smooth vegetable and fruit peeling.', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Peeler_01_Pengo.jpg', '1 unit', 199.00],
    ['sku-oth-02', 'Classic Ceramic Coffee Mug (350ml)', 'Others', 179.00, 35, 'ClayCraft', 'B-OTH-102', 'N/A', 'Microwave and dishwasher safe handcrafted matte ceramic mug for coffee, tea and hot beverages.', 'https://upload.wikimedia.org/wikipedia/commons/7/70/Coffee_mugs_cups.jpg', '1 piece', 299.00],
    ['sku-oth-03', 'Automatic Windproof Compact Umbrella', 'Others', 349.00, 25, 'SunGuard', 'B-OTH-103', 'N/A', 'One-touch auto open & close heavy-duty windproof umbrella with reinforced ribs and water-repellent canopy.', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Umbrella.jpg', '1 unit', 499.00],
    ['sku-oth-04', 'Multi-Purpose Stainless Kitchen Scissors', 'Others', 149.00, 30, 'Scotch', 'B-OTH-104', 'N/A', 'Heavy-duty rust-resistant stainless steel household and kitchen shears with comfort-grip handle.', 'https://upload.wikimedia.org/wikipedia/commons/3/30/Scissors_collection.jpg', '1 pair', 220.00],
    ['sku-oth-05', 'Eco-Friendly Canvas Shopping Tote Bag', 'Others', 99.00, 50, 'EcoGreen', 'B-OTH-105', 'N/A', 'Durable reusable heavy-duty natural cotton canvas tote bag with reinforced shoulder straps.', 'https://upload.wikimedia.org/wikipedia/commons/8/89/Totebag.jpg', '1 bag', 150.00],
    ['sku-oth-06', 'Duracell AA Alkaline Batteries (Pack of 4)', 'Others', 160.00, 45, 'Duracell', 'B-OTH-106', 'N/A', 'Long-lasting 1.5V alkaline AA batteries for clocks, remotes, wireless mice, and electronic toys.', 'https://upload.wikimedia.org/wikipedia/commons/4/47/AA_batteries.JPG', 'Pack of 4', 180.00]
  ];

  for (const p of newProducts) {
    await runAsync(`
      INSERT INTO Products (id, name, category, price, stock, brand, batch_no, expiry_date, description, image_url, unit, mrp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, category=excluded.category, price=excluded.price,
        stock=excluded.stock, brand=excluded.brand, batch_no=excluded.batch_no,
        expiry_date=excluded.expiry_date, description=excluded.description,
        image_url=excluded.image_url, unit=excluded.unit, mrp=excluded.mrp
    `, p);
  }

  // 3. Seed default order history for Demo Shopper (user@equinox.com)
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

  // Order 1: 2 days ago (ELIGIBLE: ~5 days remaining)
  const o1 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (585.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', ?)
  `, [d2]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-01', 1)`, [o1.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-03', 1)`, [o1.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-veg-02', 2)`, [o1.lastID]);

  // Order 2: 4 days ago (ELIGIBLE: ~3 days remaining)
  const o2 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (560.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', ?)
  `, [d4]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-bty-02', 1)`, [o2.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-01', 1)`, [o2.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-snk-06', 1)`, [o2.lastID]);

  // Order 3: 7 days ago (REFUNDED)
  const o3 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (490.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Refunded', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', ?)
  `, [d7]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-lfs-03', 1)`, [o3.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-stn-01', 2)`, [o3.lastID]);

  // Order 4: 14 days ago (EXPIRED - NOT ELIGIBLE)
  const o4 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (445.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', ?)
  `, [d14]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-02', 1)`, [o4.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-04', 1)`, [o4.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-gro-05', 1)`, [o4.lastID]);

  // Order 5: 28 days ago (EXPIRED - NOT ELIGIBLE)
  const o5 = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (1085.00, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Delivered', 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103', ?)
  `, [d28]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-hsd-01', 1)`, [o5.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-hsd-02', 1)`, [o5.lastID]);
  await runAsync(`INSERT INTO Line_Items (sale_id, product_id, quantity) VALUES (?, 'sku-lfs-01', 1)`, [o5.lastID]);

  // 4. Seed default return requests for admin portal
  await runAsync(`DELETE FROM ReturnRequests`);

  // Request 1: Pending request on Order 2
  await runAsync(`
    INSERT INTO ReturnRequests (sale_id, bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status, created_at)
    VALUES (?, ?, 'Demo Shopper', '9876543210', 'user@equinox.com', 'Dove Intense Repair Shampoo (340ml)', 'Damaged bottle received with minor leakage during transit', 240.00, 'Pending', ?)
  `, [o2.lastID, `INV-${o2.lastID.toString().padStart(5, '0')}`, d4]);
  await runAsync(`UPDATE Sales SET status = 'Return Requested' WHERE id = ?`, [o2.lastID]);

  // Customer 2: Priya Patel (Pending return request)
  const oPriya = await runAsync(`
    INSERT INTO Sales (total_amount, customer_name, customer_phone, customer_email, status, delivery_address, created_at)
    VALUES (485.00, 'Priya Patel', '9812345678', 'priya@example.com', 'Return Requested', 'Flat 102, Palm Meadows, Whitefield, Bengaluru - 560066', ?)
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
  db.close();
}

run().catch((err) => {
  console.error("Seeding error:", err);
  db.close();
  process.exit(1);
});
