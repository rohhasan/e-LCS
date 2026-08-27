import React, { useState, useEffect } from 'react';
import { FocusField, User } from './types';
import { CapingCharacter3D } from './components/CapingCharacter3D';
import { LoginForm } from './components/LoginForm';
import { HeaderNav } from './components/HeaderNav';
import { ViewAksi } from './components/ViewAksi';
import { ViewInput } from './components/ViewInput';
import { ViewKelolaAksi } from './components/ViewKelolaAksi';
import { ViewPengaturan } from './components/ViewPengaturan';
import { ViewKelolaUser } from './components/ViewKelolaUser';
import { ViewRekap } from './components/ViewRekap';
import { RegisterModal } from './components/RegisterModal';
import { ProfileModal } from './components/ProfileModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
// import { GoogleSheetsSyncBar } from './components/GoogleSheetsSyncBar';
import { BottomNavBar } from './components/BottomNavBar';
import { getStoredUser, setStoredUser } from './utils/storage';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('aksi');

  // Login Form Character Interactive States
  const [focusField, setFocusField] = useState<FocusField>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [nipValue, setNipValue] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Pre-filled Task for Input Form
  const [selectedTask, setSelectedTask] = useState<{ judul: string; url: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActiveTab('rekap');
      } else {
        setActiveTab('aksi');
      }
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setIsSuccess(true);
    setTimeout(() => {
      setStoredUser(user);
      setCurrentUser(user);
      setIsSuccess(false);
      if (user.role === 'admin') {
        setActiveTab('rekap');
      } else {
        setActiveTab('aksi');
      }
    }, 1100);
  };

  const handleLogout = () => {
    setStoredUser(null);
    setCurrentUser(null);
    setFocusField('idle');
    setShowPassword(false);
    setNipValue('');
  };

  const handleSelectTaskForReport = (task: { judul: string; url: string }) => {
    setSelectedTask(task);
    setActiveTab('input');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* ----------------- LOGGED IN STATE ----------------- */}
      {currentUser ? (
        <div className="flex-1 flex flex-col">
          <HeaderNav
            user={currentUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={handleLogout}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 md:p-8 pb-24 md:pb-8">
            {/* <GoogleSheetsSyncBar user={currentUser} onDataRefreshed={() => {}} /> */}

            {activeTab === 'aksi' && (
              <ViewAksi onSelectTaskForReport={handleSelectTaskForReport} />
            )}

            {activeTab === 'input' && (
              <ViewInput
                user={currentUser}
                initialTask={selectedTask}
                onSubmitted={() => {
                  setSelectedTask(null);
                  setActiveTab('rekap');
                }}
              />
            )}

            {activeTab === 'kelolaAksi' && <ViewKelolaAksi />}

            {activeTab === 'pengaturan' && <ViewPengaturan />}

            {activeTab === 'kelolaUser' && (
              <ViewKelolaUser currentUser={currentUser} />
            )}

            {activeTab === 'rekap' && (
              <ViewRekap
                user={currentUser}
                onViewImage={(url, title) => setPreviewImage({ url, title })}
              />
            )}
          </main>

          {/* Android Mobile Bottom Navigation Bar */}
          <BottomNavBar
            user={currentUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        </div>
      ) : (
        /* ----------------- LOGIN WITH 3D CAPING CHARACTER ----------------- */
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-b from-[#0e0f14] via-[#111218] to-[#0a0a0d]">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Main Content Container with Caping Mascot sitting right on top */}
          <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center relative z-10 pt-32 sm:pt-36">
            {/* 3D Caping Character Positioned over the Login Card */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
              <CapingCharacter3D
                focusField={focusField}
                showPassword={showPassword}
                emailLength={nipValue.length}
                isSuccess={isSuccess}
              />
            </div>

            {/* Login Form */}
            <LoginForm
              focusField={focusField}
              onFocusChange={setFocusField}
              showPassword={showPassword}
              onShowPasswordToggle={() => setShowPassword(!showPassword)}
              onNipChange={setNipValue}
              onLoginSuccess={handleLoginSuccess}
              onOpenRegister={() => setIsRegisterOpen(true)}
            />
          </div>
        </div>
      )}

      {/* ----------------- MODALS ----------------- */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(nip) => {
          setNipValue(nip);
          setFocusField('nip');
        }}
      />

      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          user={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}

export default App;
