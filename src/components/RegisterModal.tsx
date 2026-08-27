import React, { useState } from 'react';
import { X, UserPlus, Shield, User, Lock, Building, UserCheck } from 'lucide-react';
import { saveUser, getUsersList } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (nip: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [tempatKerja, setTempatKerja] = useState('BPP Karangwareng');
  const [namaKoordinator, setNamaKoordinator] = useState('Ir. H. Sudirman, M.P.');
  const [nipKoordinator, setNipKoordinator] = useState('197001012000031001');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nip.trim() || !password.trim() || !nama.trim() || !tempatKerja.trim()) {
      setError('Semua kolom wajib diisi!');
      playErrorSound();
      return;
    }

    const allUsers = getUsersList();
    if (allUsers.some((u) => u.nip.trim() === nip.trim())) {
      setError('NIP tersebut sudah terdaftar dalam sistem!');
      playErrorSound();
      return;
    }

    saveUser({
      nip: nip.trim(),
      password: password.trim(),
      nama: nama.trim(),
      tempatKerja: tempatKerja.trim(),
      role: 'penyuluh',
      namaKoordinator: namaKoordinator.trim(),
      nipKoordinator: nipKoordinator.trim(),
    });

    playSuccess();
    onRegistered(nip.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#181a22] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base tracking-wide">
              Pendaftaran Akun Penyuluh Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                NIP Penyuluh
              </label>
              <input
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 198805..."
                className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm placeholder-neutral-500 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm placeholder-neutral-500 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Nama Lengkap & Gelar
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi, S.P."
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm placeholder-neutral-500 outline-none focus:border-amber-400"
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
              placeholder="Contoh: BPP Karangwareng"
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm placeholder-neutral-500 outline-none focus:border-amber-400"
            />
          </div>

          {/* Koordinator Box */}
          <div className="bg-[#20232e] border border-neutral-700/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <UserCheck className="w-4 h-4" />
              <span>Data Koordinator BPP</span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
                Nama Lengkap Koordinator BPP
              </label>
              <input
                type="text"
                required
                value={namaKoordinator}
                onChange={(e) => setNamaKoordinator(e.target.value)}
                placeholder="Nama Koordinator & Gelar"
                className="w-full px-3.5 py-2 bg-[#191b24] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
                NIP Koordinator BPP
              </label>
              <input
                type="text"
                required
                value={nipKoordinator}
                onChange={(e) => setNipKoordinator(e.target.value)}
                placeholder="NIP Koordinator"
                className="w-full px-3.5 py-2 bg-[#191b24] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Daftar Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
