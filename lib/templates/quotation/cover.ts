export function coverTemplate(data: any) {
  // Format tanggal Indonesia
  const formattedDate = new Date(data.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quotation - ${data.proposal_id}</title>
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
      line-height: 1.6;
    }

    .page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .content {
      padding: 60px 50px;
    }

    /* Header dengan border gradient */
    .header {
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid;
      border-image: linear-gradient(to right, #2563eb, #7c3aed) 1;
    }

    .company-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .company-name h1 {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .company-name p {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .company-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 24px;
    }

    .title-section {
      text-align: center;
    }

    .title-section h2 {
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 4px;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .title-section p {
      font-size: 14px;
      color: #2563eb;
      font-weight: 500;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin: 40px 0;
      background: #f8fafc;
      padding: 30px;
      border-radius: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }

    .info-value.project {
      color: #2563eb;
    }

    .info-value.amount {
      color: #059669;
      font-size: 20px;
    }

    /* Content */
    .greeting {
      margin: 40px 0 30px;
    }

    .greeting p {
      margin-bottom: 16px;
      color: #334155;
    }

    .highlight {
      background: linear-gradient(120deg, #dbeafe 0%, #dbeafe 40%, #ffffff 80%);
      padding: 20px 30px;
      border-radius: 12px;
      margin: 30px 0;
      font-style: italic;
      color: #1e40af;
      border-left: 4px solid #2563eb;
    }

    /* Footer */
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;
    }

    .signature {
      text-align: center;
    }

    .signature-title {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 40px;
    }

    .signature-line {
      border-top: 1px solid #cbd5e1;
      margin-bottom: 8px;
    }

    .signature-name {
      font-weight: 600;
      color: #0f172a;
    }

    .signature-position {
      font-size: 11px;
      color: #64748b;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      bottom: 40px;
      right: 40px;
      opacity: 0.03;
      font-size: 80px;
      font-weight: bold;
      color: #2563eb;
      transform: rotate(-15deg);
      pointer-events: none;
    }

    @media print {
      body { background: white; }
      .page { box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="content">
      
      <!-- HEADER -->
      <div class="header">
        <div class="company-info">
          <div class="company-name">
            <h1>PT. MANGGALA PUTRA PERSADA</h1>
            <p>Engineering & Construction Contractor</p>
          </div>
          <div class="company-logo">MPP</div>
        </div>
        <div class="title-section">
          <h2>SURAT PENAWARAN</h2>
          <p>QUOTATION</p>
        </div>
      </div>

      <!-- INFO GRID -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Kepada Yth.</span>
          <span class="info-value">${data.customer_name || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nomor Penawaran</span>
          <span class="info-value">${data.proposal_id || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nama Proyek</span>
          <span class="info-value project">${data.project_name || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tanggal</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lokasi</span>
          <span class="info-value">${data.location || 'Jakarta'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nilai Penawaran</span>
          <span class="info-value amount">${formatIDR(data.total_value || 0)}</span>
        </div>
      </div>

      <!-- GREETING -->
      <div class="greeting">
        <p>Dengan hormat,</p>
        <p>
          Menindaklanjuti permintaan penawaran dari Bapak/Ibu untuk proyek 
          <b>${data.project_name || 'tersebut'}</b>, dengan ini kami sampaikan 
          surat penawaran sebagai berikut:
        </p>
      </div>

      <!-- HIGHLIGHT -->
      <div class="highlight">
        <p>
          "Bersama ini kami mengajukan penawaran untuk pekerjaan 
          <b>${data.project_name}</b> dengan nilai penawaran sebesar 
          <b>${formatIDR(data.total_value || 0)}</b> (termasuk PPN)."
        </p>
      </div>

      <!-- FOOTER / SIGNATURE -->
      <div class="footer">
        <div class="signature">
          <div class="signature-title">Hormat Kami,</div>
          <div class="signature-line"></div>
          <div class="signature-name">Budi Santoso</div>
          <div class="signature-position">Direktur Utama</div>
        </div>
        <div class="signature">
          <div class="signature-title">Mengetahui,</div>
          <div class="signature-line"></div>
          <div class="signature-name">Ahmad Rizki</div>
          <div class="signature-position">Manajer Teknik</div>
        </div>
        <div class="signature">
          <div class="signature-title">Disetujui,</div>
          <div class="signature-line"></div>
          <div class="signature-name">__________________</div>
          <div class="signature-position">Customer</div>
        </div>
      </div>

      <!-- WATERMARK -->
      <div class="watermark">MPP</div>
    </div>
  </div>
</body>
</html>
  `
}

// Helper function (taruh di lib/format.ts)
function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
