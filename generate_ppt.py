import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    PRIMARY = RGBColor(6, 78, 59)       # Deep Emerald #064E3B
    ACCENT_GREEN = RGBColor(16, 185, 129)# Vibrant Emerald #10B981
    BG_LIGHT = RGBColor(250, 249, 246)   # Off white #FAF9F6
    CARD_BG = RGBColor(255, 255, 255)    # Pure White
    CARD_BORDER = RGBColor(229, 231, 235)# Stone-200
    TEXT_DARK = RGBColor(28, 25, 23)     # Stone-900
    TEXT_MUTED = RGBColor(120, 113, 108) # Stone-500
    TEXT_WHITE = RGBColor(255, 255, 255)
    AMBER_ACCENT = RGBColor(217, 119, 6) # Amber-600

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_LIGHT
        bg.line.color.rgb = BG_LIGHT

    def add_header(slide, title_text, category_text="EQUINOX SUPERMARKET POS SYSTEM"):
        # Category pill / banner
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_GREEN

        # Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK

    def add_card(slide, left, top, width, height, title, items, badge=""):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.5)

        tx_box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tx_box.text_frame
        tf.word_wrap = True

        if badge:
            p_badge = tf.paragraphs[0]
            p_badge.text = badge.upper()
            p_badge.font.size = Pt(9)
            p_badge.font.bold = True
            p_badge.font.color.rgb = ACCENT_GREEN
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_DARK
        p_title.space_after = Pt(10)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"•  {item}"
            p.font.size = Pt(11.5)
            p.font.color.rgb = RGBColor(68, 64, 60) # stone-700
            p.space_after = Pt(6)

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = PRIMARY
    bg1.line.color.rgb = PRIMARY

    tb = slide1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11), Inches(3.8))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "OBJECT-ORIENTED PROGRAMMING CAPSTONE PROJECT"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_GREEN
    p0.space_after = Pt(14)

    p1 = tf.add_paragraph()
    p1.text = "Equinox Supermarket POS & Management System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "High-Performance Next.js Retail Platform Powered by a C++ Polymorphic OOP Billing Engine"
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(209, 250, 229)
    p2.space_after = Pt(28)

    p3 = tf.add_paragraph()
    p3.text = "Architecture: Next.js 16 (React 19) · C++17 OOP Core · nlohmann::json IPC · SQLite Database"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(167, 243, 208)

    # ==========================================
    # SLIDE 2: EXECUTIVE SUMMARY & OVERVIEW
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2)
    add_header(slide2, "Project Overview & Executive Summary")

    add_card(slide2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0), 
             "1. Retail Problem", [
                 "Traditional grocery store POS software is clunky, slow, and decoupled from online consumer storefronts.",
                 "Complex tax legislation (GST) requires category-specific tax computation (groceries vs personal care vs household).",
                 "Return and refund workflows often lack transparency, wallet credit mechanisms, and strict audit logs."
             ], "Problem Statement")

    add_card(slide2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0), 
             "2. The Equinox Solution", [
                 "Full-stack Next.js storefront + POS dashboard running on a unified SQLite database.",
                 "High-speed C++ OOP Calculation Engine executing billing, discounts, and itemized GST taxes.",
                 "Inter-Process Communication (IPC) via standardized JSON streaming for language independence.",
                 "Equinox Wallet ecosystem with automatic COD refund crediting and 1-click checkout redemption."
             ], "Innovation")

    add_card(slide2, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0), 
             "3. Core Key Features", [
                 "41 Verified Everyday Products across 7 streamlined departments (no clutter).",
                 "Dynamic Express Delivery (15-min delivery simulated with real-time stock clamping).",
                 "7-Day Return Guarantee with dedicated COD vs UPI refund routing.",
                 "Store Admin Console: Demand velocity forecasting, inventory batch/expiry, and sales audit."
             ], "Highlights")

    # ==========================================
    # SLIDE 3: SYSTEM ARCHITECTURE
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3)
    add_header(slide3, "End-to-End System Architecture")

    add_card(slide3, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Layer 1: Frontend Client", [
                 "Next.js App Router (React 19, Tailwind CSS, Lucide Icons).",
                 "Responsive Supermarket Storefront, Slide-out Basket, and Wallet Ledger.",
                 "Customer Profile & Address Management (persisted to DB & localStorage).",
                 "Real-time Admin Command Center with Manual Refresh return inspection."
             ], "Presentation Layer")

    add_card(slide3, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Layer 2: API & IPC Gateway", [
                 "Next.js Route Handlers (`/api/checkout`, `/api/returns`, `/api/user/wallet`, etc.).",
                 "Node.js Child Process (`execAsync`) pipes JSON payloads into compiled C++ binary.",
                 "Standard output (`stdout`) captured and deserialized with zero network overhead.",
                 "SQLite ORM & SQL transaction management ensuring consistency."
             ], "Orchestration Layer")

    add_card(slide3, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Layer 3: C++ OOP Engine & DB", [
                 "Compiled C++17 Binary (`backend/pos_backend`).",
                 "Polymorphic class hierarchy calculating dynamic product taxes and discounts.",
                 "SQLite Database (`pos.db`) storing Users, Products, Sales, Line Items, and Wallet Transactions.",
                 "Sub-millisecond billing calculation speed and robust offline resilience."
             ], "Computation & Storage")

    # ==========================================
    # SLIDE 4: C++ OOP PRINCIPLES (KEY EMPHASIS)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4)
    add_header(slide4, "Core Focus: C++ Object-Oriented Programming (OOP)", "OOP Paradigm & Architecture")

    add_card(slide4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.4),
             "1. Abstraction & Interface Design", [
                 "Abstract Base Class `Product` defines pure virtual contract: `virtual double calculateTax() const = 0;`",
                 "Decouples calling code from department-specific tax logic and pricing rules.",
                 "Hides internal arithmetic and rounding nuances behind public interface methods."
             ], "Abstraction")

    add_card(slide4, Inches(6.8), Inches(1.8), Inches(5.6), Inches(2.4),
             "2. Encapsulation & Data Hiding", [
                 "Protected member variables (`id`, `name`, `price`, `quantity`, `category`).",
                 "Access restricted via explicit getters (`getId()`, `getPrice()`, `getSubtotal()`).",
                 "Prevents external mutation of product state during active invoice generation."
             ], "Encapsulation")

    add_card(slide4, Inches(0.8), Inches(4.4), Inches(5.6), Inches(2.4),
             "3. Class Inheritance Hierarchy", [
                 "`GroceryProduct` inherits `Product` (implements essential zero/low tax rates).",
                 "`HouseholdProduct` inherits `Product` (implements packaging & FMCG tax rates).",
                 "`PersonalCareProduct` inherits `Product` (implements cosmetic/skincare GST).",
                 "`OtherProduct` handles miscellaneous retail goods."
             ], "Inheritance")

    add_card(slide4, Inches(6.8), Inches(4.4), Inches(5.6), Inches(2.4),
             "4. Runtime Polymorphism", [
                 "Cart items stored as pointers to base class (`std::vector<std::unique_ptr<Product>>`).",
                 "Dynamic dispatch invokes overridden `calculateTax()` at runtime without switch statements.",
                 "Extensible: New departments can be added without modifying existing checkout billing logic."
             ], "Polymorphism")

    # ==========================================
    # SLIDE 5: JSON IPC STREAMING & SERIALIZATION
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5)
    add_header(slide5, "Inter-Process Communication & JSON Serialization")

    add_card(slide5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Next.js Web Server (Caller)", [
                 "Packs shopping cart items, bag counts, and active discount coupon into a clean JSON payload.",
                 "Executes child process command:",
                 "  `echo '${JSON.stringify(payload)}' | ./backend/pos_backend`",
                 "Listens on standard output (`stdout`) stream.",
                 "Parses the resulting JSON invoice and stores order in SQLite database.",
                 "Guarantees language independence between web stack and native C++ backend."
             ], "Web & Node.js")

    add_card(slide5, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "C++ Billing Engine (Execution)", [
                 "Uses `nlohmann::json` (`json.hpp`) for high-speed parsing: `auto req = json::parse(input);`",
                 "Factory Pattern dynamically instantiates concrete OOP product objects from JSON fields.",
                 "Iterates through polymorphic collection to calculate itemized taxes, subtotals, and total savings.",
                 "Applies discount policies (FLAT_THRESHOLD, BOGO, Percentage off).",
                 "Serializes final receipt object: `std::cout << responseJson.dump(4);`"
             ], "C++ Binary")

    # ==========================================
    # SLIDE 6: PRODUCT CATALOG & SECTIONS
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_bg(slide6)
    add_header(slide6, "Catalog Organization & Department Structure")

    add_card(slide6, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Fresh & Food Staples", [
                 "🥦🍎 Vegetables and Fruits: Farm fresh tomatoes, onions, potatoes, apples, bananas, organic spinach.",
                 "🌾 Grocery: Basmati rice, whole wheat sourdough bread, farm eggs, cold-pressed olive oil, raw honey.",
                 "🥤 Snacks and Drinks: Ramen noodles, herbal green tea, chocolate cookies, potato chips, pressed juice."
             ], "Kitchen Essentials")

    add_card(slide6, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Home & Personal Care", [
                 "✨ Beauty and Personal Care: Herbal soap bars, bamboo shampoo, soft toothbrush sets, hydrating skincare.",
                 "🧼 Household: Disinfectant surface cleaner, bleach spray, lavender essential oil, scented candles.",
                 "📚 Stationary: Executive notebooks, gel pens, marker sets, desktop organizers."
             ], "Daily Living")

    add_card(slide6, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Unified 'Other' Section", [
                 "Shifted all Lifestyle products into the 'Other' section to eliminate clutter.",
                 "🎁 Other Items: Insulated stainless steel bottle, roast coffee mug, daily multivitamins, sleeping pillow, cast iron dutch oven, knife set, tote bags, and ergonomic chairs.",
                 "Total 41 verified products with live stock tracking and dynamic expiry dates."
             ], "Consolidated Category")

    # ==========================================
    # SLIDE 7: SMART CART & CHECKOUT BREAKDOWN
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_bg(slide7)
    add_header(slide7, "Customer Checkout & Price Breakdown Engine")

    add_card(slide7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Transparent Price Breakdown", [
                 "Subtotal Calculation: Exact item count multiplied by discounted store unit prices.",
                 "MRP Savings Meter: Visually displays total savings comparing MRP vs Equinox price.",
                 "Dynamic Delivery Fee: Free express delivery for orders >= ₹200 (otherwise ₹35 flat).",
                 "Taxes & Packaging: 2% packaging and handling fee accurately calculated.",
                 "Equinox Wallet Deduction: Displays `- Equinox Wallet Applied: -₹XXX.XX` when checked.",
                 "Final 'To Pay' Grand Total rendered prominently."
             ], "Pricing Engine")

    add_card(slide7, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Flexible Payment Methods", [
                 "1. Equinox Wallet (100% Covered): Direct 1-click placement without needing payment gateways or UPI IDs.",
                 "2. Cash on Delivery (COD): System Payment ID auto-generated; cash collected at doorstep upon delivery.",
                 "3. Merchant UPI (`krishraj453@okicici`): Direct UPI QR/VPA payment with compulsory 12-digit UPI Reference / UTR ID validation.",
                 "Official Thermal Supermarket Receipt auto-generated on checkout with printable layout."
             ], "Fulfillment")

    # ==========================================
    # SLIDE 8: EQUINOX WALLET & REFUND ROUTING
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_bg(slide8)
    add_header(slide8, "Equinox Wallet & Automated Refund Routing", "FinTech & User Retention")

    add_card(slide8, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "1. Automatic Wallet Provisioning", [
                 "Every customer account created automatically provisions an Equinox Wallet with ₹0.00 starting balance.",
                 "Dedicated Wallet Tab in the sidebar located directly below Order History.",
                 "Real-time synchronized balance card with instant refresh button.",
                 "Provides seamless in-store shopping credit experience."
             ], "Wallet Setup")

    add_card(slide8, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "2. COD vs UPI Refund Routing", [
                 "Strict Policy Distinction:",
                 "• Cash on Delivery (COD) Returns: Refund amount is CREDITED directly to customer's Equinox Wallet within 7-8 working days upon admin approval.",
                 "• UPI Order Returns: Refund amount is routed back to the customer's original UPI bank account within 7-8 working days (bypasses wallet).",
                 "Clear disclaimers rendered in the return UI according to order payment method."
             ], "Smart Routing")

    add_card(slide8, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "3. Immutable Audit Ledger", [
                 "Every movement logged in `WalletTransactions` table:",
                 "• CREDIT: 'Return Refund for Order #X (Cash on Delivery)'",
                 "• DEBIT: 'Redeemed on Supermarket Order #Y'",
                 "Shows transaction date, reference IDs (`RET-XXX` or `ORD-YYY`), and running balance.",
                 "Zero duplicate credits or falsy balance bugs."
             ], "Ledger Integrity")

    # ==========================================
    # SLIDE 9: 7-DAY RETURN POLICY & ADMIN REFRESH
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_bg(slide9)
    add_header(slide9, "7-Day Return Lifecycle & Admin Inspection")

    add_card(slide9, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Customer Return Request Workflow", [
                 "Eligible only on orders marked 'Delivered' within the last 7 calendar days.",
                 "Customer selects order from Order History and clicks 'Initiate Refund'.",
                 "Selects return reason (product quality, expired item, damaged packaging, or custom note).",
                 "Clean UX: Automatically resets return prompt when switching between orders or navigating back.",
                 "Order status updates to 'Return Requested' immediately upon submission."
             ], "Customer Experience")

    add_card(slide9, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Admin Inspection & Manual Refresh", [
                 "Auto-refresh polling removed from Admin Portal per security best practices.",
                 "Dedicated 'Refresh' button allows store managers to fetch pending returns on demand.",
                 "Admin reviews customer details, items, reason, and refund amount.",
                 "Approval requires Master Admin Password verification.",
                 "On approval: Inventory items are automatically restocked into catalog and wallet is credited for COD."
             ], "Admin Oversight")

    # ==========================================
    # SLIDE 10: ADMIN COMMAND CENTER
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_bg(slide10)
    add_header(slide10, "Store Admin Command Center & Analytics")

    add_card(slide10, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Inventory Management", [
                 "Replenish stock quantities and adjust unit prices.",
                 "Batch Number tracking (`B-VEG-101`, `B-GRO-201`).",
                 "Dynamic Expiry Date tracking with automatic shelf-life calculation.",
                 "Add new products with instant category mapping."
             ], "Inventory")

    add_card(slide10, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Demand & AI Velocity", [
                 "Stock sales velocity tracking: Fast, Medium, and Slow moving products.",
                 "Automated Reorder Point (ROP) alerts when stock dips below safe thresholds.",
                 "Restock urgency recommendations based on consumption trends."
             ], "Predictive Analytics")

    add_card(slide10, Inches(8.8), Inches(1.8), Inches(3.6), Inches(5.0),
             "Invoices & Configuration", [
                 "Master Sales Log: View and search past orders, customer names, addresses, and payment IDs.",
                 "Reprint and download thermal customer bills.",
                 "GST & Store Configuration: Set tax rates, GSTIN, invoice prefixes, and discount rules."
             ], "Store Operations")

    # ==========================================
    # SLIDE 11: DATABASE SCHEMA
    # ==========================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_bg(slide11)
    add_header(slide11, "Relational Database Schema (SQLite)")

    add_card(slide11, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "User & Financial Ledger Tables", [
                 "Users: id, name, email (UNIQUE), mobile, password, role ('user', 'Admin', 'Store Manager'), address, wallet_balance DECIMAL(10,2).",
                 "WalletTransactions: id, user_email, amount, type ('CREDIT' | 'DEBIT'), description, reference_id, created_at.",
                 "Sales: id, bill_no, customer_name, customer_phone, customer_email, delivery_address, subtotal, tax_amount, grand_total, payment_method, payment_id, upi_ref_id, status, created_at."
             ], "Users & Transactions")

    add_card(slide11, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Inventory & Order Tracking Tables", [
                 "Products: id (PK), name, category, price, stock, brand, batch_no, expiry_date, description, image_url, unit, mrp.",
                 "Line_Items: id, sale_id (FK), product_id (FK), quantity.",
                 "ReturnRequests: id, sale_id (FK), bill_no, customer_name, customer_phone, customer_email, items_summary, reason, amount, status ('Pending' | 'Approved' | 'Rejected'), created_at.",
                 "Discounts: id, code, description, type, min_spend, discount_value, is_active."
             ], "Catalog & Returns")

    # ==========================================
    # SLIDE 12: CONCLUSION & KEY TAKEAWAYS
    # ==========================================
    slide12 = prs.slides.add_slide(blank_layout)
    add_bg(slide12)
    add_header(slide12, "Summary & Key Project Achievements")

    add_card(slide12, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Core Academic OOP Achievements", [
                 "Practical application of Object-Oriented Programming (OOP) in an industry-style retail architecture.",
                 "Demonstrated Polymorphism, Inheritance, Encapsulation, and Abstract Interfaces in C++.",
                 "High-speed Inter-Process Communication (IPC) via JSON streaming bridging web technologies and native code.",
                 "Deterministic financial calculations eliminating floating-point rounding errors."
             ], "OOP Highlights")

    add_card(slide12, Inches(6.8), Inches(1.8), Inches(5.6), Inches(5.0),
             "Commercial Retail Highlights", [
                 "Modern consumer grocery storefront with 15-minute simulated express fulfillment.",
                 "Equinox Wallet ecosystem driving customer retention and instant COD refund crediting.",
                 "Full 7-Day return policy with transparent payment-method-specific refund routing.",
                 "Production-ready deployment on Render with automated CI/CD and zero configuration overhead."
             ], "Business Impact")

    # Save presentation
    output_path = os.path.abspath("Equinox_Supermarket_POS_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_deck()
