/**
 * Utility untuk normalisasi dan pemformatan tanggal yang sangat tangguh (robust)
 * Menangani format ISO (YYYY-MM-DD), Indo (DD/MM/YYYY atau DD-MM-YYYY), Google Sheets Date(Y,M,D), dan timestamp.
 */

/**
 * Mengubah string tanggal dari berbagai format menjadi format standar YYYY-MM-DD
 */
export function normalizeDateToISO(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(dateInput).trim();
  if (!str) return new Date().toISOString().split('T')[0];

  // 1. Cek format Google Sheets GViz: "Date(2026,7,27)" (bulan 0-indexed)
  const gvizMatch = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/i);
  if (gvizMatch) {
    const year = gvizMatch[1];
    const month = String(parseInt(gvizMatch[2], 10) + 1).padStart(2, '0');
    const day = String(parseInt(gvizMatch[3], 10)).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 2. Cek format standar YYYY-MM-DD atau YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Cek format Indonesia / umum DD-MM-YYYY atau DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 4. Coba parse dengan native Date
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch {
    // Abaikan dan fallback
  }

  // Jika gagal, kembalikan hari ini
  return new Date().toISOString().split('T')[0];
}

/**
 * Format tanggal ke Bahasa Indonesia ramah baca (contoh: "Kam, 27 Agu 2026")
 * Dijamin tidak akan pernah mengembalikan "Invalid Date"
 */
export function formatIndoDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const iso = normalizeDateToISO(dateInput);
  try {
    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return iso;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return iso;

    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Format tanggal lengkap tanpa hari (contoh: "27 Agustus 2026")
 */
export function formatIndoDateFull(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const iso = normalizeDateToISO(dateInput);
  try {
    const [year, month, day] = iso.split('-').map(Number);
    if (!year || !month || !day) return iso;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return iso;

    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
