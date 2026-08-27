import React from 'react';
import { CheckCircle2, LogOut, ShieldCheck, Sparkles, User, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface SuccessViewProps {
  email: string;
  onLogout: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ email, onLogout }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-sm sm:max-w-md bg-[#16171d] border border-amber-400/30 rounded-3xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-sm relative z-20 flex flex-col items-center text-center gap-5"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Login Berhasil!</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">
          Selamat Datang Kembali
        </h2>
        <p className="text-sm text-neutral-400 mt-1 max-w-xs break-all font-medium">
          {email}
        </p>
      </div>

      {/* Profile quick preview */}
      <div className="w-full bg-[#21232c] border border-neutral-700/60 rounded-2xl p-4 text-left space-y-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            Status Akun
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Sesi Login
          </span>
          <span className="text-neutral-200 font-mono">Aktif (256-bit SSL)</span>
        </div>
      </div>

      <button
        id="logout-btn"
        type="button"
        onClick={onLogout}
        className="w-full py-3.5 px-6 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 border border-neutral-700 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar & Coba Lagi</span>
      </button>
    </motion.div>
  );
};
