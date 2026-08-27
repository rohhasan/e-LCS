export type FocusField = 'idle' | 'nip' | 'password';

export interface User {
  nip: string;
  password?: string;
  nama: string;
  tempatKerja: string;
  role: 'admin' | 'penyuluh';
  namaKoordinator: string;
  nipKoordinator: string;
}

export interface LaporanLCS {
  id: string;
  timestamp: string;
  tanggal: string;
  nip: string;
  nama: string;
  tempatKerja: string;
  judulBerita: string;
  urlBerita: string;
  fileLike?: string;
  fileShare?: string;
  fileKomen1?: string;
  fileKomen2?: string;
  fileKomen3?: string;
  status: string;
  namaKoordinator: string;
  nipKoordinator: string;
}

export interface TugasAksi {
  id: string;
  rowIndex?: number;
  tanggal: string;
  kategori: string;
  judul: string;
  url: string;
}

export interface SystemSettings {
  statusBatasJam: 'ya' | 'tidak';
  jamBatasMulai: string;
  jamBatasAkhir: string;
}
