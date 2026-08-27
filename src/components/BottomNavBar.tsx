import React from 'react';
import {
  Sparkles,
  FileText,
  BarChart3,
  Sliders,
  Clock,
  Users,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types';

interface BottomNavBarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenProfile: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenProfile,
}) => {
  const isAdmin = user.role === 'admin';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navigasi Bawah Android"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12141d]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] transition-all"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {!isAdmin ? (
          <>
            {/* Penyuluh Tab 1: Aksi LCS */}
            <button
              type="button"
              id="mobile-nav-aksi"
              onClick={() => onTabChange('aksi')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'aksi'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'aksi'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Aksi LCS</span>
            </button>

            {/* Penyuluh Tab 2: Input Laporan (Highlight Focus) */}
            <button
              type="button"
              id="mobile-nav-input"
              onClick={() => onTabChange('input')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'input'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'input'
                    ? 'bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-amber-500/10 text-amber-300'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Input</span>
            </button>

            {/* Penyuluh Tab 3: Rekap Pribadi */}
            <button
              type="button"
              id="mobile-nav-rekap"
              onClick={() => onTabChange('rekap')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'rekap'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'rekap'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Rekap</span>
            </button>

            {/* Penyuluh Tab 4: Profil */}
            <button
              type="button"
              id="mobile-nav-profile"
              onClick={onOpenProfile}
              className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-neutral-200 transition-all touch-manipulation active:scale-90"
            >
              <div className="p-1.5 rounded-xl bg-transparent">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Profil</span>
            </button>
          </>
        ) : (
          <>
            {/* Admin Tab 1: Rekap All */}
            <button
              type="button"
              id="mobile-nav-admin-rekap"
              onClick={() => onTabChange('rekap')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'rekap'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'rekap'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Rekap</span>
            </button>

            {/* Admin Tab 2: Kelola Tugas */}
            <button
              type="button"
              id="mobile-nav-admin-aksi"
              onClick={() => onTabChange('kelolaAksi')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'kelolaAksi'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'kelolaAksi'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Tugas</span>
            </button>

            {/* Admin Tab 3: Kelola User */}
            <button
              type="button"
              id="mobile-nav-admin-user"
              onClick={() => onTabChange('kelolaUser')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'kelolaUser'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'kelolaUser'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">User BPP</span>
            </button>

            {/* Admin Tab 4: Batas Jam */}
            <button
              type="button"
              id="mobile-nav-admin-jam"
              onClick={() => onTabChange('pengaturan')}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all touch-manipulation active:scale-90 ${
                activeTab === 'pengaturan'
                  ? 'text-amber-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  activeTab === 'pengaturan'
                    ? 'bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Jam</span>
            </button>

            {/* Admin Tab 5: Profil */}
            <button
              type="button"
              id="mobile-nav-admin-profile"
              onClick={onOpenProfile}
              className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-neutral-200 transition-all touch-manipulation active:scale-90"
            >
              <div className="p-1.5 rounded-xl bg-transparent">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none">Profil</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
