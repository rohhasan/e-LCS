import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CapingHat } from './CapingHat';
import { FocusField } from '../types';

interface CapingCharacter3DProps {
  focusField: FocusField;
  showPassword?: boolean;
  emailLength?: number;
  isSuccess?: boolean;
  isError?: boolean;
  className?: string;
}

export const CapingCharacter3D: React.FC<CapingCharacter3DProps> = ({
  focusField,
  showPassword = false,
  emailLength = 0,
  isSuccess = false,
  isError = false,
  className = '',
}) => {
  // Natural blinking cycle
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (focusField === 'password' && !showPassword) return; // don't blink when eyes covered
    if (isSuccess) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [focusField, showPassword, isSuccess]);

  // Calculate eye look position based on focus & email typing
  let pupilX = 0;
  let pupilY = 0;

  if (focusField === 'email' || (focusField as string) === 'nip') {
    // Look down towards NIP/email field, and horizontally track text length (0 to 30 chars -> -8px to +8px)
    pupilY = 13;
    const clampedLen = Math.min(Math.max(emailLength, 0), 28);
    pupilX = -7 + (clampedLen / 28) * 14;
  } else if (focusField === 'password') {
    if (showPassword) {
      // Peeking down at revealed password
      pupilY = 12;
      pupilX = 4;
    } else {
      pupilY = 4;
      pupilX = 0;
    }
  } else {
    // Idle
    pupilX = 0;
    pupilY = 0;
  }

  // Hand positions depending on state
  const isCovering = focusField === 'password';
  const isPeeking = isCovering && showPassword;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Character Container with subtle floating idle animation */}
      <motion.div
        className="relative w-64 h-52 flex items-center justify-center"
        animate={
          isError
            ? { x: [-12, 12, -9, 9, -4, 4, 0] }
            : isSuccess
            ? { y: [-6, -14, -6], scale: [1, 1.05, 1] }
            : { y: [0, -4, 0] }
        }
        transition={
          isError
            ? { duration: 0.5, ease: 'easeInOut' }
            : isSuccess
            ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
        }
      >
        {/* Soft ground ambient shadow underneath head & caping */}
        <div className="absolute top-28 w-44 h-12 bg-black/40 blur-xl rounded-full pointer-events-none" />

        {/* ---------------- 1. WHITE HEAD SPHERE ---------------- */}
        <div className="absolute top-14 z-10 w-36 h-36 flex items-center justify-center">
          {/* Head 3D Sphere SVG with volumetric lighting and specular glossy shine */}
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* 3D Sphere Spherical Light Gradient */}
              <radialGradient id="headSphere3D" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f8f9fa" />
                <stop offset="75%" stopColor="#e5e7eb" />
                <stop offset="92%" stopColor="#c7cad1" />
                <stop offset="100%" stopColor="#9ea2ad" />
              </radialGradient>

              {/* Bottom Rim Light (Bounce light from ground/table) */}
              <radialGradient id="headRimLight" cx="50%" cy="92%" r="45%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              {/* Top Forehead Shadow from Caping Hat - Subtle & High on forehead */}
              <linearGradient id="foreheadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a0c02" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#2e1a0a" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>

              {/* Glossy eye gradient */}
              <radialGradient id="eyeGloss" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#2c2d30" />
                <stop offset="50%" stopColor="#121316" />
                <stop offset="100%" stopColor="#050507" />
              </radialGradient>

              {/* Rosy Cheek Blush */}
              <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#ff758f" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ff758f" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Main Head Sphere */}
            <circle cx="80" cy="80" r="70" fill="url(#headSphere3D)" />

            {/* Bottom Bounce Light */}
            <circle cx="80" cy="80" r="70" fill="url(#headRimLight)" />

            {/* Caping Shadow cast onto uppermost curve of forehead only */}
            <ellipse cx="80" cy="30" rx="58" ry="16" fill="url(#foreheadShadow)" />

            {/* Rosy Cheeks (Visible when Happy or subtly on focus) */}
            <AnimatePresence>
              {(isSuccess || focusField === 'email' || isPeeking) && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isSuccess ? 1 : 0.65, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Left Cheek */}
                  <ellipse cx="38" cy="94" rx="13" ry="8" fill="url(#cheekBlush)" />
                  {/* Right Cheek */}
                  <ellipse cx="122" cy="94" rx="13" ry="8" fill="url(#cheekBlush)" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* ---------------- EYES & EXPRESSION ---------------- */}
            {isSuccess ? (
              /* Success / Joyful Eyes (Curved Happy Arcs) */
              <g stroke="#121316" strokeWidth="4.5" strokeLinecap="round" fill="none">
                {/* Left Happy Eye */}
                <path d="M 44 80 Q 56 66 68 80" />
                {/* Right Happy Eye */}
                <path d="M 92 80 Q 104 66 116 80" />
              </g>
            ) : isBlinking && !isCovering ? (
              /* Blinking closed eyes */
              <g stroke="#18191d" strokeWidth="4" strokeLinecap="round">
                <line x1="46" y1="80" x2="66" y2="80" />
                <line x1="94" y1="80" x2="114" y2="80" />
              </g>
            ) : (
              /* Standard 3D Bead Eyes with Dynamic Pupil Tracking */
              <g id="character-eyes">
                {/* LEFT EYE */}
                <g id="left-eye">
                  {/* Outer Eye Socket / Sphere */}
                  <motion.ellipse
                    cx={56}
                    cy={80}
                    rx={10}
                    ry={11}
                    fill="url(#eyeGloss)"
                    animate={{
                      cx: 56 + pupilX * 0.85,
                      cy: 80 + pupilY * 0.85,
                      scaleY: isBlinking ? 0.1 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 22,
                    }}
                  />
                  {/* Specular Highlight on Left Eye (Glint) */}
                  <motion.circle
                    cx={54}
                    cy={76}
                    r={3.2}
                    fill="#ffffff"
                    animate={{
                      cx: 54 + pupilX * 0.9,
                      cy: 76 + pupilY * 0.9,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  />
                  {/* Secondary Tiny Glint */}
                  <motion.circle
                    cx={58.5}
                    cy={82}
                    r={1.4}
                    fill="#ffffff"
                    opacity={0.8}
                    animate={{
                      cx: 58.5 + pupilX * 0.9,
                      cy: 82 + pupilY * 0.9,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  />
                </g>

                {/* RIGHT EYE */}
                <g id="right-eye">
                  {/* Outer Eye Socket / Sphere */}
                  <motion.ellipse
                    cx={104}
                    cy={80}
                    rx={10}
                    ry={11}
                    fill="url(#eyeGloss)"
                    animate={{
                      cx: 104 + pupilX * 0.85,
                      cy: 80 + pupilY * 0.85,
                      scaleY: isBlinking ? 0.1 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 22,
                    }}
                  />
                  {/* Specular Highlight on Right Eye */}
                  <motion.circle
                    cx={102}
                    cy={76}
                    r={3.2}
                    fill="#ffffff"
                    animate={{
                      cx: 102 + pupilX * 0.9,
                      cy: 76 + pupilY * 0.9,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  />
                  {/* Secondary Tiny Glint */}
                  <motion.circle
                    cx={106.5}
                    cy={82}
                    r={1.4}
                    fill="#ffffff"
                    opacity={0.8}
                    animate={{
                      cx: 106.5 + pupilX * 0.9,
                      cy: 82 + pupilY * 0.9,
                    }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  />
                </g>
              </g>
            )}

            {/* ---------------- MOUTH ---------------- */}
            {isSuccess ? (
              /* Joyful Big Open Smile */
              <g>
                <path
                  d="M 64 96 Q 80 120 96 96 Z"
                  fill="#c92a42"
                  stroke="#18191d"
                  strokeWidth="2.5"
                />
                {/* Cute Tongue */}
                <path
                  d="M 72 108 Q 80 118 88 108 Q 80 102 72 108 Z"
                  fill="#ff85a1"
                />
              </g>
            ) : focusField === 'email' ? (
              /* Attentive Little Cute "o" or soft smile mouth */
              <ellipse
                cx="80"
                cy="102"
                rx="4.5"
                ry="3.5"
                fill="#2b2d33"
                stroke="#18191d"
                strokeWidth="1.5"
              />
            ) : isCovering ? (
              /* Shy quiet mouth */
              <line
                x1="74"
                y1="102"
                x2="86"
                y2="102"
                stroke="#2b2d33"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              /* Gentle idle smile */
              <path
                d="M 72 98 Q 80 106 88 98"
                fill="none"
                stroke="#2b2d33"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        {/* ---------------- 2. TOP CAPING HAT ---------------- */}
        {/* Sits naturally fitted on top of head, snug and not floating */}
        <motion.div
          className="absolute -top-2 z-30 w-68 h-40"
          animate={{
            rotate: focusField === 'email' ? -1.5 : focusField === 'password' ? 1.5 : isSuccess ? [0, 2, -2, 0] : 0,
            y: focusField === 'email' ? 2 : 0,
          }}
          transition={{
            rotate: isSuccess 
              ? { type: 'tween', duration: 0.5, repeat: Infinity, ease: 'easeInOut' } 
              : { type: 'spring', stiffness: 220, damping: 18 },
            y: { type: 'spring', stiffness: 220, damping: 18 },
          }}
        >
          <CapingHat />
        </motion.div>

        {/* ---------------- 3. HANDS (PAWS) ---------------- */}
        {/* Left Hand */}
        <motion.div
          className="absolute z-40 pointer-events-none"
          initial={false}
          animate={
            isSuccess
              ? {
                  x: -94,
                  y: 12,
                  rotate: -35,
                  scale: 1.1,
                }
              : isCovering
              ? isPeeking
                ? {
                    // Peek: Left hand still covers left eye
                    x: -28,
                    y: 60,
                    rotate: 18,
                    scale: 1.05,
                  }
                : {
                    // Password Focus: Left hand lifts up and covers left eye completely
                    x: -24,
                    y: 56,
                    rotate: 16,
                    scale: 1.08,
                  }
              : {
                  // Idle / Email Focus: Gripping the left edge/shoulder of the login card (away from Welcome text)
                  x: -96,
                  y: 104,
                  rotate: -6,
                  scale: 1,
                }
          }
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 20,
          }}
        >
          <PuffyHand side="left" isCovering={isCovering} />
        </motion.div>

        {/* Right Hand */}
        <motion.div
          className="absolute z-40 pointer-events-none"
          initial={false}
          animate={
            isSuccess
              ? {
                  x: 94,
                  y: 12,
                  rotate: 35,
                  scale: 1.1,
                }
              : isCovering
              ? isPeeking
                ? {
                    // Peek: Right hand moves down & aside to let right eye peek!
                    x: 48,
                    y: 78,
                    rotate: -40,
                    scale: 0.98,
                  }
                : {
                    // Password Focus: Right hand lifts up and covers right eye completely
                    x: 24,
                    y: 56,
                    rotate: -16,
                    scale: 1.08,
                  }
              : {
                  // Idle / Email Focus: Gripping the right edge/shoulder of the login card (away from Welcome text)
                  x: 96,
                  y: 104,
                  rotate: 6,
                  scale: 1,
                }
          }
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 20,
          }}
        >
          <PuffyHand side="right" isCovering={isCovering} />
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------------- 3D PUFFY HAND / PAW COMPONENT ---------------- */
interface PuffyHandProps {
  side: 'left' | 'right';
  isCovering: boolean;
}

const PuffyHand: React.FC<PuffyHandProps> = ({ side, isCovering }) => {
  const isLeft = side === 'left';

  return (
    <div
      className={`w-16 h-16 relative flex items-center justify-center filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] ${
        isLeft ? '' : 'scale-x-[-1]'
      }`}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <defs>
          {/* Hand 3D Shading */}
          <radialGradient id={`handGrad-${side}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f3f4f6" />
            <stop offset="85%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </radialGradient>

          {/* Finger crease shadow */}
          <linearGradient id={`fingerShadow-${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#4b5563" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Palm / Hand Base */}
        <ellipse
          cx="40"
          cy="42"
          rx="26"
          ry="22"
          fill={`url(#handGrad-${side})`}
        />

        {/* 4 Puffy Rounded Fingers */}
        {/* Finger 1 (Thumb / outer finger) */}
        <ellipse
          cx="18"
          cy="36"
          rx="9"
          ry="12"
          transform="rotate(-25 18 36)"
          fill={`url(#handGrad-${side})`}
        />
        {/* Finger 2 (Index) */}
        <ellipse
          cx="28"
          cy="22"
          rx="8.5"
          ry="14"
          transform="rotate(-10 28 22)"
          fill={`url(#handGrad-${side})`}
        />
        {/* Finger 3 (Middle) */}
        <ellipse
          cx="42"
          cy="18"
          rx="8.5"
          ry="15"
          fill={`url(#handGrad-${side})`}
        />
        {/* Finger 4 (Ring/Pinky) */}
        <ellipse
          cx="56"
          cy="24"
          rx="8"
          ry="13"
          transform="rotate(12 56 24)"
          fill={`url(#handGrad-${side})`}
        />

        {/* Soft Creases between fingers */}
        <path
          d="M 22 28 Q 25 38 28 44"
          stroke={`url(#fingerShadow-${side})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 35 24 Q 37 36 38 46"
          stroke={`url(#fingerShadow-${side})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 49 26 Q 48 37 47 46"
          stroke={`url(#fingerShadow-${side})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Specular Highlight on knuckles */}
        <ellipse cx="38" cy="36" rx="16" ry="7" fill="#ffffff" opacity="0.45" />
      </svg>
    </div>
  );
};
