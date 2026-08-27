import React, { useState } from 'react';
import { X, UserCheck, Settings, KeyRound } from 'lucide-react';
import { User } from '../types';
import { saveUser, setStoredUser } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';

interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdated,
}) => {
  const [nama, setNama] = useState(user.nama);
  const [tempatKerja, setTempatKerja] = useState(user.tempatKerja);
  const [namaKoordinator, setNamaKoordinator] = useState(user.namaKoordinator);
  const [nipKoordinator, setNipKoordinator] = useState(user.nipKoordinator);
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: User = {
      ...user,
      nama: nama.trim(),
      tempatKerja: tempatKerja.trim(),
      namaKoordinator: namaKoordinator.trim(),
      nipKoordinator: nipKoordinator.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    saveUser(updated);
    setStoredUser(updated);
    playSuccess();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onUpdated(updated);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#181a22] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base tracking-wide">
              Pengaturan Profil & Koordinator
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
          {success && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-semibold text-center">
              Profil Berhasil Diperbarui!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase mb-1">
              NIP (Akun)
            </label>
            <input
              type="text"
              readOnly
              value={user.nip}
              className="w-full px-3.5 py-2.5 bg-[#14161d] border border-neutral-800 rounded-xl text-neutral-400 text-sm font-mono cursor-not-allowed"
            />
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
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
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
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
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
                className="w-full px-3.5 py-2 bg-[#191b24] border border-neutral-700 rounded-xl text-neutral-100 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Change Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Ubah Password (Opsional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengubah password"
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm placeholder-neutral-500 outline-none focus:border-amber-400"
            />
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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
