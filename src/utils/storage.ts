import { User, LaporanLCS, TugasAksi, SystemSettings } from '../types';

const STORAGE_KEY_USER = 'elcs_user';
const STORAGE_KEY_USERS_LIST = 'elcs_users_list';
const STORAGE_KEY_REPORTS = 'elcs_reports';
const STORAGE_KEY_AKSI = 'elcs_aksi_list';
const STORAGE_KEY_SETTINGS = 'elcs_settings';

const DEFAULT_USERS: User[] = [
  {
    nip: 'admin',
    password: 'admin123',
    nama: 'Administrator BPP',
    tempatKerja: 'BPP Karangwareng',
    role: 'admin',
    namaKoordinator: 'Ir. H. Sudirman, M.P.',
    nipKoordinator: '197001012000031001',
  },
  {
    nip: '198805122015031002',
    password: 'penyuluh123',
    nama: 'Ahmad Fauzi, S.P.',
    tempatKerja: 'BPP Karangwareng',
    role: 'penyuluh',
    namaKoordinator: 'Ir. H. Sudirman, M.P.',
    nipKoordinator: '197001012000031001',
  },
  {
    nip: '199203142019022004',
    password: 'penyuluh123',
    nama: 'Siti Rahmawati, S.Tr.P.',
    tempatKerja: 'BPP Karangwareng',
    role: 'penyuluh',
    namaKoordinator: 'Ir. H. Sudirman, M.P.',
    nipKoordinator: '197001012000031001',
  },
];

const DEFAULT_AKSI: TugasAksi[] = [
  {
    id: 'AKSI-001',
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Instagram',
    judul: 'Gerakan Tanam Padi Serempak Musim Rendeng 2026 Wilayah Cirebon Timur',
    url: 'https://www.instagram.com/p/kementan_ri_gerakan_tanam/',
  },
  {
    id: 'AKSI-002',
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'TikTok',
    judul: 'Inovasi Pupuk Organik Cair Hayati Mandiri Petani BPP Karangwareng',
    url: 'https://www.tiktok.com/@pusluhtan_kementan/video/7123456789',
  },
  {
    id: 'AKSI-003',
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'YouTube',
    judul: 'Panen Raya Jagung Hibrida Nusantara Bersama Kelompok Tani Binaan BPP',
    url: 'https://www.youtube.com/watch?v=kementan_panen_raya',
  },
  {
    id: 'AKSI-004',
    tanggal: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    kategori: 'Berita Artikel',
    judul: 'Kementan Perkuat Peran Penyuluh Pertanian dalam Transformasi Pertanian Modern',
    url: 'https://pusluhtan.pertanian.go.id/berita/transformasi-penyuluh-2026',
  },
];

// Sample placeholder generator for realistic screenshot previews
const createSampleEviden = (title: string, subtitle: string, colorHex: string = '#4338ca') => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520"><rect width="360" height="520" fill="%23131722"/><rect x="12" y="12" width="336" height="496" rx="16" fill="%231e2433" stroke="%23334155" stroke-width="2"/><circle cx="180" cy="140" r="44" fill="${encodeURIComponent(colorHex)}" opacity="0.45"/><path d="M165 140 L175 150 L195 130" stroke="%23ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="180" y="225" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="18" font-family="sans-serif" font-weight="bold">${encodeURIComponent(title)}</text><text x="180" y="255" dominant-baseline="middle" text-anchor="middle" fill="%23f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">EVIDEN TERVERIFIKASI</text><rect x="40" y="290" width="280" height="50" rx="10" fill="%230f131c"/><text x="180" y="320" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12" font-family="sans-serif">${encodeURIComponent(subtitle)}</text><rect x="40" y="360" width="280" height="80" rx="10" fill="%230f131c" opacity="0.6"/><text x="60" y="390" fill="%2364748b" font-size="11" font-family="sans-serif">Status: Selesai</text><text x="60" y="415" fill="%2364748b" font-size="11" font-family="sans-serif">Akun: Resmi BPP</text></svg>`;
};

const SAMPLE_LIKE = createSampleEviden('BUKTI LIKE', 'Tangkapan Layar Like Postingan', '#f59e0b');
const SAMPLE_SHARE = createSampleEviden('BUKTI SHARE', 'Tangkapan Layar Bagikan / Repost', '#38bdf8');
const SAMPLE_KOMEN1 = createSampleEviden('KOMENTAR 1', 'Tangkapan Layar Komentar Pendukung', '#10b981');
const SAMPLE_KOMEN2 = createSampleEviden('KOMENTAR 2', 'Tangkapan Layar Diskusi & Feedback', '#8b5cf6');
const SAMPLE_KOMEN3 = createSampleEviden('KOMENTAR 3', 'Tangkapan Layar Edukasi Penyuluhan', '#ec4899');

const DEFAULT_REPORTS: LaporanLCS[] = [
  {
    id: 'LCS-20260827-081522',
    timestamp: '2026-08-27 08:15:22',
    tanggal: new Date().toISOString().split('T')[0],
    nip: '198805122015031002',
    nama: 'Ahmad Fauzi, S.P.',
    tempatKerja: 'BPP Karangwareng',
    judulBerita: 'Gerakan Tanam Padi Serempak Musim Rendeng 2026 Wilayah Cirebon Timur',
    urlBerita: 'https://www.instagram.com/p/kementan_ri_gerakan_tanam/',
    fileLike: SAMPLE_LIKE,
    fileShare: SAMPLE_SHARE,
    fileKomen1: SAMPLE_KOMEN1,
    fileKomen2: SAMPLE_KOMEN2,
    fileKomen3: SAMPLE_KOMEN3,
    status: 'Disetujui',
    namaKoordinator: 'Ir. H. Sudirman, M.P.',
    nipKoordinator: '197001012000031001',
  },
  {
    id: 'LCS-20260826-141010',
    timestamp: '2026-08-26 14:10:10',
    tanggal: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    nip: '199203142019022004',
    nama: 'Siti Rahmawati, S.Tr.P.',
    tempatKerja: 'BPP Karangwareng',
    judulBerita: 'Inovasi Pupuk Organik Cair Hayati Mandiri Petani BPP Karangwareng',
    urlBerita: 'https://www.tiktok.com/@pusluhtan_kementan/video/7123456789',
    fileLike: SAMPLE_LIKE,
    fileShare: SAMPLE_SHARE,
    fileKomen1: SAMPLE_KOMEN1,
    fileKomen2: SAMPLE_KOMEN2,
    status: 'Disetujui',
    namaKoordinator: 'Ir. H. Sudirman, M.P.',
    nipKoordinator: '197001012000031001',
  },
];

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

export function getUsersList(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    if (raw) {
      const parsed: User[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasAdmin = parsed.some(
          (u) => u.nip.toLowerCase() === 'admin' || u.role === 'admin'
        );
        if (!hasAdmin) {
          parsed.unshift(DEFAULT_USERS[0]);
          localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUser(user: User) {
  const users = getUsersList();
  const existingIdx = users.findIndex((u) => u.nip.trim() === user.nip.trim());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
}

export function deleteUser(nip: string) {
  const users = getUsersList().filter((u) => u.nip.trim() !== nip.trim());
  localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
}

export function updateUserCredentials(oldNip: string, updatedUser: User) {
  const users = getUsersList();
  const index = users.findIndex((u) => u.nip.trim() === oldNip.trim());
  if (index >= 0) {
    users[index] = updatedUser;
  } else {
    users.push(updatedUser);
  }
  localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
}

export function getAksiList(): TugasAksi[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AKSI);
    const list: TugasAksi[] = raw ? JSON.parse(raw) : DEFAULT_AKSI;
    return [...list].sort((a, b) => {
      // Sort descending by tanggal (YYYY-MM-DD), then by ID
      const dateDiff = (b.tanggal || '').localeCompare(a.tanggal || '');
      if (dateDiff !== 0) return dateDiff;
      return (b.id || '').localeCompare(a.id || '');
    });
  } catch {
    return [...DEFAULT_AKSI].sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }
}

export function saveAksi(item: Omit<TugasAksi, 'id'>) {
  const list = getAksiList();
  const newItem: TugasAksi = {
    ...item,
    id: 'AKSI-' + Date.now(),
  };
  list.unshift(newItem);
  localStorage.setItem(STORAGE_KEY_AKSI, JSON.stringify(list));

  return newItem;
}

export function saveMultipleAksi(items: Omit<TugasAksi, 'id'>[]) {
  const list = getAksiList();
  const newItems = items.map((item, index) => ({
    ...item,
    id: 'AKSI-' + Date.now() + '-' + index,
  }));
  const updatedList = [...newItems, ...list];
  localStorage.setItem(STORAGE_KEY_AKSI, JSON.stringify(updatedList));
  return newItems;
}

export function deleteAksi(id: string) {
  const list = getAksiList().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY_AKSI, JSON.stringify(list));
}

export function getReportsList(): LaporanLCS[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(DEFAULT_REPORTS));
    return DEFAULT_REPORTS;
  } catch {
    return DEFAULT_REPORTS;
  }
}

export function submitReport(report: Omit<LaporanLCS, 'id' | 'timestamp' | 'status'>) {
  const list = getReportsList();
  const now = new Date();
  const timeStr = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const idStr = 'LCS-' + now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  const newReport: LaporanLCS = {
    ...report,
    id: idStr,
    timestamp: timeStr,
    status: 'Disetujui',
  };

  list.unshift(newReport);
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(list));

  return newReport;
}

export function getSystemSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
    const defaults: SystemSettings = {
      statusBatasJam: 'tidak',
      jamBatasMulai: '00:00',
      jamBatasAkhir: '23:59',
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaults));
    return defaults;
  } catch {
    return {
      statusBatasJam: 'tidak',
      jamBatasMulai: '00:00',
      jamBatasAkhir: '23:59',
    };
  }
}

export function saveSystemSettings(settings: SystemSettings) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}
