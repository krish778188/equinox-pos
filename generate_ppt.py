import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Creative Modern Theme Colors
    BG_DARK = RGBColor(15, 23, 42)        # Midnight Slate #0F172A
    CARD_BG = RGBColor(30, 41, 59)        # Slate 800 #1E293B
    CARD_BORDER = RGBColor(51, 65, 85)    # Slate 700 #334155
    CARD_LIGHT = RGBColor(255, 255, 255)  # Pure White
    
    TEXT_LIGHT = RGBColor(248, 250, 252)  # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate 400
    TEXT_DARK = RGBColor(15, 23, 42)      # Slate 900
    
    EMERALD = RGBColor(16, 185, 129)      # Emerald 500 #10B981
    EMERALD_DARK = RGBColor(6, 78, 59)    # Emerald 900 #064E3B
    CYAN = RGBColor(6, 182, 212)          # Cyan 500 #06B6D4
    AMBER = RGBColor(245, 158, 11)        # Amber 500 #F59E0B
    VIOLET = RGBColor(139, 92, 246)       # Violet 500 #8B5CF6
    ORANGE = RGBColor(234, 88, 12)        # Orange 600 #EA580C
    NAVY_ACCENT = RGBColor(30, 27, 75)    # Indigo 950

    ASSETS_DIR = "/Users/krish/.gemini/antigravity/brain/52422a50-736f-4c34-8600-d3cc6d26d68f/.user_uploaded"
    IIITN_LOGO = os.path.join(ASSETS_DIR, "media_1793130984771_887f56c2.png")
    STOREFRONT_SS = os.path.join(ASSETS_DIR, "media_1792266750137_5767c427.png")
    WALLET_SS = os.path.join(ASSETS_DIR, "media_1793122200245_390dc88e.png")
    RETURN_SS = os.path.join(ASSETS_DIR, "media_1793121814405_67cd0f7e.png")
    ADMIN_SS = os.path.join(ASSETS_DIR, "media_1792270114253_e8f24c35.png")

    def set_slide_background(slide, color=BG_DARK):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.color.rgb = color
        return bg

    def add_top_bar(slide, title_text, category_text="EQUINOX SUPERMARKET POS SYSTEM"):
        # Category Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.5), Inches(0.35))
        pill.fill.solid()
        pill.fill.fore_color.rgb = CARD_BG
        pill.line.color.rgb = EMERALD
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = f"●  {category_text.upper()}"
        p_pill.font.size = Pt(10)
        p_pill.font.bold = True
        p_pill.font.color.rgb = EMERALD
        p_pill.alignment = PP_ALIGN.CENTER

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

    def create_card(slide, left, top, width, height, title="", color_bg=CARD_BG, color_border=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = color_bg
        card.line.color.rgb = color_border
        card.line.width = Pt(1.5)
        return card

    # ==============================================================
    # SLIDE 1: TITLE SLIDE (WITH IIIT NAGPUR LOGO & COLLEGE NAME)
    # ==============================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, BG_DARK)

    # Decorative background glows / card
    main_banner = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.7), Inches(11.733), Inches(6.1))
    main_banner.fill.solid()
    main_banner.fill.fore_color.rgb = RGBColor(17, 24, 39) # Dark container
    main_banner.line.color.rgb = RGBColor(55, 65, 81)
    main_banner.line.width = Pt(1.5)

    # IIIT Nagpur Logo
    if os.path.exists(IIITN_LOGO):
        s1.shapes.add_picture(IIITN_LOGO, Inches(1.3), Inches(1.15), width=Inches(1.5), height=Inches(1.5))

    # College Header Text
    col_tb = s1.shapes.add_textbox(Inches(3.0), Inches(1.15), Inches(9.0), Inches(1.5))
    tf_col = col_tb.text_frame
    tf_col.word_wrap = True

    p_inst = tf_col.paragraphs[0]
    p_inst.text = "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY, NAGPUR"
    p_inst.font.size = Pt(18)
    p_inst.font.bold = True
    p_inst.font.color.rgb = TEXT_LIGHT

    p_dept = tf_col.add_paragraph()
    p_dept.text = "Department of Electronics & Communication Engineering  ·  IIITN"
    p_dept.font.size = Pt(12)
    p_dept.font.bold = True
    p_dept.font.color.rgb = ORANGE

    p_subj = tf_col.add_paragraph()
    p_subj.text = "Academic Capstone Project · Object-Oriented Programming (OOP) in C++"
    p_subj.font.size = Pt(11)
    p_subj.font.color.rgb = CYAN

    # Horizontal Divider Line
    line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.3), Inches(2.9), Inches(10.7), Inches(0.03))
    line.fill.solid()
    line.fill.fore_color.rgb = EMERALD
    line.line.color.rgb = EMERALD

    # Project Title Box
    title_tb = s1.shapes.add_textbox(Inches(1.3), Inches(3.1), Inches(10.7), Inches(2.2))
    tf_t = title_tb.text_frame
    tf_t.word_wrap = True

    p_main = tf_t.paragraphs[0]
    p_main.text = "Equinox Supermarket POS & Management System"
    p_main.font.size = Pt(30)
    p_main.font.bold = True
    p_main.font.color.rgb = TEXT_LIGHT
    p_main.space_after = Pt(8)

    p_sub = tf_t.add_paragraph()
    p_sub.text = "An Omnichannel Retail Platform Powered by a Polymorphic C++ OOP Billing Engine, Next.js Full-Stack Web Architecture & Equinox Digital Wallet"
    p_sub.font.size = Pt(14)
    p_sub.font.color.rgb = RGBColor(209, 213, 219)
    p_sub.space_after = Pt(20)

    # Authors Badge Container
    auth_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(5.35), Inches(10.7), Inches(1.05))
    auth_card.fill.solid()
    auth_card.fill.fore_color.rgb = CARD_BG
    auth_card.line.color.rgb = CARD_BORDER
    auth_card.line.width = Pt(1)

    auth_tb = s1.shapes.add_textbox(Inches(1.5), Inches(5.42), Inches(10.3), Inches(0.9))
    tf_a = auth_tb.text_frame
    p_a0 = tf_a.paragraphs[0]
    p_a0.text = "PROJECT DEVELOPERS & CONTRIBUTORS (IIIT NAGPUR):"
    p_a0.font.size = Pt(10)
    p_a0.font.bold = True
    p_a0.font.color.rgb = EMERALD

    p_a1 = tf_a.add_paragraph()
    p_a1.text = "Krish Raj (BT24ECE084)   |   Harsh Raj (BT24ECE083)   |   Amitabh Kumar (BT24ECE115)"
    p_a1.font.size = Pt(13)
    p_a1.font.bold = True
    p_a1.font.color.rgb = TEXT_LIGHT

    # ==============================================================
    # SLIDE 2: EXECUTIVE SUMMARY & STAT CARDS
    # ==============================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, BG_DARK)
    add_top_bar(s2, "Executive Summary & Architectural Highlights", "Retail Technology Problem & Solution")

    # 4 Quick Metric KPI Cards across top
    metrics = [
        ("41 PRODUCTS", "Verified everyday essentials across 7 departments", EMERALD),
        ("< 2 ms IPC", "Sub-millisecond billing via C++ child process", CYAN),
        ("EQUINOX WALLET", "Automated COD return credits & 1-click redemption", AMBER),
        ("7-DAY RETURNS", "Audited refund routing: Wallet (COD) vs Bank (UPI)", VIOLET)
    ]
    for i, (m_val, m_desc, col) in enumerate(metrics):
        card_x = Inches(0.8 + i * 2.98)
        c = create_card(s2, card_x, Inches(1.7), Inches(2.8), Inches(1.2), color_border=col)
        tb_m = s2.shapes.add_textbox(card_x + Inches(0.15), Inches(1.75), Inches(2.5), Inches(1.1))
        tf_m = tb_m.text_frame
        p_v = tf_m.paragraphs[0]
        p_v.text = m_val
        p_v.font.size = Pt(14)
        p_v.font.bold = True
        p_v.font.color.rgb = col
        p_d = tf_m.add_paragraph()
        p_d.text = m_desc
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = TEXT_MUTED

    # Two large contrast comparison cards
    # Problem Card
    c_prob = create_card(s2, Inches(0.8), Inches(3.1), Inches(5.7), Inches(3.9), color_border=RGBColor(239, 68, 68))
    tb_p = s2.shapes.add_textbox(Inches(1.0), Inches(3.2), Inches(5.3), Inches(3.7))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    p_pt = tf_p.paragraphs[0]
    p_pt.text = "⚠️  Traditional Grocery & POS Bottlenecks"
    p_pt.font.size = Pt(16)
    p_pt.font.bold = True
    p_pt.font.color.rgb = RGBColor(239, 68, 68)
    p_pt.space_after = Pt(10)

    prob_items = [
        "Monolithic Web Calculators: High overhead, floating-point rounding inconsistencies in JavaScript.",
        "Hardcoded Taxation: GST categories (essential food vs FMCG vs general) hard to manage without clean OOP abstractions.",
        "Decoupled In-Store & Online: Customer online grocery orders disconnected from POS billing logs.",
        "Opaque Refund Workflows: COD customers struggle to receive cash refunds without merchant friction."
    ]
    for it in prob_items:
        p = tf_p.add_paragraph()
        p.text = f"•  {it}"
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(6)

    # Solution Card
    c_sol = create_card(s2, Inches(6.8), Inches(3.1), Inches(5.7), Inches(3.9), color_border=EMERALD)
    tb_s = s2.shapes.add_textbox(Inches(7.0), Inches(3.2), Inches(5.3), Inches(3.7))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True
    p_st = tf_s.paragraphs[0]
    p_st.text = "✨  The Equinox High-Performance Solution"
    p_st.font.size = Pt(16)
    p_st.font.bold = True
    p_st.font.color.rgb = EMERALD
    p_st.space_after = Pt(10)

    sol_items = [
        "Native C++ OOP Core: Polymorphic Product hierarchy calculates tax rates, discounts, and invoices deterministically.",
        "Lightweight JSON IPC: Node.js streams cart payloads to C++ stdin; receives structured JSON receipts via stdout.",
        "Equinox Digital Wallet: Closed-loop store credit system automatically funds COD return refunds.",
        "Audited 7-Day Returns: Distinct refund pathways for COD (Wallet credit) and UPI (Direct bank reversal)."
    ]
    for it in sol_items:
        p = tf_s.add_paragraph()
        p.text = f"•  {it}"
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(6)

    # ==============================================================
    # SLIDE 3: SYSTEM ARCHITECTURE (3-TIER IPC)
    # ==============================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, BG_DARK)
    add_top_bar(s3, "Full-Stack System Architecture & Data Flow", "System Engineering & Design")

    layers = [
        ("TIER 1: PRESENTATION LAYER", "Next.js 16 + React 19 Client UI", [
            "Customer Supermarket Storefront & Category navigation",
            "Real-time Basket Drawer with dynamic quantity clamping",
            "Checkout Modal with transparent tax & bag breakdowns",
            "Customer Profile, Order History & Equinox Wallet modals",
            "Store Admin Portal (Catalog, Demand forecasting, Sales audit)"
        ], CYAN),
        ("TIER 2: API & IPC GATEWAY", "Next.js Route Handlers & Node.js Engine", [
            "REST Endpoints (`/api/checkout`, `/api/returns`, `/api/user/wallet`)",
            "Authentication, session tokens, and input validation",
            "Child Process execution (`execAsync`) piping JSON to C++",
            "Captured `stdout` deserialized into typed receipt objects",
            "SQLite transactional commits ensuring atomic financial updates"
        ], EMERALD),
        ("TIER 3: C++ OOP ENGINE & DB", "Native C++17 Binary + SQLite Database", [
            "Compiled `backend/pos_backend` binary using C++17",
            "Polymorphic `Product` hierarchy evaluating GST rates",
            "Dynamic discount calculator (BOGO, Flat threshold)",
            "`nlohmann::json` streaming input/output serialization",
            "SQLite database (`pos.db`) storing catalog & financial ledgers"
        ], VIOLET)
    ]

    for i, (title_l, sub_l, bullets, col) in enumerate(layers):
        card_x = Inches(0.8 + i * 3.98)
        c = create_card(s3, card_x, Inches(1.7), Inches(3.75), Inches(5.3), color_border=col)
        tb_l = s3.shapes.add_textbox(card_x + Inches(0.2), Inches(1.85), Inches(3.35), Inches(5.0))
        tf_l = tb_l.text_frame
        tf_l.word_wrap = True

        p_t0 = tf_l.paragraphs[0]
        p_t0.text = title_l
        p_t0.font.size = Pt(11)
        p_t0.font.bold = True
        p_t0.font.color.rgb = col

        p_sub = tf_l.add_paragraph()
        p_sub.text = sub_l
        p_sub.font.size = Pt(13)
        p_sub.font.bold = True
        p_sub.font.color.rgb = TEXT_LIGHT
        p_sub.space_after = Pt(12)

        for b in bullets:
            p = tf_l.add_paragraph()
            p.text = f"•  {b}"
            p.font.size = Pt(10.5)
            p.font.color.rgb = RGBColor(209, 213, 219)
            p.space_after = Pt(8)

    # ==============================================================
    # SLIDE 4: CORE C++ OOP ENGINE (THE 4 PILLARS)
    # ==============================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, BG_DARK)
    add_top_bar(s4, "Core Focus: C++ Object-Oriented Programming (OOP)", "Academic OOP Principles in Action")

    pillars = [
        ("1. ABSTRACTION", "Pure Virtual Base Class", [
            "Abstract base class `Product` establishes the billing interface:",
            "`virtual double calculateTax() const = 0;`",
            "`virtual double getSubtotal() const;`",
            "Calling modules interact only through abstract methods without caring how specific taxes are computed."
        ], CYAN),
        ("2. ENCAPSULATION", "Data Protection & Invariants", [
            "Protected member variables (`id`, `name`, `price`, `quantity`, `category`).",
            "Read-only public getters (`getId()`, `getPrice()`, `getSubtotal()`).",
            "Prevents unauthorized external state modification during atomic billing cycles."
        ], EMERALD),
        ("3. INHERITANCE", "Specialized Department Classes", [
            "`GroceryProduct`: Food/Staples essential tax rules (0% - 2%).",
            "`HouseholdProduct`: Packaged home FMCG tax rules (2% - 5%).",
            "`PersonalCareProduct`: Skincare & hygiene tax regulations.",
            "`OtherProduct`: General store & lifestyle retail merchandise."
        ], ORANGE),
        ("4. RUNTIME POLYMORPHISM", "Dynamic Dispatch & Smart Pointers", [
            "Cart stored as collection of base pointers:",
            "`std::vector<std::unique_ptr<Product>>`",
            "Calls `product->calculateTax()` polymorphically at runtime with zero switch-case branching.",
            "Extensible: New departments can be added without changing checkout code."
        ], VIOLET)
    ]

    for i, (p_name, p_sub, bullets, col) in enumerate(pillars):
        row = i // 2
        col_idx = i % 2
        left = Inches(0.8 + col_idx * 5.95)
        top = Inches(1.7 + row * 2.7)
        c = create_card(s4, left, top, Inches(5.75), Inches(2.5), color_border=col)
        tb_p = s4.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.35), Inches(2.2))
        tf_p = tb_p.text_frame
        tf_p.word_wrap = True

        p_t = tf_p.paragraphs[0]
        p_t.text = f"{p_name} — {p_sub}"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_t.space_after = Pt(6)

        for b in bullets:
            p = tf_p.add_paragraph()
            p.text = f"•  {b}"
            p.font.size = Pt(10.5)
            p.font.color.rgb = RGBColor(209, 213, 219)
            p.space_after = Pt(3)

    # ==============================================================
    # SLIDE 5: IPC STREAMING & CODE DEMO CARD
    # ==============================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, BG_DARK)
    add_top_bar(s5, "C++ OOP Engine Implementation & JSON IPC", "Code Level Integration")

    # Left: Explanation
    c_left = create_card(s5, Inches(0.8), Inches(1.7), Inches(5.5), Inches(5.3))
    tb_el = s5.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(5.1), Inches(5.0))
    tf_el = tb_el.text_frame
    tf_el.word_wrap = True

    p_e0 = tf_el.paragraphs[0]
    p_e0.text = "Inter-Process Communication (IPC) Pipeline"
    p_e0.font.size = Pt(15)
    p_e0.font.bold = True
    p_e0.font.color.rgb = CYAN
    p_e0.space_after = Pt(10)

    ipc_steps = [
        "1. Web Dispatch: User clicks 'Place Order'. Next.js handler packs items into a clean JSON string with discount parameters.",
        "2. Process Spawn: Node.js spawns `./backend/pos_backend` and streams JSON payload via `stdin`.",
        "3. High-Speed Deserialization: C++ reads `stdin` into `nlohmann::json` (`json::parse(input)`).",
        "4. Factory Instantiation: Dynamic factory allocates concrete subclasses (`GroceryProduct`, etc.) as `std::unique_ptr<Product>`.",
        "5. Polymorphic Execution: Loops through objects, computes subtotals, itemized taxes, and applies discount strategies.",
        "6. stdout Emission: C++ serializes output with `responseJson.dump(4)`. Node.js parses stdout and commits sale to SQLite."
    ]
    for s in ipc_steps:
        p = tf_el.add_paragraph()
        p.text = s
        p.font.size = Pt(10.5)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(8)

    # Right: Code Snippet Card (Terminal style)
    c_code = create_card(s5, Inches(6.6), Inches(1.7), Inches(5.9), Inches(5.3), color_bg=RGBColor(10, 15, 29), color_border=EMERALD)
    tb_c = s5.shapes.add_textbox(Inches(6.8), Inches(1.8), Inches(5.5), Inches(5.1))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True

    p_ch = tf_c.paragraphs[0]
    p_ch.text = "💻  backend/main.cpp (C++ OOP Core)"
    p_ch.font.size = Pt(12)
    p_ch.font.bold = True
    p_ch.font.color.rgb = EMERALD
    p_ch.space_after = Pt(8)

    code_lines = [
        "// 1. Abstract Base Class",
        "class Product {",
        "protected:",
        "    std::string id, name, category;",
        "    double price; int quantity;",
        "public:",
        "    virtual double calculateTax() const = 0;",
        "    virtual double getSubtotal() const { return price * quantity; }",
        "};",
        "",
        "// 2. Specialized Derived Subclasses",
        "class GroceryProduct : public Product {",
        "public:",
        "    double calculateTax() const override { return getSubtotal() * 0.02; }",
        "};",
        "",
        "// 3. Runtime Polymorphic Execution",
        "std::vector<std::unique_ptr<Product>> cartItems;",
        "for (const auto& item : cartItems) {",
        "    grandSubtotal += item->getSubtotal();",
        "    grandTax      += item->calculateTax(); // Virtual dispatch",
        "}"
    ]
    for cl in code_lines:
        p = tf_c.add_paragraph()
        p.text = cl
        p.font.size = Pt(9.5)
        p.font.name = "Courier New"
        if cl.startswith("//"):
            p.font.color.rgb = RGBColor(148, 163, 184) # comments
        elif "class" in cl or "virtual" in cl or "override" in cl or "public" in cl:
            p.font.color.rgb = CYAN
        else:
            p.font.color.rgb = RGBColor(241, 245, 249)
        p.space_after = Pt(1)

    # ==============================================================
    # SLIDE 6: STOREFRONT UI & PRODUCT CATALOG (WITH SCREENSHOT)
    # ==============================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, BG_DARK)
    add_top_bar(s6, "Customer Storefront UI & 7 Departments", "Product Catalog Architecture")

    # Left: Explanation Cards
    c_s6 = create_card(s6, Inches(0.8), Inches(1.7), Inches(5.5), Inches(5.3))
    tb_s6 = s6.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(5.1), Inches(5.0))
    tf_s6 = tb_s6.text_frame
    tf_s6.word_wrap = True

    p_s6h = tf_s6.paragraphs[0]
    p_s6h.text = "Streamlined Supermarket Storefront"
    p_s6h.font.size = Pt(15)
    p_s6h.font.bold = True
    p_s6h.font.color.rgb = CYAN
    p_s6h.space_after = Pt(8)

    cats = [
        "1. 🥦🍎 Vegetables & Fruits: Farm fresh daily greens, apples, potatoes, onions.",
        "2. 🌾 Grocery: Basmati rice, farm brown eggs, sourdough bread, raw honey.",
        "3. 🥤 Snacks & Drinks: Ramen noodles, herbal green teas, artisanal cookies.",
        "4. ✨ Beauty & Personal Care: Natural soap bars, bamboo toothbrushes, cleansers.",
        "5. 🧼 Household: Disinfectant sprays, surface cleaners, essential oils.",
        "6. 📚 Stationary: Executive notebooks, precision pens, desk organizers.",
        "7. 🎁 Consolidated 'Other' Section: Shifted lifestyle goods (insulated bottles, coffee, multivitamins, pillows) alongside kitchen & home cookware.",
        "• Total 41 verified products with live stock clamping and dynamic expiry calculations."
    ]
    for ct in cats:
        p = tf_s6.add_paragraph()
        p.text = ct
        p.font.size = Pt(10)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(5)

    # Right: Embedded Screenshot of Storefront
    if os.path.exists(STOREFRONT_SS):
        c_pic_border = create_card(s6, Inches(6.55), Inches(1.65), Inches(6.0), Inches(5.4), color_bg=RGBColor(17, 24, 39), color_border=EMERALD)
        s6.shapes.add_picture(STOREFRONT_SS, Inches(6.65), Inches(1.75), width=Inches(5.8), height=Inches(5.2))

    # ==============================================================
    # SLIDE 7: SMART BASKET & CHECKOUT ENGINE
    # ==============================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, BG_DARK)
    add_top_bar(s7, "Dynamic Basket, Price Breakdown & Checkout", "Order Fulfillment System")

    add_card_props = [
        ("1. Dynamic Basket", "Interactive Quantities", [
            "Live slide-out basket with instant item deletion and quantity +/- controls.",
            "Stock Clamping: Prevents adding items beyond available database inventory.",
            "Visual MRP Savings Meter: Real-time calculation comparing retail MRP vs store unit prices."
        ], CYAN),
        ("2. Price Breakdown Engine", "Transparent Fees", [
            "Itemized Subtotal from line items.",
            "Taxes & Packaging (2% packaging/handling).",
            "Delivery Fee: Automatic ₹0 Free Delivery for orders >= ₹200 (otherwise ₹35 flat).",
            "Equinox Wallet Applied: Live deduction display (`- ₹XXX.XX`).",
            "Final Prominent 'To Pay' Grand Total."
        ], EMERALD),
        ("3. Payment Flexibility", "Multi-Rail Checkout", [
            "1. Equinox Wallet (100% Covered): Direct placement without external gateways.",
            "2. Cash on Delivery (COD): System Payment ID auto-generated for doorstep settlement.",
            "3. Merchant UPI (`krishraj453@okicici`): Mandatory 12-digit UPI Reference / UTR validation.",
            "Official Thermal Supermarket Receipt generated on successful placement."
        ], AMBER)
    ]
    for i, (t_m, s_m, buls, col) in enumerate(add_card_props):
        c_x = Inches(0.8 + i * 3.98)
        c = create_card(s7, c_x, Inches(1.7), Inches(3.75), Inches(5.3), color_border=col)
        tb_b = s7.shapes.add_textbox(c_x + Inches(0.2), Inches(1.85), Inches(3.35), Inches(5.0))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True

        p_t = tf_b.paragraphs[0]
        p_t.text = t_m
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = col

        p_s = tf_b.add_paragraph()
        p_s.text = s_m
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = TEXT_MUTED
        p_s.space_after = Pt(12)

        for b in buls:
            p = tf_b.add_paragraph()
            p.text = f"•  {b}"
            p.font.size = Pt(10.5)
            p.font.color.rgb = RGBColor(209, 213, 219)
            p.space_after = Pt(8)

    # ==============================================================
    # SLIDE 8: EQUINOX WALLET (WITH SCREENSHOT)
    # ==============================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, BG_DARK)
    add_top_bar(s8, "Equinox Wallet & Automated Refund Routing", "FinTech & Customer Retention")

    # Left: Explanation Card
    c_w = create_card(s8, Inches(0.8), Inches(1.7), Inches(6.8), Inches(5.3))
    tb_w = s8.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(6.4), Inches(5.0))
    tf_w = tb_w.text_frame
    tf_w.word_wrap = True

    p_wh = tf_w.paragraphs[0]
    p_wh.text = "In-App Digital Wallet Architecture"
    p_wh.font.size = Pt(15)
    p_wh.font.bold = True
    p_wh.font.color.rgb = EMERALD
    p_wh.space_after = Pt(8)

    w_points = [
        "1. Automatic Wallet Provisioning: Every user who registers an account receives an active Equinox Wallet initialized to ₹0.00.",
        "2. Dedicated Sidebar Access: Equinox Wallet button placed directly below Order History with live balance indicator.",
        "3. Cash on Delivery (COD) Refunds: When a COD order is returned and approved by admin, the money is credited directly to the customer's wallet within 7-8 working days.",
        "4. UPI Refund Separation: Orders placed via UPI are refunded directly back to the customer's UPI bank account (never mixed into wallet).",
        "5. 1-Click Wallet Checkout: Wallet balance can be applied to future orders with instant deduction.",
        "6. Real-Time Balance Sync: Window events & cache-busting ensure sidebar balance updates immediately without page reload.",
        "7. Immutable Ledger (`WalletTransactions`): Records all CREDIT and DEBIT actions with timestamps and reference IDs."
    ]
    for wp in w_points:
        p = tf_w.add_paragraph()
        p.text = f"•  {wp}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(6)

    # Right: Embedded Screenshot of Wallet Modal
    if os.path.exists(WALLET_SS):
        c_w_pic = create_card(s8, Inches(7.85), Inches(1.65), Inches(4.7), Inches(5.4), color_bg=RGBColor(17, 24, 39), color_border=EMERALD)
        s8.shapes.add_picture(WALLET_SS, Inches(8.0), Inches(1.75), width=Inches(4.4), height=Inches(5.2))

    # ==============================================================
    # SLIDE 9: 7-DAY RETURN & ADMIN REFRESH (WITH SCREENSHOT)
    # ==============================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, BG_DARK)
    add_top_bar(s9, "7-Day Return Lifecycle & Admin Oversight", "Customer Service & Inventory Restock")

    # Left: Explanation Card
    c_r = create_card(s9, Inches(0.8), Inches(1.7), Inches(6.0), Inches(5.3))
    tb_r = s9.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(5.6), Inches(5.0))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    p_rh = tf_r.paragraphs[0]
    p_rh.text = "7-Day Return Request & Inspection Flow"
    p_rh.font.size = Pt(15)
    p_rh.font.bold = True
    p_rh.font.color.rgb = AMBER
    p_rh.space_after = Pt(8)

    r_points = [
        "1. 7-Day Eligibility: Customers can initiate returns only on orders marked 'Delivered' within the last 7 calendar days.",
        "2. Dynamic Policy Notice in Drawer:",
        "    • COD Orders: 'Money will be refunded to wallet within 7-8 working days upon admin approval.'",
        "    • UPI Orders: 'Money will be refunded to your UPI account within 7-8 working days upon admin approval.'",
        "3. Glitch-Free Drawer UX: Switching between orders or clicking back automatically resets return prompts.",
        "4. Store Admin Inspection (Manual Refresh):",
        "    • Polling intervals removed for performance & security.",
        "    • Dedicated 'Refresh' button allows admin to inspect pending requests on demand.",
        "    • Admin password authentication required (`equinox@123`).",
        "5. Automated Restock: Approving return immediately increments inventory units back into catalog."
    ]
    for rp in r_points:
        p = tf_r.add_paragraph()
        p.text = rp
        p.font.size = Pt(10)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(5)

    # Right: Embedded Screenshot of Return Drawer
    if os.path.exists(RETURN_SS):
        c_r_pic = create_card(s9, Inches(7.05), Inches(1.65), Inches(5.5), Inches(5.4), color_bg=RGBColor(17, 24, 39), color_border=AMBER)
        s9.shapes.add_picture(RETURN_SS, Inches(7.15), Inches(1.75), width=Inches(5.3), height=Inches(5.2))

    # ==============================================================
    # SLIDE 10: ADMIN PORTAL & ANALYTICS (WITH SCREENSHOT)
    # ==============================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, BG_DARK)
    add_top_bar(s10, "Store Admin Command Center & Analytics", "Operational Intelligence")

    # Left: Explanation Card
    c_ad = create_card(s10, Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.3))
    tb_ad = s10.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(5.4), Inches(5.0))
    tf_ad = tb_ad.text_frame
    tf_ad.word_wrap = True

    p_adh = tf_ad.paragraphs[0]
    p_adh.text = "Operational Controls & Management Tabs"
    p_adh.font.size = Pt(15)
    p_adh.font.bold = True
    p_adh.font.color.rgb = CYAN
    p_adh.space_after = Pt(8)

    ad_points = [
        "1. Inventory & Catalog (`stock`): Add new products, replenish units, adjust pricing, and track dynamic batch numbers.",
        "2. Shelf-Life Expiry Tracker: Dynamic date offset calculation highlights perishable grocery freshness.",
        "3. Demand Forecasting & AI Insights (`demand`): Sales velocity tracking (Fast, Medium, Slow items) and Reorder Point (ROP) alerts.",
        "4. Sales & Invoices Log (`sales`): Complete audit history of past orders with one-click thermal receipt downloads.",
        "5. System Configuration (`settings`): GSTIN configuration, tax rates, invoice formatting, and promotional discount management."
    ]
    for ap in ad_points:
        p = tf_ad.add_paragraph()
        p.text = ap
        p.font.size = Pt(10.5)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(6)

    # Right: Embedded Screenshot of Admin Console
    if os.path.exists(ADMIN_SS):
        c_ad_pic = create_card(s10, Inches(6.85), Inches(1.65), Inches(5.7), Inches(5.4), color_bg=RGBColor(17, 24, 39), color_border=CYAN)
        s10.shapes.add_picture(ADMIN_SS, Inches(6.95), Inches(1.75), width=Inches(5.5), height=Inches(5.2))

    # ==============================================================
    # SLIDE 11: DATABASE SCHEMA (SQLITE)
    # ==============================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, BG_DARK)
    add_top_bar(s11, "Relational Database Schema & Data Models", "Persistence & Entity Relationships")

    schema_tables = [
        ("Users & Auth", "Users Table", [
            "id: INTEGER PK AUTOINCREMENT",
            "name, email (UNIQUE), mobile, password",
            "role ('user', 'Admin', 'Store Manager')",
            "address: Delivery address",
            "wallet_balance: DECIMAL(10,2) DEFAULT 0.00"
        ], CYAN),
        ("Financial Ledger", "WalletTransactions Table", [
            "id: INTEGER PK AUTOINCREMENT",
            "user_email: VARCHAR(255) (FK)",
            "amount: DECIMAL(10,2)",
            "type: 'CREDIT' | 'DEBIT'",
            "description: Detailed transaction narrative",
            "reference_id: `RET-XXX` or `ORD-YYY`",
            "created_at: TIMESTAMP"
        ], EMERALD),
        ("Inventory Catalog", "Products Table", [
            "id: VARCHAR(50) PK",
            "name, category, price, stock",
            "brand, batch_no, expiry_date",
            "description, image_url, unit, mrp"
        ], ORANGE),
        ("Orders & Returns", "Sales & ReturnRequests", [
            "Sales: id, bill_no, customer_email, subtotal, tax_amount, grand_total, payment_method, status",
            "Line_Items: sale_id, product_id, quantity",
            "ReturnRequests: id, sale_id, reason, amount, status ('Pending' | 'Approved' | 'Rejected')"
        ], VIOLET)
    ]

    for i, (tab_h, tab_sub, fields, col) in enumerate(schema_tables):
        row = i // 2
        col_idx = i % 2
        left = Inches(0.8 + col_idx * 5.95)
        top = Inches(1.7 + row * 2.7)
        c = create_card(s11, left, top, Inches(5.75), Inches(2.5), color_border=col)
        tb_sc = s11.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.35), Inches(2.2))
        tf_sc = tb_sc.text_frame
        tf_sc.word_wrap = True

        p_t = tf_sc.paragraphs[0]
        p_t.text = f"{tab_h} — {tab_sub}"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_t.space_after = Pt(6)

        for fld in fields:
            p = tf_sc.add_paragraph()
            p.text = f"•  {fld}"
            p.font.size = Pt(9.5)
            p.font.color.rgb = RGBColor(209, 213, 219)
            p.space_after = Pt(2)

    # ==============================================================
    # SLIDE 12: PROJECT TEAM & CONTRIBUTORS (SECOND TO LAST SLIDE)
    # ==============================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, BG_DARK)
    add_top_bar(s12, "Project Developers & Contributors", "Academic Team Profile · IIIT Nagpur")

    # Team Members
    team = [
        ("Krish Raj", "BT24ECE084", "Lead Full-Stack & System Architect", [
            "Designed and developed Next.js 16 full-stack storefront & responsive UI.",
            "Architected the Inter-Process Communication (IPC) bridge between web & C++.",
            "Implemented the Equinox Wallet ledger and automated refund routing system.",
            "Configured live deployment pipelines and continuous integration on Render."
        ], CYAN),
        ("Harsh Raj", "BT24ECE083", "C++ OOP Engine & Algorithms Lead", [
            "Implemented the C++17 polymorphic Product class hierarchy and GST logic.",
            "Engineered `nlohmann::json` streaming input/output deserializer.",
            "Designed dynamic discount calculation strategies (BOGO, Threshold).",
            "Benchmarked and optimized calculation latency (< 2ms per invoice)."
        ], EMERALD),
        ("Amitabh Kumar", "BT24ECE115", "Database Architect & QA Lead", [
            "Designed the normalized SQLite relational schema and migration scripts.",
            "Engineered the 7-day return request lifecycle and automated restock logic.",
            "Implemented stock velocity analytics and reorder point demand algorithms.",
            "Conducted comprehensive integration testing across multi-device viewports."
        ], ORANGE)
    ]

    for i, (name, roll, role, resp, col) in enumerate(team):
        c_x = Inches(0.8 + i * 3.98)
        c = create_card(s12, c_x, Inches(1.7), Inches(3.75), Inches(4.3), color_border=col)
        
        # Avatar Badge
        av = s12.shapes.add_shape(MSO_SHAPE.OVAL, c_x + Inches(1.375), Inches(1.9), Inches(1.0), Inches(1.0))
        av.fill.solid()
        av.fill.fore_color.rgb = CARD_BG
        av.line.color.rgb = col
        av.line.width = Pt(2)
        tf_av = av.text_frame
        p_av = tf_av.paragraphs[0]
        p_av.text = name.split()[0][0] + name.split()[-1][0]
        p_av.font.size = Pt(18)
        p_av.font.bold = True
        p_av.font.color.rgb = col
        p_av.alignment = PP_ALIGN.CENTER

        # Text
        tb_tm = s12.shapes.add_textbox(c_x + Inches(0.15), Inches(3.0), Inches(3.45), Inches(2.9))
        tf_tm = tb_tm.text_frame
        tf_tm.word_wrap = True

        p_name = tf_tm.paragraphs[0]
        p_name.text = name
        p_name.font.size = Pt(16)
        p_name.font.bold = True
        p_name.font.color.rgb = TEXT_LIGHT
        p_name.alignment = PP_ALIGN.CENTER

        p_roll = tf_tm.add_paragraph()
        p_roll.text = f"Roll No: {roll}"
        p_roll.font.size = Pt(12)
        p_roll.font.bold = True
        p_roll.font.color.rgb = col
        p_roll.alignment = PP_ALIGN.CENTER

        p_role = tf_tm.add_paragraph()
        p_role.text = role
        p_role.font.size = Pt(10)
        p_role.font.color.rgb = TEXT_MUTED
        p_role.alignment = PP_ALIGN.CENTER
        p_role.space_after = Pt(8)

        for r in resp:
            p = tf_tm.add_paragraph()
            p.text = f"• {r}"
            p.font.size = Pt(9.5)
            p.font.color.rgb = RGBColor(209, 213, 219)
            p.space_after = Pt(3)

    # Bottom College Banner
    b_card = create_card(s12, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.95), color_bg=RGBColor(24, 24, 27), color_border=RGBColor(63, 63, 70))
    if os.path.exists(IIITN_LOGO):
        s12.shapes.add_picture(IIITN_LOGO, Inches(1.0), Inches(6.22), width=Inches(0.8), height=Inches(0.8))
    
    tb_inst = s12.shapes.add_textbox(Inches(2.0), Inches(6.25), Inches(10.0), Inches(0.75))
    tf_inst = tb_inst.text_frame
    p_i0 = tf_inst.paragraphs[0]
    p_i0.text = "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY, NAGPUR (IIIT NAGPUR)"
    p_i0.font.size = Pt(12)
    p_i0.font.bold = True
    p_i0.font.color.rgb = TEXT_LIGHT
    p_i1 = tf_inst.add_paragraph()
    p_i1.text = "Permanent Campus: Survey No. 140,141/1 Behind Br. Sheshrao Wankhade Shetkari Sahkari Soot Girni, Village: Waranga, PO: Dongargaon, Butibori, Nagpur-441108"
    p_i1.font.size = Pt(9.5)
    p_i1.font.color.rgb = TEXT_MUTED

    # ==============================================================
    # SLIDE 13: CONCLUSION, LIVE URL & Q&A (FINAL SLIDE)
    # ==============================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13, BG_DARK)
    add_top_bar(s13, "Project Summary, Live Deployment & Q&A", "Conclusion & Future Roadmap")

    # Left: Achievements
    c_ach = create_card(s13, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.3))
    tb_ach = s13.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(5.2), Inches(5.0))
    tf_ach = tb_ach.text_frame
    tf_ach.word_wrap = True

    p_ach = tf_ach.paragraphs[0]
    p_ach.text = "Key Project Takeaways"
    p_ach.font.size = Pt(16)
    p_ach.font.bold = True
    p_ach.font.color.rgb = EMERALD
    p_ach.space_after = Pt(10)

    achievements = [
        "Rigorous OOP Design: Successfully implemented Abstraction, Encapsulation, Inheritance, and Runtime Polymorphism in C++17.",
        "Deterministic Calculations: Zero financial rounding errors by delegating core billing arithmetic to native C++.",
        "High-Speed IPC: High-throughput JSON streaming bridges modern web frameworks with low-level systems programming.",
        "Consumer Trust: Closed-loop Equinox Wallet drives repeat purchases while 7-day transparent refunds eliminate consumer anxiety.",
        "Production-Grade: Deployed live on Render with automated database seeders, zero-config migrations, and instant recovery."
    ]
    for a in achievements:
        p = tf_ach.add_paragraph()
        p.text = f"✔  {a}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = RGBColor(209, 213, 219)
        p.space_after = Pt(8)

    # Right: Thank You & Links Card
    c_links = create_card(s13, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.3), color_bg=RGBColor(17, 24, 39), color_border=CYAN)
    tb_lk = s13.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.7))
    tf_lk = tb_lk.text_frame
    tf_lk.word_wrap = True

    p_ty = tf_lk.paragraphs[0]
    p_ty.text = "Thank You!"
    p_ty.font.size = Pt(32)
    p_ty.font.bold = True
    p_ty.font.color.rgb = TEXT_LIGHT
    p_ty.space_after = Pt(6)

    p_qa = tf_lk.add_paragraph()
    p_qa.text = "Questions & Answers / Demonstration Session"
    p_qa.font.size = Pt(14)
    p_qa.font.bold = True
    p_qa.font.color.rgb = CYAN
    p_qa.space_after = Pt(24)

    links_info = [
        ("🌐 Live Deployment URL:", "https://equinox-pos.onrender.com"),
        ("📂 GitHub Repository:", "https://github.com/krish778188/equinox-pos"),
        ("🏛️ Academic Institution:", "Indian Institute of Information Technology, Nagpur"),
        ("👥 Team Members:", "Krish Raj · Harsh Raj · Amitabh Kumar")
    ]
    for label, val in links_info:
        p_l = tf_lk.add_paragraph()
        p_l.text = label
        p_l.font.size = Pt(11)
        p_l.font.bold = True
        p_l.font.color.rgb = ORANGE

        p_v = tf_lk.add_paragraph()
        p_v.text = val
        p_v.font.size = Pt(12)
        p_v.font.color.rgb = TEXT_LIGHT
        p_v.space_after = Pt(12)

    # Save presentation
    output_path = os.path.abspath("Equinox_Supermarket_POS_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    build_presentation()
