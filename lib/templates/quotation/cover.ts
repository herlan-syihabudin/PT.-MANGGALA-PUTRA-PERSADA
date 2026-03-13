export function coverTemplate(data: any) {
  // Format tanggal Indonesia
  const formattedDate = new Date(data.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }


  .page {
    max-width: 210mm;
    min-height: 297mm;
    margin: 20px auto;
    background: white;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .page {
  max-width: 210mm;
  min-height: 297mm;
  margin: 20px auto;
  background: white;
  page-break-after: always;
}

  .content {
    padding: 60px 50px;
    padding-bottom: 80px;
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

  /* Subject Line */
  .subject {
    margin: 30px 0 20px;
    padding: 12px 20px;
    background: #f1f5f9;
    border-left: 4px solid #2563eb;
    border-radius: 0 8px 8px 0;
  }

  .subject p {
    font-size: 14px;
    color: #1e293b;
  }

  .subject b {
    color: #2563eb;
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

  /* Highlight */
  .highlight {
    background: linear-gradient(120deg, #dbeafe 0%, #dbeafe 40%, #ffffff 80%);
    padding: 20px 30px;
    border-radius: 12px;
    margin: 30px 0;
    font-style: italic;
    color: #1e40af;
    border-left: 4px solid #2563eb;
  }

  /* Detail Section */
  .detail-section {
    margin: 40px 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
  }

  .detail-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    padding: 16px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    margin: 0;
  }

  .detail-table {
    width: 100%;
    border-collapse: collapse;
  }

  .detail-table tr {
    border-bottom: 1px solid #e2e8f0;
  }

  .detail-table tr:last-child {
    border-bottom: none;
  }

  .detail-table td {
    padding: 14px 20px;
    font-size: 14px;
  }

  .detail-table td:first-child {
    width: 40px;
    color: #94a3b8;
    font-weight: 500;
  }

  .detail-table td:nth-child(2) {
    width: 200px;
    color: #64748b;
    font-weight: 500;
  }

  .detail-table td:nth-child(3) {
    color: #0f172a;
    font-weight: 500;
  }

  .detail-table tr:hover {
    background: #f8fafc;
  }

  /* Footer Signature */
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
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .signature-line {
    border-top: 1px solid #cbd5e1;
    margin: 0 auto 8px;
    width: 80%;
  }

  .signature-name {
    font-weight: 600;
    color: #0f172a;
    font-size: 14px;
  }

  .signature-position {
    font-size: 11px;
    color: #64748b;
  }

  /* Page Footer */
  .page-footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11px;
    color: #94a3b8;
    letter-spacing: 1px;
  }

  /* Watermark */
  .watermark {
    position: absolute;
    bottom: 80px;
    right: 40px;
    opacity: 0.03;
    font-size: 100px;
    font-weight: bold;
    color: #2563eb;
    transform: rotate(-15deg);
    pointer-events: none;
    z-index: 0;
  }

  @media print {
    body { background: white; }
    .page { box-shadow: none; margin: 0; }
  }
</style>

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

    <!-- SUBJECT LINE -->
    <div class="subject">
      <p>
        <b>Perihal :</b> Penawaran Pekerjaan ${data.project_name || '-'}
      </p>
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

    <!-- DETAIL PENAWARAN SECTION -->
    <div class="detail-section">
      <h3>Detail Penawaran</h3>
      <table class="detail-table">
        <tr>
          <td>1</td>
          <td>Nama Pekerjaan</td>
          <td><b>${data.project_name || '-'}</b></td>
        </tr>
        <tr>
          <td>2</td>
          <td>Lokasi Proyek</td>
          <td>${data.location || '-'}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Nilai Penawaran</td>
          <td><b>${formatIDR(data.total_value || 0)}</b></td>
        </tr>
        <tr>
          <td>4</td>
          <td>Harga</td>
          <td>Belum termasuk PPN</td>
        </tr>
        <tr>
          <td>5</td>
          <td>Termin Pembayaran</td>
          <td>50% DP, 50% setelah selesai</td>
        </tr>
        <tr>
          <td>6</td>
          <td>Masa Berlaku Penawaran</td>
          <td>14 hari</td>
        </tr>
        <tr>
          <td>7</td>
          <td>Waktu Pengerjaan</td>
          <td>2 minggu</td>
        </tr>
        <tr>
          <td>8</td>
          <td>Metode Pelaksanaan</td>
          <td>Engineering & Installation</td>
        </tr>
      </table>
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
        <div class="signature-title">Dipersiapkan Oleh,</div>
        <div class="signature-line"></div>
        <div class="signature-name">Budi Santoso</div>
        <div class="signature-position">Estimator</div>
      </div>
      <div class="signature">
        <div class="signature-title">Diperiksa Oleh,</div>
        <div class="signature-line"></div>
        <div class="signature-name">Ahmad Rizki</div>
        <div class="signature-position">Manajer Teknik</div>
      </div>
      <div class="signature">
        <div class="signature-title">Disetujui Oleh,</div>
        <div class="signature-line"></div>
        <div class="signature-name">__________________</div>
        <div class="signature-position">Customer</div>
      </div>
    </div>

    <!-- PAGE FOOTER -->
    <div class="page-footer">
      Page 1
    </div>

    <!-- WATERMARK -->
    <div class="watermark">MPP</div>

  </div>
</div>
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
