import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Filter,
  RotateCcw,
  Clock,
  Layers,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { TugasAksi } from '../types';
import { getAksiList } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';
import { normalizeDateToISO, formatIndoDate } from '../utils/dateUtils';

interface ViewAksiProps {
  onSelectTaskForReport: (task: { judul: string; url: string }) => void;
}

const BULAN_OPTIONS = [
  { value: '01', label: '01 - Januari' },
  { value: '02', label: '02 - Februari' },
  { value: '03', label: '03 - Maret' },
  { value: '04', label: '04 - April' },
  { value: '05', label: '05 - Mei' },
  { value: '06', label: '06 - Juni' },
  { value: '07', label: '07 - Juli' },
  { value: '08', label: '08 - Agustus' },
  { value: '09', label: '09 - September' },
  { value: '10', label: '10 - Oktober' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - Desember' },
];

const TAHUN_OPTIONS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

const HARI_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const d = String(i + 1).padStart(2, '0');
  return { value: d, label: `Tanggal ${d}` };
});

export const ViewAksi: React.FC<ViewAksiProps> = ({ onSelectTaskForReport }) => {
  const [aksiList, setAksiList] = useState<TugasAksi[]>(() => getAksiList());
  const [isLoading, setIsLoading] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Filters
  const [filterMode, setFilterMode] = useState<'dropdownDate' | 'dateParts'>('dropdownDate');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedHari, setSelectedHari] = useState<string>('');
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  const handleCopyLink = (taskId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2500);
  };

  const reloadLocalData = () => {
    setAksiList(getAksiList());
  };

  useEffect(() => {
    // Listen to global sync event
    const handleSyncEvent = () => {
      reloadLocalData();
    };
    window.addEventListener('elcs_data_sync', handleSyncEvent);
    return () => window.removeEventListener('elcs_data_sync', handleSyncEvent);
  }, []);

  // Pastikan daftar aksi selalu terurut dari TANGGAL TERBARU ke terlama (Urutan Descending)
  const sortedAksiList = [...aksiList]
    .map((item) => ({
      ...item,
      tanggal: normalizeDateToISO(item.tanggal),
    }))
    .sort((a, b) => {
      const diff = (b.tanggal || '').localeCompare(a.tanggal || '');
      if (diff !== 0) return diff;
      return (b.id || '').localeCompare(a.id || '');
    });

  // Ambil daftar tanggal unik yang tersedia untuk opsi dropdown
  const availableDates = Array.from(new Set(sortedAksiList.map((t) => t.tanggal))).filter(
    Boolean
  );

  // Ambil kategori unik yang ada
  const availableCategories = Array.from(
    new Set(sortedAksiList.map((t) => t.kategori))
  ).filter(Boolean);

  // Handler Tombol Cepat
  const handleQuickToday = () => {
    const today = normalizeDateToISO(new Date());
    setFilterMode('dropdownDate');
    setSelectedDate(today);
    setSelectedHari('');
    setSelectedBulan('');
    setSelectedTahun('');
  };

  const handleQuickThisMonth = () => {
    const now = new Date();
    const currMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currYear = String(now.getFullYear());
    setFilterMode('dateParts');
    setSelectedDate('');
    setSelectedHari('');
    setSelectedBulan(currMonth);
    setSelectedTahun(currYear);
  };

  const handleResetFilters = () => {
    setSelectedDate('');
    setSelectedHari('');
    setSelectedBulan('');
    setSelectedTahun('');
    setFilterKategori('');
    setSearchKeyword('');
  };

  // Logika Penyaringan (Filter)
  const filteredTasks = sortedAksiList.filter((item) => {
    // 1. Filter Keyword Pencarian
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchUrl = item.url.toLowerCase().includes(q);
      const matchKategori = (item.kategori || '').toLowerCase().includes(q);
      if (!matchJudul && !matchUrl && !matchKategori) return false;
    }

    // 2. Filter Kategori
    if (filterKategori && item.kategori !== filterKategori) {
      return false;
    }

    // 3. Filter Tanggal
    const itemDate = normalizeDateToISO(item.tanggal);
    if (filterMode === 'dropdownDate') {
      if (selectedDate && itemDate !== selectedDate) {
        return false;
      }
    } else {
      const parts = itemDate.split('-'); // [YYYY, MM, DD]
      const year = parts[0] || '';
      const month = parts[1] || '';
      const day = parts[2] || '';

      if (selectedTahun && year !== selectedTahun) return false;
      if (selectedBulan && month !== selectedBulan) return false;
      if (selectedHari && day !== selectedHari) return false;
    }

    return true;
  });

  const isAnyFilterActive =
    Boolean(selectedDate) ||
    Boolean(selectedHari) ||
    Boolean(selectedBulan) ||
    Boolean(selectedTahun) ||
    Boolean(filterKategori) ||
    Boolean(searchKeyword);

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-400 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Daftar Tugas Aksi LCS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {filteredTasks.length} dari {aksiList.length} Tugas
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Urutan teratas menampilkan <strong>tanggal penugasan terbaru</strong>. Pilih tugas untuk disebarkan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{syncFeedback}</span>
        </div>
      )}

      {/* Filter Section with Dropdown / Kaidah Pemilihan Tanggal */}
      <div className="bg-[#1f222e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filter Tanggal & Penugasan Berita</span>
          </div>

          {/* Tab Pilihan Metode Filter Tanggal & Tombol Cepat */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-[#14161f] p-0.5 rounded-xl border border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => {
                  setFilterMode('dropdownDate');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterMode === 'dropdownDate'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pilih Tanggal
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('dateParts');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterMode === 'dateParts'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hari / Bulan / Tahun
              </button>
            </div>

            <button
              type="button"
              onClick={handleQuickToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleQuickThisMonth}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
            >
              Bulan Ini
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Opsi 1: Dropdown Daftar Tanggal */}
          {filterMode === 'dropdownDate' ? (
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Tanggal Penugasan</span>
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs font-semibold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer"
              >
                <option value="">-- Semua Tanggal Penugasan --</option>
                {availableDates.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {formatIndoDate(dateStr)} ({dateStr})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Opsi 2: Dropdown Kaidah Hari, Bulan, dan Tahun */
            <div className="lg:col-span-2 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Hari
                </label>
                <select
                  value={selectedHari}
                  onChange={(e) => setSelectedHari(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="">Semua Hari</option>
                  {HARI_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Bulan
                </label>
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="">Semua Bulan</option>
                  {BULAN_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Tahun
                </label>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="">Semua Tahun</option>
                  {TAHUN_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filter Kategori Media Sosial */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kategori Media</span>
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs font-semibold outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">-- Semua Kategori --</option>
              {availableCategories.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Pencarian Keyword */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Cari Judul / Link Berita</span>
            </label>
            <input
              type="text"
              placeholder="Ketik kata kunci berita..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 placeholder:text-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW: CARD FEED (Android-Optimized) ================= */}
      <div className="block md:hidden space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#141620] border border-white/10 rounded-2xl p-6 text-center text-neutral-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <p className="font-bold text-neutral-200 text-sm">
              Tidak ada tugas aksi yang sesuai dengan filter.
            </p>
            <p className="text-[11px] text-neutral-400">
              Pilih tanggal lain atau reset filter untuk melihat semua tugas.
            </p>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold shadow"
              >
                Tampilkan Semua Tanggal
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#141620] border border-white/10 hover:border-amber-400/30 rounded-2xl p-4 shadow-lg space-y-3 transition-all"
            >
              {/* Top Row: Tanggal & Kategori */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {formatIndoDate(item.tanggal)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.kategori || 'Instagram'}
                </span>
              </div>

              {/* Judul Berita */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {item.judul}
                </h3>
                <button
                  type="button"
                  onClick={() => window.open(item.url, '_blank')}
                  className="text-[11px] text-amber-400/90 hover:text-amber-300 truncate block mt-1 hover:underline font-mono text-left w-full"
                >
                  {item.url}
                </button>
              </div>

              {/* Android Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyLink(item.id, item.url)}
                  className="py-3 px-3 rounded-xl bg-white/10 active:bg-white/20 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all touch-manipulation active:scale-[0.97]"
                >
                  {copiedTaskId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.open(item.url, '_blank')}
                  className="py-3 px-3 rounded-xl bg-indigo-600/30 active:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all touch-manipulation active:scale-[0.97] text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Buka Berita</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSelectTaskForReport({
                      judul: item.judul,
                      url: item.url,
                    })
                  }
                  className="col-span-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-300 text-neutral-950 font-extrabold text-xs shadow-[0_4px_14px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Laporkan Eviden Tugas Ini</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP VIEW: TABLE ================= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-[#141620]">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#10121a] text-neutral-400 font-bold uppercase border-b border-white/10 tracking-wider">
            <tr>
              <th className="px-4 py-3.5 w-12 text-center">No</th>
              <th className="px-4 py-3.5 w-36">Tanggal Penugasan</th>
              <th className="px-4 py-3.5 w-32">Kategori</th>
              <th className="px-4 py-3.5">Judul & Tautan Berita Penugasan</th>
              <th className="px-4 py-3.5 w-44 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#181a24]">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-neutral-200 text-sm">
                      Tidak ada tugas aksi yang sesuai dengan filter tanggal yang dipilih.
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Coba pilih tanggal lain, klik <strong>"Reset"</strong> untuk melihat semua tanggal, atau klik <strong>"Tarik dari Spreadsheet"</strong> untuk memuat data penugasan terbaru.
                    </p>
                    {isAnyFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold shadow transition-all hover:bg-amber-300 cursor-pointer"
                      >
                        Tampilkan Semua Tanggal
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-4 text-center text-neutral-500 font-bold">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-bold text-amber-300">
                      {formatIndoDate(item.tanggal)}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {item.tanggal}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      {item.kategori || 'Instagram'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-neutral-100 text-xs sm:text-sm line-clamp-2">
                      {item.judul}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400/90 hover:text-amber-300 truncate max-w-md block mt-1 hover:underline font-mono"
                    >
                      {item.url}
                    </a>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        window.open(item.url, '_blank');
                        onSelectTaskForReport({
                          judul: item.judul,
                          url: item.url,
                        });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka & Lapor</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
