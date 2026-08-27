import React from 'react';
import logoImg from '../assets/images/logo_kementan_asli.png';

interface KementanLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

/**
 * Logo Asli Kementerian Pertanian Republik Indonesia
 * Diambil langsung dari berkas asli pengguna (100% presisi tanpa perubahan bentuk).
 */
export const KementanLogo: React.FC<KementanLogoProps> = ({
  className = 'w-10 h-10',
  showGlow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        showGlow ? 'filter drop-shadow-[0_0_12px_rgba(255,209,0,0.35)]' : ''
      } ${className}`}
      title="Logo Resmi Kementerian Pertanian Republik Indonesia"
    >
      <img
        src={logoImg}
        alt="Logo Resmi Kementerian Pertanian"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
      />
    </div>
  );
};
