import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LaporanLCS, User } from '../types';
import { prepareImageForPdf } from './pdfGenerator';

export interface ExcelExportOptions {
  reports: LaporanLCS[];
  currentUser: User;
  bppFilter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Generate dan Unduh File Excel (.xlsx) dengan Penyematan Foto Eviden Proporsional
 */
export async function exportRekapToExcel({
  reports,
  currentUser,
  bppFilter,
  startDate,
  endDate,
}: ExcelExportOptions): Promise<boolean> {
  if (!reports || reports.length === 0) {
    throw new Error('Tidak ada data laporan untuk diekspor ke Excel!');
  }

  // Pre-load dan konversi seluruh foto eviden ke image format
  const reportsWithImages = await Promise.all(
    reports.map(async (r) => {
      const [imgLike, imgShare, imgKomen1, imgKomen2, imgKomen3] = await Promise.all([
        prepareImageForPdf(r.fileLike),
        prepareImageForPdf(r.fileShare),
        prepareImageForPdf(r.fileKomen1),
        prepareImageForPdf(r.fileKomen2),
        prepareImageForPdf(r.fileKomen3),
      ]);

      return {
        report: r,
        images: {
          like: imgLike,
          share: imgShare,
          komen1: imgKomen1,
          komen2: imgKomen2,
          komen3: imgKomen3,
        },
      };
    })
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'E-LCS BPP System';
  workbook.lastModifiedBy = currentUser.nama;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Rekap Eviden LCS', {
    views: [{ showGridLines: true }],
  });

  // Judul Utama (Row 1)
  sheet.mergeCells('A1:M1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'REKAPITULASI LAPORAN EVIDEN LIKE, COMMENT & SHARE (E-LCS)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } }; // Indigo 800
  sheet.getRow(1).height = 32;

  // Sub Judul Info (Row 2)
  sheet.mergeCells('A2:M2');
  const subTitleCell = sheet.getCell('A2');
  subTitleCell.value = `Wilayah: ${bppFilter || 'BPP'} | Periode: ${
    startDate || 'Semua'
  } s.d ${endDate || 'Semua'} | Dicetak oleh: ${currentUser.nama} (${
    currentUser.role === 'admin' ? 'Admin BPP' : 'Penyuluh'
  }) pada ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`;
  subTitleCell.font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FF334155' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  sheet.getRow(2).height = 20;

  // Spasi kosong baris 3
  sheet.getRow(3).height = 8;

  // Header Kolom Tabel (Row 4)
  const headers = [
    'NO',
    'TANGGAL',
    'NIP',
    'NAMA PENYULUH',
    'TEMPAT KERJA / BPP',
    'JUDUL BERITA',
    'LINK BERITA',
    'EVIDEN LIKE',
    'EVIDEN SHARE',
    'KOMENTAR 1',
    'KOMENTAR 2',
    'KOMENTAR 3',
    'STATUS',
  ];
  const headerRow = sheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } }; // Indigo 950
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FFF59E0B' } }, // Gold underline
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  // Pengaturan Lebar Kolom
  sheet.columns = [
    { width: 6 }, // A: NO
    { width: 14 }, // B: TANGGAL
    { width: 22 }, // C: NIP
    { width: 26 }, // D: NAMA PENYULUH
    { width: 22 }, // E: TEMPAT KERJA
    { width: 34 }, // F: JUDUL BERITA
    { width: 28 }, // G: LINK BERITA
    { width: 18 }, // H: EVIDEN LIKE (width 18 approx 135px)
    { width: 18 }, // I: EVIDEN SHARE
    { width: 18 }, // J: KOMENTAR 1
    { width: 18 }, // K: KOMENTAR 2
    { width: 18 }, // L: KOMENTAR 3
    { width: 14 }, // M: STATUS
  ];

  // Mengisi Baris Data Laporan beserta Gambar Eviden
  const maxBoxPx = 100; // Ukuran target foto dalam sel (pixels)

  reportsWithImages.forEach((item, idx) => {
    const r = item.report;
    const rowIndex = 5 + idx; // 1-indexed row number in Excel
    const dataRow = sheet.getRow(rowIndex);

    // Ketinggian baris diatur 95 pt (cukup untuk menampung gambar proporsional ~120px)
    dataRow.height = 90;

    dataRow.values = [
      idx + 1,
      r.tanggal || '-',
      r.nip || '-',
      r.nama || '-',
      r.tempatKerja || '-',
      r.judulBerita || '-',
      r.urlBerita || '-',
      item.images.like ? '' : '-',
      item.images.share ? '' : '-',
      item.images.komen1 ? '' : '-',
      item.images.komen2 ? '' : '-',
      item.images.komen3 ? '' : '-',
      r.status || 'Disetujui',
    ];

    // Styling sel
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Alignment khusus
      if (colNumber === 1 || colNumber === 2 || colNumber === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber >= 8 && colNumber <= 12) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Format status
      if (colNumber === 13) {
        cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF059669' } };
      }
    });

    // Helper fungsi untuk menghitung skala dan menambahkan gambar ke Excel
    const addPhotoToCell = (
      imgObj: { dataUrl: string; width: number; height: number } | null,
      colIndexZeroBased: number
    ) => {
      if (!imgObj || !imgObj.dataUrl) return;

      try {
        const imgId = workbook.addImage({
          base64: imgObj.dataUrl,
          extension: 'jpeg',
        });

        // Hitung aspect ratio foto
        const aspect = imgObj.width / imgObj.height;
        let drawW = maxBoxPx;
        let drawH = drawW / aspect;

        if (drawH > maxBoxPx) {
          drawH = maxBoxPx;
          drawW = drawH * aspect;
        }

        // Posisi tengah horizontal & vertikal dalam sel (0-indexed col & row)
        // Kolom width 18 = ~135px. Baris height 90 = ~120px.
        const colFractionOffset = Math.max(0.04, (135 - drawW) / (2 * 135));
        const rowFractionOffset = Math.max(0.04, (120 - drawH) / (2 * 120));

        sheet.addImage(imgId, {
          tl: {
            col: colIndexZeroBased + colFractionOffset,
            row: rowIndex - 1 + rowFractionOffset,
          },
          ext: { width: Math.round(drawW), height: Math.round(drawH) },
          editAs: 'oneCell',
        });
      } catch (err) {
        console.warn('Excel image embedding error:', err);
      }
    };

    // Embed Gambar di kolom H (col 7), I (col 8), J (col 9), K (col 10), L (col 11)
    addPhotoToCell(item.images.like, 7);
    addPhotoToCell(item.images.share, 8);
    addPhotoToCell(item.images.komen1, 9);
    addPhotoToCell(item.images.komen2, 10);
    addPhotoToCell(item.images.komen3, 11);
  });

  // Lembar Pengesahan Tanda Tangan di bawah tabel
  const totalRows = 5 + reports.length;
  const signStartRow = totalRows + 2;

  const firstReport = reports[0];
  const koordinatorNama =
    firstReport?.namaKoordinator || currentUser.namaKoordinator || 'Ir. H. Sudirman, M.P.';
  const koordinatorNip =
    firstReport?.nipKoordinator || currentUser.nipKoordinator || '197001012000031001';
  const tempatTugas = firstReport?.tempatKerja || currentUser.tempatKerja || 'BPP Karangwareng';

  // Dapatkan nama wilayah dari tempatKerja / bppFilter (misal: "BPP Karangwareng" -> "Karangwareng")
  const rawWilayah = bppFilter || firstReport?.tempatKerja || currentUser.tempatKerja || 'Karangwareng';
  const wilayahNama = rawWilayah.replace(/^BPP\s+/i, '').trim() || 'Karangwareng';
  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Koordinator Sebelah Kiri (Kolom B - D) - Posisi Center
  sheet.mergeCells(`B${signStartRow}:D${signStartRow}`);
  const k1 = sheet.getCell(`B${signStartRow}`);
  k1.value = 'Mengetahui,';
  k1.alignment = { horizontal: 'center' };

  sheet.mergeCells(`B${signStartRow + 1}:D${signStartRow + 1}`);
  const k2 = sheet.getCell(`B${signStartRow + 1}`);
  k2.value = `Koordinator ${tempatTugas}`;
  k2.alignment = { horizontal: 'center' };

  sheet.mergeCells(`B${signStartRow + 4}:D${signStartRow + 4}`);
  const k3 = sheet.getCell(`B${signStartRow + 4}`);
  k3.value = koordinatorNama;
  k3.font = { name: 'Calibri', size: 10, bold: true };
  k3.alignment = { horizontal: 'center' };

  sheet.mergeCells(`B${signStartRow + 5}:D${signStartRow + 5}`);
  const k4 = sheet.getCell(`B${signStartRow + 5}`);
  k4.value = `NIP. ${koordinatorNip}`;
  k4.alignment = { horizontal: 'center' };

  // Petugas Pelapor Sebelah Kanan (Kolom J - L) - Posisi Center
  sheet.mergeCells(`J${signStartRow}:L${signStartRow}`);
  const p1 = sheet.getCell(`J${signStartRow}`);
  p1.value = `${wilayahNama}, ${formattedDate}`;
  p1.alignment = { horizontal: 'center' };

  sheet.mergeCells(`J${signStartRow + 1}:L${signStartRow + 1}`);
  const p2 = sheet.getCell(`J${signStartRow + 1}`);
  p2.value = currentUser.role === 'admin' ? 'Petugas Pelapor / Admin,' : 'Petugas Pelapor,';
  p2.alignment = { horizontal: 'center' };

  sheet.mergeCells(`J${signStartRow + 4}:L${signStartRow + 4}`);
  const p3 = sheet.getCell(`J${signStartRow + 4}`);
  p3.value = currentUser.nama;
  p3.font = { name: 'Calibri', size: 10, bold: true };
  p3.alignment = { horizontal: 'center' };

  sheet.mergeCells(`J${signStartRow + 5}:L${signStartRow + 5}`);
  const p4 = sheet.getCell(`J${signStartRow + 5}`);
  p4.value = `NIP. ${currentUser.nip}`;
  p4.alignment = { horizontal: 'center' };

  // Tulis workbook ke buffer & trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(
    blob,
    `Rekap_Laporan_ELCS_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.xlsx`
  );

  return true;
}
