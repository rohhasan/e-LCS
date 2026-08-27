import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LaporanLCS, User } from '../types';

/**
 * Konversi image URL / SVG / Base64 menjadi clean JPEG dataURL yang kompatibel 100% dengan jsPDF
 */
export async function prepareImageForPdf(
  sourceUrl?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!sourceUrl || sourceUrl.trim() === '' || sourceUrl === '-') return null;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const naturalW = img.naturalWidth || img.width || 300;
          const naturalH = img.naturalHeight || img.height || 400;

          // Buat canvas untuk render
          const canvas = document.createElement('canvas');
          const maxDim = 600; // Optimal size for high-res PDF without bloating
          let targetW = naturalW;
          let targetH = naturalH;

          if (targetW > maxDim || targetH > maxDim) {
            if (targetW > targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }

          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          // Background putih halus
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);

          // Gambar foto
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            dataUrl,
            width: targetW,
            height: targetH,
          });
        } catch (err) {
          console.warn('Canvas export warning:', err);
          // Fallback if dataURL already valid
          if (sourceUrl.startsWith('data:image/jpeg') || sourceUrl.startsWith('data:image/png')) {
            resolve({ dataUrl: sourceUrl, width: 300, height: 400 });
          } else {
            resolve(null);
          }
        }
      };

      img.onerror = () => {
        console.warn('Image load error for PDF:', sourceUrl.slice(0, 50));
        resolve(null);
      };

      img.src = sourceUrl;
    } catch (e) {
      console.warn('prepareImageForPdf catch:', e);
      resolve(null);
    }
  });
}

export interface PdfExportOptions {
  reports: LaporanLCS[];
  currentUser: User;
  bppFilter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Generate dan Unduh File PDF Rekapitulasi E-LCS dengan Gambar Eviden Proporsional
 */
export async function exportRekapToPdf({
  reports,
  currentUser,
  bppFilter,
  startDate,
  endDate,
}: PdfExportOptions): Promise<boolean> {
  if (!reports || reports.length === 0) {
    throw new Error('Tidak ada data laporan untuk diekspor ke PDF!');
  }

  // Pre-load dan konversi seluruh foto eviden ke image data buffer
  const processedReportsImages = await Promise.all(
    reports.map(async (r) => {
      const [imgLike, imgShare, imgKomen1, imgKomen2, imgKomen3] = await Promise.all([
        prepareImageForPdf(r.fileLike),
        prepareImageForPdf(r.fileShare),
        prepareImageForPdf(r.fileKomen1),
        prepareImageForPdf(r.fileKomen2),
        prepareImageForPdf(r.fileKomen3),
      ]);

      return {
        id: r.id,
        imgLike,
        imgShare,
        imgKomen1,
        imgKomen2,
        imgKomen3,
      };
    })
  );

  // Inisialisasi jsPDF Landscape A4 (297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // Header Banner Atas
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Garis Aksen Emas
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  // Judul Utama
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REKAPITULASI LAPORAN EVIDEN LIKE, COMMENT & SHARE (E-LCS)', pageWidth / 2, 10, {
    align: 'center',
  });

  // Sub Judul
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240); // Slate 200
  const subText = `Wilayah: ${bppFilter || 'BPP'} | Periode: ${
    startDate || 'Semua'
  } s.d ${endDate || 'Semua'} | Dicetak: ${new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  doc.text(subText, pageWidth / 2, 16, { align: 'center' });

  // Ringkasan Baris Kecil
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Total: ${reports.length} Laporan | Petugas Pencetak: ${currentUser.nama} (${
      currentUser.role === 'admin' ? 'Admin BPP' : 'Penyuluh'
    })`,
    pageWidth / 2,
    22,
    { align: 'center' }
  );

  // Definisi Kolom Tabel (Total 11 Kolom)
  // Page Width = 297mm. Margin left 8, right 8 -> Lebar Tabel = 281mm
  const tableHeaders = [
    [
      'NO',
      'TANGGAL',
      'NIP & NAMA PENYULUH',
      'TEMPAT TUGAS',
      'JUDUL & LINK BERITA',
      'EVIDEN LIKE',
      'EVIDEN SHARE',
      'KOMENTAR 1',
      'KOMENTAR 2',
      'KOMENTAR 3',
      'STATUS',
    ],
  ];

  const tableData = reports.map((r, idx) => {
    return [
      (idx + 1).toString(),
      r.tanggal || '-',
      `${r.nama}\nNIP. ${r.nip}`,
      r.tempatKerja || '-',
      `${r.judulBerita || '-'}\n${r.urlBerita || ''}`,
      '', // Placeholder untuk gambar Like
      '', // Placeholder untuk gambar Share
      '', // Placeholder untuk gambar Komen 1
      '', // Placeholder untuk gambar Komen 2
      '', // Placeholder untuk gambar Komen 3
      r.status || 'Disetujui',
    ];
  });

  // Render Tabel Menggunakan autoTable
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 31,
    margin: { left: 7, right: 7, bottom: 20 },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      valign: 'middle',
      lineColor: [203, 213, 225],
      lineWidth: 0.15,
      textColor: [30, 41, 59],
      minCellHeight: 28, // Ruang yang cukup tinggi untuk render foto secara proporsional
    },
    headStyles: {
      fillColor: [55, 48, 163], // Indigo 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      minCellHeight: 9,
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // No
      1: { cellWidth: 17, halign: 'center' }, // Tanggal
      2: { cellWidth: 32 }, // Nama & NIP
      3: { cellWidth: 24 }, // BPP
      4: { cellWidth: 42 }, // Judul & Link
      5: { cellWidth: 28, halign: 'center' }, // Foto Like
      6: { cellWidth: 28, halign: 'center' }, // Foto Share
      7: { cellWidth: 28, halign: 'center' }, // Foto Komen 1
      8: { cellWidth: 28, halign: 'center' }, // Foto Komen 2
      9: { cellWidth: 28, halign: 'center' }, // Foto Komen 3
      10: { cellWidth: 18, halign: 'center' }, // Status
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawCell: (data) => {
      // Pastikan hanya menggambar pada bagian Body
      if (data.section === 'body') {
        const rowIdx = data.row.index;
        const colIdx = data.column.index;
        const imgObj = processedReportsImages[rowIdx];

        if (!imgObj) return;

        let targetImage: { dataUrl: string; width: number; height: number } | null = null;
        let slotName = '';

        if (colIdx === 5) {
          targetImage = imgObj.imgLike;
          slotName = 'Like';
        } else if (colIdx === 6) {
          targetImage = imgObj.imgShare;
          slotName = 'Share';
        } else if (colIdx === 7) {
          targetImage = imgObj.imgKomen1;
          slotName = 'Komen 1';
        } else if (colIdx === 8) {
          targetImage = imgObj.imgKomen2;
          slotName = 'Komen 2';
        } else if (colIdx === 9) {
          targetImage = imgObj.imgKomen3;
          slotName = 'Komen 3';
        }

        if (targetImage && targetImage.dataUrl) {
          const cell = data.cell;
          const padding = 1.2;
          const maxW = cell.width - padding * 2;
          const maxH = cell.height - padding * 2;

          // Kalkulasi dimensi proporsional menjaga aspect ratio asli foto
          const imgAspect = targetImage.width / targetImage.height;
          let drawW = maxW;
          let drawH = drawW / imgAspect;

          if (drawH > maxH) {
            drawH = maxH;
            drawW = drawH * imgAspect;
          }

          // Posisi tengah horizontal & vertikal dalam sel tabel
          const drawX = cell.x + (cell.width - drawW) / 2;
          const drawY = cell.y + (cell.height - drawH) / 2;

          try {
            // Gambar frame border foto
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.1);
            doc.setFillColor(241, 245, 249);
            doc.rect(drawX - 0.2, drawY - 0.2, drawW + 0.4, drawH + 0.4, 'FD');

            // Render gambar langsung ke PDF
            doc.addImage(targetImage.dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
          } catch (err) {
            console.warn('Error drawing image inside PDF cell:', err);
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text('Ada Foto', cell.x + cell.width / 2, cell.y + cell.height / 2, {
              align: 'center',
            });
          }
        } else if (colIdx >= 5 && colIdx <= 9) {
          // Jika tidak ada foto di slot ini
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184); // Slate 400
          doc.text('-', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
            align: 'center',
          });
        }
      }
    },
  });

  // Footer & Lembar Pengesahan Tanda Tangan
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  let signY = finalY + 10;

  // Jika ruang di bawah tabel kurang dari 35mm, buat halaman baru untuk tanda tangan
  if (signY + 35 > pageHeight) {
    doc.addPage();
    signY = 20;
  }

  const firstReport = reports[0];
  const koordinatorNama = firstReport?.namaKoordinator || currentUser.namaKoordinator || 'Ir. H. Sudirman, M.P.';
  const koordinatorNip = firstReport?.nipKoordinator || currentUser.nipKoordinator || '197001012000031001';
  const tempatTugas = firstReport?.tempatKerja || currentUser.tempatKerja || 'BPP Karangwareng';

  // Dapatkan nama wilayah dari tempatKerja / bppFilter (misal: "BPP Karangwareng" -> "Karangwareng")
  const rawWilayah = bppFilter || firstReport?.tempatKerja || currentUser.tempatKerja || 'Karangwareng';
  const wilayahNama = rawWilayah.replace(/^BPP\s+/i, '').trim() || 'Karangwareng';
  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const leftCenterX = 55;
  const rightCenterX = pageWidth - 55;

  // Kolom Tanda Tangan Kiri: Mengetahui Koordinator BPP (Rata Tengah)
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', leftCenterX, signY, { align: 'center' });
  doc.text(`Koordinator ${tempatTugas}`, leftCenterX, signY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(koordinatorNama, leftCenterX, signY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${koordinatorNip}`, leftCenterX, signY + 26, { align: 'center' });

  // Kolom Tanda Tangan Kanan: Petugas Pelapor / Admin (Rata Tengah dengan Tanggal Diawali Wilayah)
  doc.setFont('helvetica', 'normal');
  doc.text(`${wilayahNama}, ${formattedDate}`, rightCenterX, signY, { align: 'center' });
  doc.text(
    currentUser.role === 'admin' ? 'Petugas Pelapor / Admin,' : 'Petugas Pelapor,',
    rightCenterX,
    signY + 4.5,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'bold');
  doc.text(currentUser.nama, rightCenterX, signY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${currentUser.nip}`, rightCenterX, signY + 26, { align: 'center' });

  // Simpan File PDF
  const filename = `Rekap_Laporan_ELCS_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(filename);

  return true;
}
