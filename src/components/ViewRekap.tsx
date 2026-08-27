import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Search,
  RotateCcw,
  Users,
  Calendar,
  Layers,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  Image as ImageIcon,
  ThumbsUp,
  Share2,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { User, LaporanLCS } from '../types';
import { getReportsList, getUsersList } from '../utils/storage';
import { exportRekapToPdf } from '../utils/pdfGenerator';
import { exportRekapToExcel } from '../utils/excelGenerator';
import { playSuccess, playErrorSound } from '../utils/sound';
import { normalizeDateToISO, formatIndoDate } from '../utils/dateUtils';

interface ViewRekapProps {
  user: User;
  onViewImage: (url: string, title: string) => void;
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

export const ViewRekap: React.FC<ViewRekapProps> = ({ user, onViewImage }) => {
  const isAdmin = user.role === 'admin';
  const [allReports, setAllReports] = useState<LaporanLCS[]>(() => getReportsList());
  const [allUsers, setAllUsers] = useState<User[]>(() => getUsersList());
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [bppFilter, setBppFilter] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'dropdown' | 'parts' | 'range'>('dropdown');
  const [selectedReportDate, setSelectedReportDate] = useState('');
  const [selectedHari, setSelectedHari] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isKeaktifanOpen, setIsKeaktifanOpen] = useState(false);

  const reloadData = () => {
    setAllReports(getReportsList());
    setAllUsers(getUsersList());
  };

  useEffect(() => {
    const handleSync = () => reloadData();
    window.addEventListener('elcs_data_sync', handleSync);
    return () => window.removeEventListener('elcs_data_sync', handleSync);
  }, []);

  // Pastikan data terurut dengan tanggal terbaru di atas
  const sortedReports = [...allReports]
    .map((r) => ({
      ...r,
      tanggal: normalizeDateToISO(r.tanggal),
    }))
    .sort((a, b) => {
      const d = (b.tanggal || '').localeCompare(a.tanggal || '');
      if (d !== 0) return d;
      return (b.timestamp || '').localeCompare(a.timestamp || '');
    });

  // Relevant dataset: If not admin, only show current user's reports
  const userDataset = isAdmin
    ? sortedReports
    : sortedReports.filter((r) => r.nip === user.nip);

  // Daftar tanggal unik dari laporan yang ada untuk dropdown opsi
  const availableReportDates = Array.from(
    new Set(userDataset.map((r) => r.tanggal))
  ).filter(Boolean);

  // Filter application
  const filteredReports = userDataset.filter((r) => {
    const q = keyword.toLowerCase();
    const matchQ =
      !q ||
      r.nama.toLowerCase().includes(q) ||
      r.nip.toLowerCase().includes(q) ||
      r.judulBerita.toLowerCase().includes(q);

    const matchBpp = !bppFilter || r.tempatKerja === bppFilter;

    let matchDate = true;
    const rDate = normalizeDateToISO(r.tanggal);

    if (dateFilterMode === 'dropdown') {
      if (selectedReportDate && rDate !== selectedReportDate) {
        matchDate = false;
      }
    } else if (dateFilterMode === 'parts') {
      const parts = rDate.split('-');
      const y = parts[0] || '';
      const m = parts[1] || '';
      const d = parts[2] || '';
      if (selectedTahun && y !== selectedTahun) matchDate = false;
      if (selectedBulan && m !== selectedBulan) matchDate = false;
      if (selectedHari && d !== selectedHari) matchDate = false;
    } else {
      if (startDate && rDate < startDate) matchDate = false;
      if (endDate && rDate > endDate) matchDate = false;
    }

    return matchQ && matchBpp && matchDate;
  });

  // Unique BPPs
  const bppOptions = Array.from(
    new Set(allReports.map((r) => r.tempatKerja).filter(Boolean))
  );

  // Handler tombol cepat
  const handleQuickToday = () => {
    const today = normalizeDateToISO(new Date());
    setDateFilterMode('dropdown');
    setSelectedReportDate(today);
    setSelectedHari('');
    setSelectedBulan('');
    setSelectedTahun('');
    setStartDate('');
    setEndDate('');
  };

  const handleQuickThisMonth = () => {
    const now = new Date();
    const currMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currYear = String(now.getFullYear());
    setDateFilterMode('parts');
    setSelectedReportDate('');
    setSelectedHari('');
    setSelectedBulan(currMonth);
    setSelectedTahun(currYear);
    setStartDate('');
    setEndDate('');
  };

  const handleResetFilters = () => {
    setKeyword('');
    setBppFilter('');
    setSelectedReportDate('');
    setSelectedHari('');
    setSelectedBulan('');
    setSelectedTahun('');
    setStartDate('');
    setEndDate('');
  };

  const isAnyFilterActive =
    Boolean(keyword) ||
    Boolean(bppFilter) ||
    Boolean(selectedReportDate) ||
    Boolean(selectedHari) ||
    Boolean(selectedBulan) ||
    Boolean(selectedTahun) ||
    Boolean(startDate) ||
    Boolean(endDate);

  // Stats for Admin
  const totalReports = allReports.length;
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const reportsThisMonth = allReports.filter((r) =>
    r.tanggal.startsWith(currentMonthStr)
  ).length;
  const uniqueActiveNips = new Set(allReports.map((r) => r.nip)).size;

  // 1. Export to Excel (.xlsx) with Embedded Images
  const handleExportExcel = async () => {
    if (filteredReports.length === 0) {
      setFeedback({ type: 'error', message: 'Tidak ada data laporan untuk diekspor ke Excel!' });
      playErrorSound();
      return;
    }

    setIsExportingExcel(true);
    setFeedback({
      type: 'success',
      message: 'Sedang memproses dan menyematkan foto eviden ke dalam file Excel...',
    });

    try {
      await exportRekapToExcel({
        reports: filteredReports,
        currentUser: user,
        bppFilter: bppFilter,
        startDate: startDate,
        endDate: endDate,
      });

      setFeedback({
        type: 'success',
        message: 'File Excel (.xlsx) dengan foto eviden proporsional berhasil diunduh!',
      });
      playSuccess();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error('Excel Export Error:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal membuat file Excel dengan foto.',
      });
      playErrorSound();
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. Export to PDF (.pdf) with Embedded Images
  const handleExportPdf = async () => {
    if (filteredReports.length === 0) {
      setFeedback({ type: 'error', message: 'Tidak ada data laporan untuk diekspor ke PDF!' });
      playErrorSound();
      return;
    }

    setIsExportingPdf(true);
    setFeedback({
      type: 'success',
      message: 'Sedang memproses dan menyematkan foto eviden ke dalam dokumen PDF...',
    });

    try {
      await exportRekapToPdf({
        reports: filteredReports,
        currentUser: user,
        bppFilter: bppFilter,
        startDate: startDate,
        endDate: endDate,
      });

      setFeedback({
        type: 'success',
        message: 'File PDF dengan foto eviden proporsional berhasil diunduh!',
      });
      playSuccess();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal membuat dokumen PDF.',
      });
      playErrorSound();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isAdmin ? 'Dashboard Rekapitulasi Seluruh Penyuluh' : 'Dashboard Rekapitulasi Laporan'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isAdmin
                ? 'Pantau keaktifan, bukti eviden Like/Share/Komentar, dan unduh laporan resmi BPP'
                : 'Histori dan arsip bukti eviden Like, Share, dan Komentar yang telah Anda laporkan'}
            </p>
          </div>
        </div>

        {/* Action Download Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Unduh Excel */}
          <button
            type="button"
            disabled={isExportingExcel}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            title="Unduh Rekap Format Microsoft Excel (.xlsx) Lengkap Beserta Foto Eviden"
          >
            {isExportingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            )}
            <span>{isExportingExcel ? 'Menyiapkan Excel...' : 'Unduh Excel'}</span>
          </button>

          {/* Unduh PDF */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            title="Unduh Rekap Dokumen PDF Lengkap Beserta Foto Eviden"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <FileDown className="w-4 h-4 text-amber-300" />
            )}
            <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Unduh PDF'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Admin Stat Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-gradient-to-br from-[#1d2130] to-[#151722] border border-indigo-500/25 rounded-2xl p-4 shadow-lg">
            <div className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Total Laporan Masuk</span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">
              {totalReports}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1d2130] to-[#151722] border border-amber-500/25 rounded-2xl p-4 shadow-lg">
            <div className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Laporan Bulan Ini</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {reportsThisMonth}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1d2130] to-[#151722] border border-emerald-500/25 rounded-2xl p-4 shadow-lg">
            <div className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Penyuluh Aktif</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">
              {uniqueActiveNips}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Keaktifan (Admin) */}
      {isAdmin && (
        <div className="bg-[#1f222e] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <Users className="w-4 h-4" />
              <span>Monitoring Keaktifan Penyuluh BPP</span>
            </div>
            <button
              onClick={() => setIsKeaktifanOpen(!isKeaktifanOpen)}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{isKeaktifanOpen ? 'Tutup Detail' : 'Lihat Detail'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isKeaktifanOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {isKeaktifanOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/5 animate-fade-in">
              {allUsers
                .filter((u) => u.role !== 'admin')
                .map((u) => {
                  const count = allReports.filter((r) => r.nip === u.nip).length;
                  return (
                    <div
                      key={u.nip}
                      className="p-2.5 rounded-xl bg-[#161822] border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-neutral-200 truncate">
                          {u.nama}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {u.tempatKerja}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          count > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {count > 0 ? `${count} Lapor` : 'Belum Lapor'}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#1f222e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Header Filter with Mode Switcher & Quick Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Filter Laporan & Tanggal</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-[#14161f] p-0.5 rounded-xl border border-white/10 flex items-center">
              <button
                type="button"
                onClick={() => setDateFilterMode('dropdown')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  dateFilterMode === 'dropdown'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pilih Tanggal
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('parts')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  dateFilterMode === 'parts'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hari / Bulan / Tahun
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('range')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  dateFilterMode === 'range'
                    ? 'bg-amber-400 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Rentang
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

        {/* Input Elements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          {/* Pencarian Keyword */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Pencarian Kata Kunci</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Cari Nama / NIP / Berita..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Filter BPP untuk Admin */}
          {isAdmin ? (
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filter Wilayah BPP</span>
              </label>
              <select
                value={bppFilter}
                onChange={(e) => setBppFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">-- Semua Wilayah BPP --</option>
                {bppOptions.map((bpp) => (
                  <option key={bpp} value={bpp}>
                    {bpp}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                Wilayah Tugas
              </label>
              <div className="px-3 py-2 bg-[#161822] border border-neutral-800 rounded-xl text-neutral-400 text-xs font-semibold">
                {user.tempatKerja}
              </div>
            </div>
          )}

          {/* Tanggal Controls depending on Mode */}
          {dateFilterMode === 'dropdown' && (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Tanggal Laporan</span>
              </label>
              <select
                value={selectedReportDate}
                onChange={(e) => setSelectedReportDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs font-semibold outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">-- Semua Tanggal Laporan --</option>
                {availableReportDates.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {formatIndoDate(dateStr)} ({dateStr})
                  </option>
                ))}
              </select>
            </div>
          )}

          {dateFilterMode === 'parts' && (
            <div className="sm:col-span-2 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Hari
                </label>
                <select
                  value={selectedHari}
                  onChange={(e) => setSelectedHari(e.target.value)}
                  className="w-full px-2 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
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
                  className="w-full px-2 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
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
                  className="w-full px-2 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
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

          {dateFilterMode === 'range' && (
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161822] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE VIEW: REPORT CARDS (Android-Optimized) ================= */}
      <div className="block md:hidden space-y-3.5">
        {filteredReports.length === 0 ? (
          <div className="bg-[#12141c] border border-white/10 rounded-2xl p-6 text-center text-neutral-400 space-y-2">
            <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-xs font-semibold">
              Tidak ada laporan eviden yang sesuai dengan kriteria pencarian.
            </div>
          </div>
        ) : (
          filteredReports.map((r, idx) => (
            <div
              key={r.id}
              className="bg-[#141622] border border-white/10 hover:border-amber-400/30 rounded-2xl p-4 shadow-lg space-y-3"
            >
              {/* Header: No, Nama, Tanggal, Status */}
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {r.nama}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    NIP. {r.nip} • {r.tempatKerja}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {r.status || 'Disetujui'}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300">
                    {formatIndoDate(r.tanggal)}
                  </span>
                </div>
              </div>

              {/* Judul Berita */}
              <div>
                <div className="text-xs font-bold text-neutral-100 line-clamp-2">
                  {r.judulBerita}
                </div>
                {r.urlBerita && (
                  <a
                    href={r.urlBerita}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-400 hover:text-amber-300 truncate block mt-0.5 hover:underline font-mono"
                  >
                    {r.urlBerita}
                  </a>
                )}
              </div>

              {/* 5 Foto Eviden Grid (Touch-to-Zoom on Mobile) */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Foto Eviden (Ketuk untuk Memperbesar)
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                  <MobileMiniPhoto
                    image={r.fileLike}
                    label="Like"
                    color="text-amber-400"
                    onView={() => onViewImage(r.fileLike!, `Eviden Like - ${r.nama} (${r.tanggal})`)}
                  />
                  <MobileMiniPhoto
                    image={r.fileShare}
                    label="Share"
                    color="text-sky-400"
                    onView={() => onViewImage(r.fileShare!, `Eviden Share - ${r.nama} (${r.tanggal})`)}
                  />
                  <MobileMiniPhoto
                    image={r.fileKomen1}
                    label="Komen 1"
                    color="text-emerald-400"
                    onView={() => onViewImage(r.fileKomen1!, `Eviden Komentar 1 - ${r.nama} (${r.tanggal})`)}
                  />
                  <MobileMiniPhoto
                    image={r.fileKomen2}
                    label="Komen 2"
                    color="text-emerald-400"
                    onView={() => onViewImage(r.fileKomen2!, `Eviden Komentar 2 - ${r.nama} (${r.tanggal})`)}
                  />
                  <MobileMiniPhoto
                    image={r.fileKomen3}
                    label="Komen 3"
                    color="text-emerald-400"
                    onView={() => onViewImage(r.fileKomen3!, `Eviden Komentar 3 - ${r.nama} (${r.tanggal})`)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP VIEW: FULL TABLE ================= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-[#12141c]">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#1e212c] text-neutral-300 font-bold uppercase text-[11px] border-b border-white/10 tracking-wider">
            <tr>
              <th className="px-3 py-3.5 w-10 text-center">No</th>
              <th className="px-3 py-3.5 w-24">Tanggal</th>
              <th className="px-3 py-3.5 min-w-[160px]">Penyuluh</th>
              <th className="px-3 py-3.5 min-w-[130px]">Tempat Kerja</th>
              <th className="px-3 py-3.5 min-w-[200px]">Judul Berita & Link</th>
              <th className="px-3 py-3.5 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-amber-400">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Foto Like</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-sky-400">
                  <Share2 className="w-3 h-3" />
                  <span>Foto Share</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>Komentar 1</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>Komentar 2</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>Komentar 3</span>
                </div>
              </th>
              <th className="px-3 py-3.5 text-center w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#181a24]">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-neutral-600" />
                    <span>Tidak ada laporan eviden yang sesuai dengan kriteria pencarian.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map((r, idx) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* No */}
                  <td className="px-3 py-4 text-center text-neutral-500 font-semibold align-middle">
                    {idx + 1}
                  </td>

                  {/* Tanggal */}
                  <td className="px-3 py-4 font-medium whitespace-nowrap text-neutral-200 align-middle">
                    {r.tanggal}
                  </td>

                  {/* Nama & NIP */}
                  <td className="px-3 py-4 align-middle">
                    <div className="font-bold text-white text-xs">{r.nama}</div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      NIP. {r.nip}
                    </div>
                  </td>

                  {/* Tempat Kerja */}
                  <td className="px-3 py-4 font-medium text-neutral-300 align-middle">
                    {r.tempatKerja}
                  </td>

                  {/* Judul Berita & Link */}
                  <td className="px-3 py-4 align-middle max-w-xs">
                    <div className="font-semibold text-neutral-100 line-clamp-2" title={r.judulBerita}>
                      {r.judulBerita}
                    </div>
                    {r.urlBerita && (
                      <a
                        href={r.urlBerita}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400/90 hover:text-amber-300 truncate block mt-1 hover:underline font-mono"
                        title={r.urlBerita}
                      >
                        {r.urlBerita}
                      </a>
                    )}
                  </td>

                  {/* Kolom Foto Like */}
                  <td className="px-2.5 py-3 text-center align-middle">
                    <ProportionalPhotoCell
                      image={r.fileLike}
                      label={`Eviden Like - ${r.nama}`}
                      onView={() => onViewImage(r.fileLike!, `Eviden Like - ${r.nama} (${r.tanggal})`)}
                    />
                  </td>

                  {/* Kolom Foto Share */}
                  <td className="px-2.5 py-3 text-center align-middle">
                    <ProportionalPhotoCell
                      image={r.fileShare}
                      label={`Eviden Share - ${r.nama}`}
                      onView={() => onViewImage(r.fileShare!, `Eviden Share - ${r.nama} (${r.tanggal})`)}
                    />
                  </td>

                  {/* Kolom Foto Komentar 1 */}
                  <td className="px-2.5 py-3 text-center align-middle">
                    <ProportionalPhotoCell
                      image={r.fileKomen1}
                      label={`Eviden Komentar 1 - ${r.nama}`}
                      onView={() => onViewImage(r.fileKomen1!, `Eviden Komentar 1 - ${r.nama} (${r.tanggal})`)}
                    />
                  </td>

                  {/* Kolom Foto Komentar 2 */}
                  <td className="px-2.5 py-3 text-center align-middle">
                    <ProportionalPhotoCell
                      image={r.fileKomen2}
                      label={`Eviden Komentar 2 - ${r.nama}`}
                      onView={() => onViewImage(r.fileKomen2!, `Eviden Komentar 2 - ${r.nama} (${r.tanggal})`)}
                    />
                  </td>

                  {/* Kolom Foto Komentar 3 */}
                  <td className="px-2.5 py-3 text-center align-middle">
                    <ProportionalPhotoCell
                      image={r.fileKomen3}
                      label={`Eviden Komentar 3 - ${r.nama}`}
                      onView={() => onViewImage(r.fileKomen3!, `Eviden Komentar 3 - ${r.nama} (${r.tanggal})`)}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4 text-center align-middle">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      {r.status || 'Disetujui'}
                    </span>
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

/**
 * Sub-komponen Kartu Thumbnail Foto Proporsional dengan zoom modal
 */
const ProportionalPhotoCell: React.FC<{
  image?: string;
  label: string;
  onView: () => void;
}> = ({ image, label, onView }) => {
  if (!image || image.trim() === '' || image === '-') {
    return <span className="text-neutral-600 text-xs font-semibold">-</span>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        type="button"
        onClick={onView}
        className="group relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-neutral-700/80 bg-black/60 hover:border-amber-400 shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-105"
        title={`Klik untuk memperbesar ${label}`}
      >
        <img
          src={image}
          alt={label}
          className="w-full h-full object-contain p-0.5 group-hover:opacity-90 transition-opacity"
          loading="lazy"
        />
        {/* Overlay Hover Zoom Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-1 rounded-lg bg-amber-400 text-neutral-950 shadow-md">
            <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </button>
      <span className="text-[9px] text-neutral-400 mt-1 font-medium group-hover:text-amber-300">
        Klik Zoom
      </span>
    </div>
  );
};

const MobileMiniPhoto: React.FC<{
  image?: string;
  label: string;
  color: string;
  onView: () => void;
}> = ({ image, label, color, onView }) => {
  if (!image || image.trim() === '' || image === '-') {
    return (
      <div className="h-16 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 flex flex-col items-center justify-center p-1 text-center">
        <span className={`text-[9px] font-bold ${color}`}>{label}</span>
        <span className="text-[8px] text-neutral-600">Kosong</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onView}
      className="h-16 rounded-xl overflow-hidden border border-neutral-700 active:border-amber-400 bg-black/50 flex flex-col items-center justify-between p-1 shadow-sm transition-all touch-manipulation active:scale-95 cursor-pointer relative"
    >
      <img
        src={image}
        alt={label}
        className="w-full h-9 object-contain rounded"
        loading="lazy"
      />
      <span className={`text-[9px] font-bold ${color} truncate w-full text-center mt-0.5`}>
        {label}
      </span>
    </button>
  );
};

