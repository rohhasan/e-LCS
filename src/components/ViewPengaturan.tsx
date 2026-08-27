import React, { useState } from 'react';
import { Clock, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getSystemSettings, saveSystemSettings } from '../utils/storage';
import { playSuccess } from '../utils/sound';

export const ViewPengaturan: React.FC = () => {
  const [settings, setSettings] = useState(() => getSystemSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemSettings(settings);
    playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-[#181a24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pengaturan Jam Batas Waktu Harian (Admin Panel)
          </h2>
          <p className="text-xs text-neutral-400">
            Aktifkan dan tentukan jam operasional harian pelaporan bagi seluruh penyuluh
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan batas jam operasional berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Switch */}
        <div className="p-4 rounded-2xl bg-[#1f222e] border border-neutral-700/80 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">
              Aktifkan Pembatasan Jam Pelaporan Harian
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Jika diaktifkan, penyuluh hanya dapat mengirim laporan di antara jam yang ditentukan di bawah.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.statusBatasJam === 'ya'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  statusBatasJam: e.target.checked ? 'ya' : 'tidak',
                })
              }
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
          </label>
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Jam Mulai Buka Pelaporan Harian (WIB)
            </label>
            <input
              type="time"
              value={settings.jamBatasMulai}
              onChange={(e) =>
                setSettings({ ...settings, jamBatasMulai: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
              Jam Batas Akhir / Tenggat Harian (WIB)
            </label>
            <input
              type="time"
              value={settings.jamBatasAkhir}
              onChange={(e) =>
                setSettings({ ...settings, jamBatasAkhir: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#222530] border border-neutral-700 rounded-xl text-neutral-100 text-sm outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Pengaturan Jam</span>
        </button>
      </form>
    </div>
  );
};
