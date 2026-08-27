import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  FileText,
  Sliders,
  Clock,
  BarChart3,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Users,
} from 'lucide-react';
import { User as UserType } from '../types';
import { KementanLogo } from './KementanLogo';

interface HeaderNavProps {
  user: UserType;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenProfile,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = user.role === 'admin';

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-[#0f111a] border-b border-indigo-500/20 px-4 sm:px-8 py-3.5 shadow-xl relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <KementanLogo className="w-11 h-11" />
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                <span>E-LCS Penyuluh</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {isAdmin ? 'ADMIN BPP' : 'PENYULUH'}
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/80">
                Sistem Pelaporan Eviden Like, Comment & Share
              </div>
            </div>
          </div>

          {/* Mobile Profile Trigger */}
          <div className="relative md:hidden">
            <button
              type="button"
              id="mobile-header-user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span className="max-w-[90px] truncate">{user.nama.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#1b1e29] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                    {isAdmin ? 'Administrator BPP' : 'Penyuluh'}
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">
                    {user.nama}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    NIP: {user.nip}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-neutral-200 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Profil</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center w-full md:w-auto">
          {!isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('aksi')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'aksi'
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aksi LCS</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('input')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'input'
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Input Laporan</span>
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => onTabChange('kelolaAksi')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'kelolaAksi'
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Kelola Tugas Aksi</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('pengaturan')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pengaturan'
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Batas Jam Pelaporan</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('kelolaUser')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'kelolaUser'
                    ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Kelola User & Password</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onTabChange('rekap')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rekap'
                ? 'bg-amber-400 text-neutral-950 shadow-md font-bold'
                : 'bg-white/10 hover:bg-white/20 text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Dashboard Rekap' : 'Rekap Pribadi'}</span>
          </button>
        </div>

        {/* User Dropdown (Desktop) */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{user.nama}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1b1e29] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-white/10">
                <div className="text-[11px] text-neutral-400 uppercase font-semibold">
                  {isAdmin ? 'Administrator BPP' : 'Penyuluh'}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {user.nama}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {user.nip}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenProfile();
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-neutral-200 hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Profil</span>
              </button>

              <div className="border-t border-white/10 my-1" />

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
