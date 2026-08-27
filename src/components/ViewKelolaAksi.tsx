import React, { useState, useEffect, useRef } from 'react';
import { Sliders, PlusCircle, Trash2, ExternalLink, X, RefreshCw, CheckCircle2, Upload } from 'lucide-react';
import { TugasAksi } from '../types';
import { getAksiList, saveAksi, deleteAksi, saveMultipleAksi } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';
import ExcelJS from 'exceljs';

export const ViewKelolaAksi: React.FC = () => {
  const [aksiList, setAksiList] = useState<TugasAksi[]>(() => getAksiList());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [kategori, setKategori] = useState('Instagram');
  const [judul, setJudul] = useState('');
  const [url, setUrl] = useState('');

  const reloadData = () => {
    setAksiList(getAksiList());
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFeedback('Membaca file Excel...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target?.result;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer as ArrayBuffer);
          const worksheet = workbook.worksheets[0];
          
          const newTasks: Omit<TugasAksi, 'id'>[] = [];
          
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const tanggal = row.getCell(1).value?.toString() || new Date().toISOString().split('T')[0];
            const kategori = row.getCell(2).value?.toString() || 'Berita Artikel';
            const judul = row.getCell(3).value?.toString() || '';
            const url = row.getCell(4).value?.toString() || '';
            
            if (judul && url) {
              newTasks.push({ tanggal, kategori, judul, url });
            }
          });
          
          if (newTasks.length > 0) {
            saveMultipleAksi(newTasks);
            reloadData();
            playSuccess();
            setFeedback(`Berhasil mengimpor ${newTasks.length} tugas dari Excel!`);
          } else {
            playErrorSound();
            setFeedback('Tidak ada data tugas yang valid ditemukan dalam file.');
          }
        } catch (err) {
          playErrorSound();
          setFeedback('Gagal memproses file Excel.');
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setIsLoading(false);
      playErrorSound();
      setFeedback('Terjadi kesalahan saat membaca file.');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !url.trim()) {
      playErrorSound();
      return;
    }

    saveAksi({
      tanggal,
      kategori,
      judul: judul.trim(),
      url: url.trim(),
    });

    reloadData();
    setJudul('');
    setUrl('');
    setIsModalOpen(false);
    playSuccess();
    setFeedback('Tugas aksi baru berhasil disimpan!');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus tugas aksi ini?')) {
      deleteAksi(id);
      reloadData();
      playSuccess();
      setFeedback('Tugas aksi berhasil dihapus!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Kelola Tugas Aksi LCS (Admin Panel)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                {aksiList.length} Tugas
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tambah atau hapus penugasan berita harian untuk disebarkan oleh seluruh penyuluh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            accept=".xlsx, .xls"
            className="hidden" 
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold border border-indigo-500/30 cursor-pointer transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Mengimpor...' : 'Upload Excel'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#12141c] text-neutral-400 font-bold uppercase border-b border-white/10">
            <tr>
              <th className="px-4 py-3.5 w-12 text-center">No</th>
              <th className="px-4 py-3.5 w-28">Tanggal</th>
              <th className="px-4 py-3.5 w-32">Kategori</th>
              <th className="px-4 py-3.5">Judul Tugas Berita & URL</th>
              <th className="px-4 py-3.5 w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#181a24]">
            {aksiList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Belum ada daftar tugas aksi. Klik tombol di atas untuk menambah tugas atau upload dari Excel.
                </td>
              </tr>
            ) : (
              aksiList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3.5 text-center text-neutral-500 font-semibold">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 font-medium whitespace-nowrap text-neutral-300">
                    {item.tanggal}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-neutral-100">
                      {item.judul}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 truncate max-w-sm block mt-0.5 hover:underline"
                    >
                      {item.url}
                    </a>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                      title="Hapus tugas ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181a22] border border-white/15 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide">
                  Tambah Tugas Aksi Baru
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                  Tanggal Penugasan
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                  Kategori Platform
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Berita Artikel">Berita Artikel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                  Judul Berita
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gerakan Tanam Padi Serempak..."
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                  URL / Link Berita
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
