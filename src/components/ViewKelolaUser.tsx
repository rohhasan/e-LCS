import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Search,
} from 'lucide-react';
import { User } from '../types';
import { getUsersList, saveUser, deleteUser, updateUserCredentials } from '../utils/storage';
import { playSuccess, playErrorSound } from '../utils/sound';

export const ViewKelolaUser: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(() => getUsersList());
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit / New user form state
  const [formNip, setFormNip] = useState('');
  const [formOriginalNip, setFormOriginalNip] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTempatKerja, setFormTempatKerja] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'penyuluh'>('penyuluh');
  const [formNamaKoordinator, setFormNamaKoordinator] = useState('');
  const [formNipKoordinator, setFormNipKoordinator] = useState('');

  const reloadUsers = () => {
    setUsers(getUsersList());
  };

  useEffect(() => {
    const handleSync = () => reloadUsers();
    window.addEventListener('elcs_data_sync', handleSync);
    return () => window.removeEventListener('elcs_data_sync', handleSync);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') {
      playSuccess();
    } else {
      playErrorSound();
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenEdit = (target: User) => {
    setEditingUser(target);
    setFormOriginalNip(target.nip);
    setFormNip(target.nip);
    setFormPassword(target.password || '');
    setFormNama(target.nama);
    setFormTempatKerja(target.tempatKerja);
    setFormRole(target.role);
    setFormNamaKoordinator(target.namaKoordinator);
    setFormNipKoordinator(target.nipKoordinator);
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    setFormOriginalNip('');
    setFormNip('');
    setFormPassword('');
    setFormNama('');
    setFormTempatKerja('BPP Karangwareng');
    setFormRole('penyuluh');
    setFormNamaKoordinator('Ir. H. Sudirman, M.P.');
    setFormNipKoordinator('197001012000031001');
    setIsNewUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNip = formNip.trim();
    const cleanPassword = formPassword.trim();
    const cleanNama = formNama.trim();
    const cleanTempat = formTempatKerja.trim();

    if (!cleanNip || !cleanPassword || !cleanNama) {
      showNotification('error', 'Username/NIP, Password, dan Nama tidak boleh kosong!');
      return;
    }

    const currentList = getUsersList();

    // Check duplicate NIP if creating new or renaming NIP
    if (!editingUser || formOriginalNip !== cleanNip) {
      const exists = currentList.some((u) => u.nip.toLowerCase() === cleanNip.toLowerCase());
      if (exists) {
        showNotification('error', `Username / NIP "${cleanNip}" sudah digunakan user lain!`);
        return;
      }
    }

    const userData: User = {
      nip: cleanNip,
      password: cleanPassword,
      nama: cleanNama,
      tempatKerja: cleanTempat,
      role: formRole,
      namaKoordinator: formNamaKoordinator.trim(),
      nipKoordinator: formNipKoordinator.trim(),
    };

    if (editingUser) {
      updateUserCredentials(formOriginalNip, userData);
      showNotification('success', `Akun "${cleanNip}" berhasil diperbarui!`);
      setEditingUser(null);
    } else {
      saveUser(userData);
      showNotification('success', `Akun baru "${cleanNip}" berhasil ditambahkan!`);
      setIsNewUserModalOpen(false);
    }

    reloadUsers();
  };

  const handleDeleteUser = (target: User) => {
    if (target.nip === currentUser.nip) {
      showNotification('error', 'Anda tidak dapat menghapus akun admin yang sedang Anda gunakan saat ini!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun "${target.nama}" (${target.nip})?`)) {
      deleteUser(target.nip);
      reloadUsers();
      showNotification('success', `Akun "${target.nama}" berhasil dihapus.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.nip.toLowerCase().includes(q) ||
      u.nama.toLowerCase().includes(q) ||
      u.tempatKerja.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Manajemen Pengguna & Akun (Admin Panel)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kelola daftar akun, ubah username, password, peran hak akses admin atau penyuluh
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Notification */}
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user berdasarkan Nama, NIP, atau Tempat Tugas..."
          className="w-full pl-11 pr-4 py-2.5 bg-[#14161f] border border-neutral-700/80 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#12141c]">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#1e212c] text-[11px] uppercase tracking-wider text-neutral-400 font-bold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Username / NIP</th>
              <th className="py-3 px-4">Nama Lengkap</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4">Peran (Role)</th>
              <th className="py-3 px-4">Tempat Tugas</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => {
              const isCurrent = u.nip === currentUser.nip;
              return (
                <tr key={u.nip} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                    <span>{u.nip}</span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Anda
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{u.nama}</td>
                  <td className="py-3 px-4 font-mono text-neutral-400">
                    <span className="bg-black/30 px-2 py-1 rounded border border-white/5">
                      {u.password || '••••••••'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/30'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{u.role === 'admin' ? 'ADMIN BPP' : 'PENYULUH'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">{u.tempatKerja}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-300 transition-all cursor-pointer"
                        title="Edit User & Password"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        disabled={isCurrent}
                        className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus User'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500">
                  Tidak ada data pengguna yang sesuai dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit / Add User */}
      {(editingUser || isNewUserModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181a24] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base tracking-wide">
                  {editingUser ? `Edit Akun: ${editingUser.nama}` : 'Tambah Akun Pengguna Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsNewUserModalOpen(false);
                }}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                    Username / NIP
                  </label>
                  <input
                    type="text"
                    required
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: admin atau 1988..."
                    className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400 font-mono"
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
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, S.P."
                  className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                    Peran (Role Akses)
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as 'admin' | 'penyuluh')}
                    className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="penyuluh">Penyuluh (User Biasa)</option>
                    <option value="admin">Admin BPP (Kendali Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                    Tempat Kerja / BPP
                  </label>
                  <input
                    type="text"
                    required
                    value={formTempatKerja}
                    onChange={(e) => setFormTempatKerja(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="bg-[#1f222e] border border-neutral-700/80 rounded-2xl p-3.5 space-y-3">
                <div className="text-[11px] font-bold text-amber-400 uppercase">
                  Data Koordinator BPP Terkait
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                    Nama Koordinator
                  </label>
                  <input
                    type="text"
                    value={formNamaKoordinator}
                    onChange={(e) => setFormNamaKoordinator(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#161822] border border-neutral-700 rounded-lg text-neutral-100 text-xs outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                    NIP Koordinator
                  </label>
                  <input
                    type="text"
                    value={formNipKoordinator}
                    onChange={(e) => setFormNipKoordinator(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#161822] border border-neutral-700 rounded-lg text-neutral-100 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setIsNewUserModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
