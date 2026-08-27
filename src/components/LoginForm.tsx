import React, { useState, useRef } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, Loader2, AlertCircle, UserPlus, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FocusField, User as UserType } from '../types';
import { playLookDown, playCoverEyes, playPeek, playSuccess, playErrorSound } from '../utils/sound';
import { getUsersList } from '../utils/storage';
import { KementanLogo } from './KementanLogo';

interface LoginFormProps {
  focusField: FocusField;
  onFocusChange: (field: FocusField) => void;
  showPassword: boolean;
  onShowPasswordToggle: () => void;
  onNipChange: (value: string) => void;
  onLoginSuccess: (user: UserType) => void;
  onOpenRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  focusField,
  onFocusChange,
  showPassword,
  onShowPasswordToggle,
  onNipChange,
  onLoginSuccess,
  onOpenRegister,
}) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nipInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNip(val);
    onNipChange(val);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleNipFocus = () => {
    onFocusChange('nip');
    playLookDown();
  };

  const handlePasswordFocus = () => {
    onFocusChange('password');
    playCoverEyes();
  };

  const handlePasswordToggleClick = () => {
    onShowPasswordToggle();
    if (!showPassword) {
      playPeek();
    } else {
      playCoverEyes();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNip = nip.trim();
    const cleanPass = password.trim();

    if (!cleanNip) {
      setErrorMessage('Silakan masukkan NIP atau Username Anda.');
      playErrorSound();
      nipInputRef.current?.focus();
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      playErrorSound();
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const allUsers = getUsersList();
      const matched = allUsers.find(
        (u) =>
          u.nip.trim().toLowerCase() === cleanNip.toLowerCase() &&
          (u.password === cleanPass ||
            (u.nip.toLowerCase() === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin')))
      );

      if (matched) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981', '#6366f1'],
        });
        playSuccess();
        onLoginSuccess(matched);
      } else {
        setErrorMessage('NIP atau Password salah! Periksa kembali akun Anda.');
        playErrorSound();
        passwordInputRef.current?.focus();
      }
    }, 700);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm sm:max-w-md bg-[#16171d] border border-white/10 rounded-3xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-sm relative z-20 flex flex-col gap-4"
    >
      {/* Title */}
      <div className="text-center pt-1 flex flex-col items-center">
        <KementanLogo className="w-14 h-14 mb-2.5" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E-LCS PENYULUH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Login Portal
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-medium">
          Sistem Pelaporan Eviden Like, Comment & Share
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          id="error-banner"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* NIP Input Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="loginNip"
          className="block text-xs font-semibold text-neutral-300 tracking-wide uppercase ml-1"
        >
          NIP / Username
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-amber-400 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            id="loginNip"
            ref={nipInputRef}
            type="text"
            value={nip}
            onChange={handleNipChange}
            onFocus={handleNipFocus}
            onBlur={() => onFocusChange('idle')}
            placeholder="Masukkan NIP atau Username"
            autoComplete="username"
            className={`w-full pl-10 pr-4 py-3.5 bg-[#21232c] border rounded-2xl text-neutral-100 text-sm placeholder-neutral-500 outline-none transition-all duration-200 ${
              focusField === 'nip'
                ? 'border-amber-400 ring-2 ring-amber-400/20 bg-[#252833]'
                : 'border-neutral-700/70 hover:border-neutral-600'
            }`}
          />
        </div>
      </div>

      {/* Password Input Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label
            htmlFor="loginPass"
            className="block text-xs font-semibold text-neutral-300 tracking-wide uppercase"
          >
            Password
          </label>
          <span className="text-[11px] text-neutral-400">Ketik kata sandi</span>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-amber-400 transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="loginPass"
            ref={passwordInputRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={() => onFocusChange('idle')}
            placeholder="••••••••"
            autoComplete="current-password"
            className={`w-full pl-10 pr-11 py-3.5 bg-[#21232c] border rounded-2xl text-neutral-100 text-sm placeholder-neutral-500 outline-none transition-all duration-200 ${
              focusField === 'password'
                ? 'border-amber-400 ring-2 ring-amber-400/20 bg-[#252833]'
                : 'border-neutral-700/70 hover:border-neutral-600'
            }`}
          />
          {/* Show / Hide Password Button */}
          <button
            id="toggle-password-btn"
            type="button"
            onClick={handlePasswordToggleClick}
            aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            title={showPassword ? 'Tutup mata lagi' : 'Intip password!'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Sign In Submit Button */}
      <button
        id="submit-login-btn"
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-neutral-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_10px_24px_rgba(245,158,11,0.4)] transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memverifikasi...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Register Link */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onOpenRegister}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Registrasi Akun Penyuluh Baru</span>
        </button>
      </div>

      {/* BPP Karangwareng Demo Box */}
      <div className="mt-0.5 bg-[#1a1c24] border border-white/5 rounded-2xl p-2.5 text-center">
        <div className="text-xs font-bold text-amber-400 tracking-wide">
          BPP Karangwareng
        </div>
        <div className="text-[11px] text-neutral-400 mt-0.5">
          Kabupaten Cirebon - Jawa Barat
        </div>
      </div>
    </form>
  );
};
