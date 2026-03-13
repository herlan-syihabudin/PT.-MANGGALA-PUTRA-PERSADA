export function summaryTemplate(summary: any[], total: number) {
  // Format angka ke Rupiah
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Hitung total dari summary (validasi)
  const calculatedTotal = summary.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const displayTotal = total || calculatedTotal

  const rows = summary.map((s, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="text-center">${(i + 1).toString().padStart(2, '0')}</td>
      <td class="text-left">
        <div class="scope-name">${s.scope || '-'}</div>
        ${s.description ? `<div class="scope-desc">${s.description}</div>` : ''}
      </td>
      <td class="text-right amount">${formatIDR(Number(s.amount) || 0)}</td>
    </tr>
  `).join("")

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

    /* Header Section */
    .header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }

    h2 {
      font-size: 28px;
      font-weight: 300;
      letter-spacing: 2px;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge {
      background: #2563eb10;
      color: #2563eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }

    .card-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
    }

    .card-value.total-items {
      color: #2563eb;
    }

    .card-value.total-amount {
      color: #059669;
    }

    /* Table Styles */
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
      width: 80px;
    }

    th:last-child {
      text-align: right;
      width: 200px;
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

    .scope-name {
      font-weight: 500;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .scope-desc {
      font-size: 12px;
      color: #64748b;
    }

    .amount {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      color: #059669;
    }

    .text-center {
      text-align: center;
    }

    .text-left {
      text-align: left;
    }

    .text-right {
      text-align: right;
    }

    /* Grand Total Row */
    .grand-total-row td {
      background: #f1f5f9;
      font-weight: 600;
      border-top: 2px solid #cbd5e1;
      border-bottom: none;
      padding: 20px 16px;
    }

    .grand-total-row .amount {
      font-size: 18px;
      color: #059669;
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

    .footer-note {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 50%;
    }

    /* Progress Bar */
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin: 20px 0;
      overflow: hidden;
    }

    .progress-fill {
      width: ${summary.length > 0 ? '100' : '0'}%;
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #7c3aed);
      border-radius: 2px;
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
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>GRAND SUMMARY</h2>
          <div class="subtitle">
            <span>Ringkasan Biaya & Material</span>
            <span class="dot"></span>
            <span class="badge">${summary.length} Items</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #64748b;">Date</div>
          <div style="font-weight: 500;">${new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card">
        <div class="card-label">Total Items</div>
        <div class="card-value total-items">${summary.length}</div>
      </div>
      <div class="card">
        <div class="card-label">Categories</div>
        <div class="card-value">${new Set(summary.map(s => s.scope)).size}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Amount</div>
        <div class="card-value total-amount">${formatIDR(displayTotal)}</div>
      </div>
    </div>

    <!-- Progress Bar (visual indicator) -->
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>

    <!-- Main Table -->
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        
        <!-- Grand Total -->
        <tr class="grand-total-row">
          <td colspan="2" class="text-right">
            <span style="font-size: 16px;">GRAND TOTAL</span>
          </td>
          <td class="text-right amount">
            <strong>${formatIDR(displayTotal)}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Additional Info -->
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Amount in words</div>
          <div style="font-size: 13px; color: #0f172a; font-style: italic;">
            ${numberToWords(displayTotal)} Rupiah
          </div>
        </div>
        <div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Notes</div>
          <div style="font-size: 13px; color: #0f172a;">
            Harga sudah termasuk PPN 11%
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        <span>Generated by MPP ERP System</span>
        <span class="dot"></span>
        <span>Valid for 30 days</span>
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

// Helper function untuk terbilang (opsional)
function numberToWords(num: number): string {
  const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"]
  
  if (num < 12) return angka[num]
  if (num < 20) return `${angka[num - 10]} Belas`
  if (num < 100) return `${angka[Math.floor(num / 10)]} Puluh ${angka[num % 10]}`.trim()
  if (num < 200) return `Seratus ${numberToWords(num - 100)}`
  if (num < 1000) return `${angka[Math.floor(num / 100)]} Ratus ${numberToWords(num % 100)}`.trim()
  if (num < 1000000) return `${numberToWords(Math.floor(num / 1000))} Ribu ${numberToWords(num % 1000)}`.trim()
  if (num < 1000000000) return `${numberToWords(Math.floor(num / 1000000))} Juta ${numberToWords(num % 1000000)}`.trim()
  
  return num.toString()
}
