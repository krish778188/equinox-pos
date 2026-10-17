/**
 * Professional, official Equinox Supermarket Bill Receipt Generator
 * Used by both Customer Order History and Admin Portal for 100% identical bills.
 */

export function printSupermarketReceipt(order: any) {
  if (!order) return

  // Handle parsed or stringified items safely
  let items = order.items || []
  if (typeof items === "string") {
    try {
      items = JSON.parse(items)
    } catch (e) {
      items = []
    }
  }

  const printWindow = window.open("", "_blank", "width=650,height=800")
  if (!printWindow) {
    alert("Please allow popups to open and print the bill receipt.")
    return
  }

  const itemsHtml = items.map((it: any, idx: number) => {
    const name = it.product_name || it.name || "Item"
    const qty = it.quantity || 1
    const price = Number(it.price) || 0
    const total = price * qty
    return `
      <tr>
        <td style="padding: 8px 4px; border-bottom: 1px solid #f0eee9; text-align: center; color: #78716c;">${idx + 1}</td>
        <td style="padding: 8px 8px; border-bottom: 1px solid #f0eee9; font-weight: 500; color: #1c1917;">${name}</td>
        <td style="padding: 8px 8px; border-bottom: 1px solid #f0eee9; text-align: center; font-weight: 600;">${qty}</td>
        <td style="padding: 8px 8px; border-bottom: 1px solid #f0eee9; text-align: right; color: #57534e;">₹${price.toFixed(2)}</td>
        <td style="padding: 8px 8px; border-bottom: 1px solid #f0eee9; text-align: right; font-weight: 700; color: #1c1917;">₹${total.toFixed(2)}</td>
      </tr>
    `
  }).join("")

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "Just now"

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice Bill - ${order.billNo || "Equinox Supermarket"}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1c1917;
            padding: 32px;
            max-width: 620px;
            margin: 0 auto;
            background: #fff;
          }
          .store-header {
            text-align: center;
            border-bottom: 2px dashed #d6d3d1;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .store-name {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #064e3b;
            margin-bottom: 3px;
          }
          .store-subtitle {
            font-size: 11px;
            color: #78716c;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .meta-box {
            font-size: 12px;
            color: #44403c;
            line-height: 1.6;
            margin-bottom: 16px;
            padding: 12px 14px;
            background: #fafaf9;
            border-radius: 12px;
            border: 1px solid #e7e5e4;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 2px 0;
          }
          .meta-label {
            color: #78716c;
            font-weight: 500;
          }
          .meta-value {
            font-weight: 600;
            color: #1c1917;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin: 16px 0;
          }
          th {
            text-align: left;
            background: #f5f5f4;
            padding: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #57534e;
            border-bottom: 2px solid #e7e5e4;
          }
          .total-box {
            border-top: 2px dashed #d6d3d1;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 13px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
          }
          .grand-total {
            font-size: 18px;
            font-weight: 800;
            color: #064e3b;
            border-top: 1px solid #e7e5e4;
            padding-top: 8px;
            margin-top: 6px;
          }
          .footer-box {
            margin-top: 24px;
            border-top: 1px dashed #d6d3d1;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #78716c;
            line-height: 1.5;
          }
          @media print {
            body { padding: 15px; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="store-header">
          <div class="store-name">EQUINOX SUPERMARKET</div>
          <div class="store-subtitle">Fresh Groceries &amp; Household Essentials</div>
          <div style="font-size: 11px; color: #a8a29e; margin-top: 4px;">GSTIN: 29ABCDE1234F1Z5 · Official Tax Invoice</div>
        </div>

        <div class="meta-box">
          <div class="meta-row"><span class="meta-label">Bill / Invoice No:</span><span class="meta-value">${order.billNo || "N/A"}</span></div>
          <div class="meta-row"><span class="meta-label">Order Date &amp; Time:</span><span class="meta-value">${formattedDate}</span></div>
          <div class="meta-row"><span class="meta-label">Order Status:</span><span class="meta-value" style="color:#047857; text-transform: uppercase;">${order.status || "Order Placed"}</span></div>
          <div class="meta-row"><span class="meta-label">Customer Name:</span><span class="meta-value">${order.customer_name || "Shopper"}</span></div>
          ${order.customer_phone ? `<div class="meta-row"><span class="meta-label">Mobile Number:</span><span class="meta-value">${order.customer_phone}</span></div>` : ""}
          <div class="meta-row"><span class="meta-label">Delivery Address:</span><span class="meta-value" style="max-width: 65%; font-weight: 500;">${order.delivery_address || "Home Delivery (IIIT Nagpur)"}</span></div>
          <div class="meta-row" style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e7e5e4;">
            <span class="meta-label">Payment Mode:</span>
            <span class="meta-value">${order.payment_method || "UPI (krishraj453@okicici)"}</span>
          </div>
          ${order.payment_id ? `<div class="meta-row"><span class="meta-label">Payment Ref ID:</span><span class="meta-value" style="font-family: monospace;">${order.payment_id}</span></div>` : ""}
          ${order.upi_ref_id && order.upi_ref_id !== "N/A" ? `<div class="meta-row"><span class="meta-label">UPI Ref / UTR:</span><span class="meta-value" style="font-family: monospace; color: #6b21a8;">${order.upi_ref_id}</span></div>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th>Item Description</th>
              <th style="width: 45px; text-align: center;">Qty</th>
              <th style="width: 75px; text-align: right;">Price</th>
              <th style="width: 85px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #888;">Items summary included in total</td></tr>'}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${(Number(order.total_amount) || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Delivery Fee</span>
            <span style="color: #047857; font-weight: 600;">FREE (Express Delivery)</span>
          </div>
          <div class="total-row">
            <span>Taxes &amp; Packaging</span>
            <span>Included (2% GST)</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total Paid</span>
            <span>₹${(Number(order.total_amount) || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer-box">
          <p><strong>7-Day Return Guarantee:</strong> Returns accepted within 7 days of delivery.<br/>
          For return or refund assistance, visit Order History in your app or contact store support.</p>
          <p style="margin-top: 8px; font-weight: 700; color: #064e3b;">Thank you for shopping at Equinox Supermarket!</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
