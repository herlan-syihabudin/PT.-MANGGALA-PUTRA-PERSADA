export function breakdownTemplate(items: any[]) {
  // Format angka ke Rupiah
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  // Hitung total keseluruhan
  const grandTotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
  
  // Group by scope/kategori
  const groupedByScope = items.reduce((acc: any, item) => {
    const scope = item.scope || 'Other'
    if (!acc[scope]) acc[scope] = []
    acc[scope].push(item)
    return acc
  }, {})

  const rows = items.map((item, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="text-center">${(i + 1).toString().padStart(2, '0')}</td>
      <td>
        <div class="item-name">${item.item_name || '-'}</div>
        ${item.category ? `<div class="item-category">${item.category}</div>` : ''}
      </td>
      <td class="text-center">${item.unit || '-'}</td>
      <td class="text-center">${item.qty || 0}</td>
      <td class="text-right amount">${formatIDR(item.unit_price || 0)}</td>
      <td class="text-right amount total">${formatIDR(item.total_price || 0)}</td>
    </tr>
  `).join("")

  // Hitung statistik
  const totalItems = items.length
  const uniqueCategories = new Set(items.map(i => i.category)).size
  const avgPrice = grandTotal / totalItems || 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
    }

    .page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
      border-radius: 12px;
      padding: 40px;
    }

    /* Header */
    .header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 28px;
      font-weight: 300;
      letter-spacing: 2px;
      color: #0f172a;
      text-transform: uppercase;
    }

    .stats {
      display: flex;
      gap: 20px;
    }

    .stat-item {
      text-align: right;
    }

    .stat-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }

    .stat-value.total {
      color: #059669;
    }

    /* Info Cards */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }

    .info-card-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-card-value {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
    }

    .info-card-value.currency {
      color: #059669;
    }

    /* Scope Summary */
    .scope-summary {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .scope-tag {
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: #334155;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .scope-count {
      background: #2563eb;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 30px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    th {
      background: #1e293b;
      color: white;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px;
      text-align: left;
    }

    th:first-child {
      text-align: center;
      width: 60px;
    }

    th:nth-child(3), th:nth-child(4) {
      text-align: center;
    }

    th:nth-child(5), th:nth-child(6) {
      text-align: right;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }

    .row-even {
      background: #ffffff;
    }

    .row-odd {
      background: #f8fafc;
    }

    .item-name {
      font-weight: 500;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .item-category {
      font-size: 11px;
      color: #64748b;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .amount {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
    }

    .amount.total {
      color: #059669;
      font-weight: 600;
    }

    /* Grand Total */
    .grand-total {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #cbd5e1;
    }

    .grand-total-label {
      font-size: 16px;
      font-weight: 500;
      color: #0f172a;
    }

    .grand-total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #059669;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 11px;
    }

    .footer-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 50%;
    }

    /* Badge */
    .badge {
      background: #2563eb10;
      color: #2563eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div>
          <h2>BREAKDOWN</h2>
          <div style="display: flex; gap: 10px; margin-top: 8px;">
            <span class="badge">${totalItems} Items</span>
            <span class="badge">${uniqueCategories} Categories</span>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">Total Items</div>
            <div class="stat-value">${totalItems}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Grand Total</div>
            <div class="stat-value total">${formatIDR(grandTotal)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-label">Average Price</div>
        <div class="info-card-value currency">${formatIDR(avgPrice)}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">Highest Price</div>
        <div class="info-card-value currency">${formatIDR(Math.max(...items.map(i => i.unit_price || 0)))}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">Total Quantity</div>
        <div class="info-card-value">${items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0)}</div>
      </div>
      <div class="info-card">
        <div class="info-card-label">Unique Units</div>
        <div class="info-card-value">${new Set(items.map(i => i.unit)).size}</div>
      </div>
    </div>

    <!-- Scope Summary -->
    <div class="scope-summary">
      ${Object.entries(groupedByScope).map(([scope, scopeItems]: [string, any[]]) => `
        <div class="scope-tag">
          <span>${scope}</span>
          <span class="scope-count">${scopeItems.length}</span>
        </div>
      `).join('')}
    </div>

    <!-- Main Table -->
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Description</th>
          <th>Unit</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Grand Total -->
    <div class="grand-total">
      <span class="grand-total-label">GRAND TOTAL</span>
      <span class="grand-total-amount">${formatIDR(grandTotal)}</span>
    </div>

    <!-- Summary by Scope -->
    <div style="margin: 30px 0;">
      <h3 style="font-size: 16px; font-weight: 500; margin-bottom: 16px; color: #0f172a;">
        Summary by Scope
      </h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${Object.entries(groupedByScope).map(([scope, scopeItems]: [string, any[]]) => {
          const scopeTotal = scopeItems.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)
          return `
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 500;">${scope}</span>
                <span style="font-size: 12px; color: #64748b;">${scopeItems.length} items</span>
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #059669;">
                ${formatIDR(scopeTotal)}
              </div>
              <div style="margin-top: 8px; height: 4px; background: #e2e8f0; border-radius: 2px;">
                <div style="width: ${(scopeTotal / grandTotal * 100)}%; height: 100%; background: #2563eb; border-radius: 2px;"></div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-item">
        <span>Generated by MPP ERP System</span>
        <span class="dot"></span>
        <span>${new Date().toLocaleDateString('id-ID')}</span>
      </div>
      <div>
        Page 1 of 1
      </div>
    </div>

  </div>
</body>
</html>
  `
}
