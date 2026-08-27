import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Camera,
  Check,
} from 'lucide-react';
import { User, LaporanLCS } from '../types';
import { getSystemSettings, submitReport } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';

interface ViewInputProps {
  user: User;
  initialTask?: { judul: string; url: string } | null;
  onSubmitted: () => void;
}

export const ViewInput: React.FC<ViewInputProps> = ({
  user,
  initialTask,
  onSubmitted,
}) => {
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [nama, setNama] = useState(user.nama);
  const [nip, setNip] = useState(user.nip);
  const [tempatKerja, setTempatKerja] = useState(user.tempatKerja);
  const [judulBerita, setJudulBerita] = useState(initialTask?.judul || '');
  const [urlBerita, setUrlBerita] = useState(initialTask?.url || '');

  // 5 Eviden Photos
  const [fileLike, setFileLike] = useState<string>('');
  const [fileShare, setFileShare] = useState<string>('');
  const [fileKomen1, setFileKomen1] = useState<string>('');
  const [fileKomen2, setFileKomen2] = useState<string>('');
  const [fileKomen3, setFileKomen3] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Time limit check
  const [timeLock, setTimeLock] = useState<{ isLocked: boolean; reason: string }>({
    isLocked: false,
    reason: '',
  });

  useEffect(() => {
    if (initialTask) {
      setJudulBerita(initialTask.judul);
      setUrlBerita(initialTask.url);
    }
  }, [initialTask]);

  useEffect(() => {
    const settings = getSystemSettings();
    if (settings.statusBatasJam === 'ya') {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (currentTimeStr < settings.jamBatasMulai) {
        setTimeLock({
          isLocked: true,
          reason: `Pelaporan hari ini belum dibuka (Jam operasional: ${settings.jamBatasMulai} - ${settings.jamBatasAkhir} WIB).`,
        });
      } else if (currentTimeStr > settings.jamBatasAkhir) {
        setTimeLock({
          isLocked: true,
          reason: `Waktu laporan hari ini telah berakhir (${settings.jamBatasAkhir} WIB). Silakan melakukan pelaporan esok hari.`,
        });
      } else {
        setTimeLock({ isLocked: false, reason: '' });
      }
    } else {
      setTimeLock({ isLocked: false, reason: '' });
    }
  }, []);

  // Image compressor helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleSingleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (b64: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await compressImage(e.target.files[0]);
      setter(b64);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files: File[] = Array.from(e.target.files);
    const setters = [setFileLike, setFileShare, setFileKomen1, setFileKomen2, setFileKomen3];

    for (let i = 0; i < files.length && i < setters.length; i++) {
      const b64 = await compressImage(files[i]);
      setters[i](b64);
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (timeLock.isLocked) {
      setError(timeLock.reason);
      playErrorSound();
      return;
    }

    if (!fileLike && !fileShare && !fileKomen1) {
      setError('Harap upload minimal 1 foto eviden (Like, Share, atau Komentar)!');
      playErrorSound();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      submitReport({
        tanggal,
        nama,
        nip,
        tempatKerja,
        judulBerita,
        urlBerita,
        fileLike,
        fileShare,
        fileKomen1,
        fileKomen2,
        fileKomen3,
        namaKoordinator: user.namaKoordinator,
        nipKoordinator: user.nipKoordinator,
      });

      setIsSubmitting(false);
      setSuccess(true);
      playSuccess();

      setTimeout(() => {
        onSubmitted();
      }, 1200);
    }, 600);
  };

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Form Input Eviden Harian
          </h2>
          <p className="text-xs text-neutral-400">
            Kirimkan tangkapan layar bukti Like, Share, dan Komentar Anda
          </p>
        </div>
      </div>

      {/* Time Lock Alert */}
      {timeLock.isLocked && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <Clock className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="font-bold">Batas Jam Pelaporan Aktif</div>
            <div>{timeLock.reason}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 text-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Laporan LCS Berhasil Disimpan & Otomatis Disetujui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identitas Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Tanggal Pelaporan
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Nama Penyuluh
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              NIP Penyuluh
            </label>
            <input
              type="text"
              required
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Tempat Kerja / BPP
            </label>
            <input
              type="text"
              required
              value={tempatKerja}
              onChange={(e) => setTempatKerja(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Berita Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Judul Berita yang di-Share
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gerakan Tanam Padi Serempak..."
              value={judulBerita}
              onChange={(e) => setJudulBerita(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
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
              value={urlBerita}
              onChange={(e) => setUrlBerita(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#20232e] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Smart Bulk Upload Card */}
        <div className="bg-gradient-to-r from-indigo-950/70 via-indigo-900/40 to-neutral-900/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Upload Cepat 5 Foto Sekaligus dari Galeri HP</span>
          </div>
          <p className="text-xs text-neutral-300">
            Pilih 5 foto screenshot bukti Like, Share, dan Komentar Anda sekaligus dari galeri HP Android. Sistem otomatis menempatkannya ke tiap slot.
          </p>
          <label className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all touch-manipulation">
            <Camera className="w-4 h-4" />
            <span>Pilih 5 Foto dari Galeri / Kamera HP</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 5 Individual Photo Upload Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Like */}
          <PhotoSlot
            label="1. Eviden Like"
            image={fileLike}
            onUpload={(e) => handleSingleUpload(e, setFileLike)}
            onRemove={() => setFileLike('')}
          />
          {/* 2. Share */}
          <PhotoSlot
            label="2. Eviden Share"
            image={fileShare}
            onUpload={(e) => handleSingleUpload(e, setFileShare)}
            onRemove={() => setFileShare('')}
          />
          {/* 3. Komentar 1 */}
          <PhotoSlot
            label="3. Eviden Komentar 1"
            image={fileKomen1}
            onUpload={(e) => handleSingleUpload(e, setFileKomen1)}
            onRemove={() => setFileKomen1('')}
          />
          {/* 4. Komentar 2 */}
          <PhotoSlot
            label="4. Eviden Komentar 2"
            image={fileKomen2}
            onUpload={(e) => handleSingleUpload(e, setFileKomen2)}
            onRemove={() => setFileKomen2('')}
          />
          {/* 5. Komentar 3 */}
          <PhotoSlot
            label="5. Eviden Komentar 3"
            image={fileKomen3}
            onUpload={(e) => handleSingleUpload(e, setFileKomen3)}
            onRemove={() => setFileKomen3('')}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || timeLock.isLocked}
          className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-neutral-950 font-extrabold text-sm sm:text-base shadow-[0_8px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? 'Menyimpan Laporan...' : 'Kirim Laporan LCS'}</span>
        </button>
      </form>
    </div>
  );
};

const PhotoSlot: React.FC<{
  label: string;
  image: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}> = ({ label, image, onUpload, onRemove }) => {
  return (
    <div
      className={`border rounded-2xl p-3.5 flex flex-col justify-between space-y-2.5 transition-all ${
        image
          ? 'bg-[#1f222e] border-emerald-500/40 shadow-sm'
          : 'bg-[#1a1c27] border-neutral-700/70'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {image ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400/50" />
          )}
          <span className="text-xs font-bold text-neutral-200 uppercase">
            {label}
          </span>
        </div>
        {image && (
          <button
            type="button"
            onClick={onRemove}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 py-1 px-2 rounded-lg bg-rose-500/10 active:bg-rose-500/20 transition-all cursor-pointer touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>

      {image ? (
        <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-black/40 h-36 flex items-center justify-center group">
          <img
            src={image}
            alt={label}
            className="w-full h-full object-contain"
          />
          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex items-center justify-center text-xs text-white font-bold cursor-pointer transition-opacity">
            <span>Ganti Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label className="h-36 border-2 border-dashed border-neutral-700 hover:border-amber-400/60 active:border-amber-400 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-[#141620]/60 touch-manipulation active:scale-[0.99]">
          <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 mb-2">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs text-neutral-200 font-semibold">
            Ambil / Pilih Foto
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5">
            Format JPEG/PNG
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
