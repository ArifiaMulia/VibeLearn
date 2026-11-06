import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Smartphone, Download, Share, PlusSquare, CheckCircle2, X,
  Sparkles, WifiOff, Newspaper, BookOpen, ShieldCheck, ExternalLink, PackageCheck, RefreshCw
} from 'lucide-react';

// Global store for deferred PWA install prompt so it persists across route changes
let deferredInstallPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed-success'));
  });
}

export function useMobileAppInstall() {
  const [canInstallPWA, setCanInstallPWA] = useState(Boolean(deferredInstallPrompt));
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState('desktop'); // 'ios' | 'android' | 'desktop'

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator?.standalone === true;
    setIsStandalone(Boolean(standalone));

    const ua = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    const handleAvailable = () => setCanInstallPWA(Boolean(deferredInstallPrompt));
    const handleInstalled = () => {
      setCanInstallPWA(false);
      setIsStandalone(true);
    };
    window.addEventListener('pwa-install-available', handleAvailable);
    window.addEventListener('pwa-installed-success', handleInstalled);
    return () => {
      window.removeEventListener('pwa-install-available', handleAvailable);
      window.removeEventListener('pwa-installed-success', handleInstalled);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!deferredInstallPrompt) return false;
    try {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredInstallPrompt = null;
        setCanInstallPWA(false);
        return true;
      }
    } catch {}
    return false;
  };

  return { canInstallPWA, isStandalone, platform, triggerNativeInstall };
}

export default function MobileInstallModal({ open, onClose, initialPlatform }) {
  const { lang } = useLanguage();
  const isId = lang !== 'en';
  const { canInstallPWA, isStandalone, platform, triggerNativeInstall } = useMobileAppInstall();
  const [activeTab, setActiveTab] = useState(initialPlatform || (platform === 'ios' ? 'ios' : 'android'));
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [installingState, setInstallingState] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    if (initialPlatform) {
      setActiveTab(initialPlatform);
    } else if (platform === 'ios') {
      setActiveTab('ios');
    } else if (platform === 'android') {
      setActiveTab('android');
    }
  }, [initialPlatform, platform, open]);

  if (!open) return null;

  const appUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://vibe.virtuenet.space';

  const handleAndroidInstall = async () => {
    setInstallingState(true);
    if (canInstallPWA) {
      const ok = await triggerNativeInstall();
      setInstallingState(false);
      if (ok) {
        setInstalledSuccess(true);
        return;
      }
    }
    // Wait briefly & refresh service worker registration so WebAPK is fresh
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.update();
      }
    } catch {}
    setInstallingState(false);
    setShowManualHint(true);
  };

  const handleDownloadIOSProfile = () => {
    // Generate an Apple iOS WebClip configuration profile (.mobileconfig) so iPhone/iPad users can also download an installer file directly!
    const mobileConfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>Promptara</string>
      <key>PayloadDescription</key>
      <string>Promptara VibeLearn AI &amp; Cyber Academy iOS Web App</string>
      <key>PayloadDisplayName</key>
      <string>Promptara iOS App</string>
      <key>PayloadIdentifier</key>
      <string>space.virtuenet.promptara.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>8A7F4C2E-1B9D-4E5A-9C3F-2D8B6A4E1F09</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${appUrl}/?source=ios-profile</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Installs Promptara AI &amp; Cybersecurity Academy on your iPhone or iPad Home Screen.</string>
  <key>PayloadDisplayName</key>
  <string>Promptara — AI &amp; Cyber Academy</string>
  <key>PayloadIdentifier</key>
  <string>space.virtuenet.promptara.profile</string>
  <key>PayloadOrganization</key>
  <string>Virtuenet / Prasetia Dwidharma</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>3F2E1D4C-9B8A-4765-8C1D-5E6F7A8B9C0D</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;
    const blob = new Blob([mobileConfigXml], { type: 'application/x-apple-aspen-config' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Promptara-iOS-Installer.mobileconfig';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(5, 5, 20, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1.5px solid rgba(124, 58, 237, 0.45)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/icons/icon-192.png"
              alt="Promptara"
              style={{
                width: 48, height: 48, borderRadius: 12,
                objectFit: 'contain', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isId ? 'Download & Instal Aplikasi (Android / iOS)' : 'Download & Install App (Android / iOS)'}
                </h3>
                <span style={{
                  fontSize: '0.64rem', fontWeight: 800, padding: '0.15rem 0.5rem',
                  borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.35)'
                }}>
                  PWABUILDER VERIFIED
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isId
                  ? 'Pilih platform perangkat Anda di bawah ini untuk menginstal aplikasi Promptara secara penuh.'
                  : 'Select your mobile platform below to install the full Promptara app experience.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
              borderRadius: 8, width: 32, height: 32, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Already installed state */}
        {(isStandalone || installedSuccess) && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#10b981',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}>
            <CheckCircle2 size={18} />
            {isId
              ? 'Aplikasi sudah berhasil diinstal! Cek layar utama (Home Screen) atau daftar aplikasi HP Anda.'
              : 'App installed! Check your phone Home Screen or App Drawer.'}
          </div>
        )}

        {/* Platform Selector: Choose Android or iOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
          background: 'var(--bg-surface)',
          padding: '0.4rem',
          borderRadius: 12,
          border: '1px solid var(--border-light)',
        }}>
          <button
            onClick={() => setActiveTab('android')}
            style={{
              padding: '0.7rem 0.75rem',
              borderRadius: 9,
              border: activeTab === 'android' ? '1.5px solid #10b981' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: activeTab === 'android' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'android' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            🤖 Pilih Installer Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            style={{
              padding: '0.7rem 0.75rem',
              borderRadius: 9,
              border: activeTab === 'ios' ? '1.5px solid #8b5cf6' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: activeTab === 'ios' ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'transparent',
              color: activeTab === 'ios' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            🍎 Pilih Installer iOS (iPhone/iPad)
          </button>
        </div>

        {/* ── ANDROID INSTALLER TAB ── */}
        {activeTab === 'android' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🤖 Installer Aplikasi Android (WebAPK & PWABuilder)
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {isId
                    ? 'Ikon PNG 512×512 terverifikasi — mendukung instalasi langsung tanpa gagal.'
                    : 'Verified 512×512 PNG icons — supports direct WebAPK installation.'}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '0.2rem 0.55rem', borderRadius: 6 }}>
                Android 8.0+
              </span>
            </div>

            {/* Primary 1-Click Install Button */}
            <button
              onClick={handleAndroidInstall}
              disabled={installingState}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Download size={18} />
              {installingState
                ? (isId ? 'Mempersiapkan Installer Android...' : 'Preparing Android Installer...')
                : canInstallPWA
                  ? (isId ? '📲 Instal Aplikasi Android Sekarang (1-Klik)' : '📲 Install Android App Now (1-Click)')
                  : (isId ? '📲 Pasang Aplikasi ke HP Android' : '📲 Install App to Android Phone')}
            </button>

            {showManualHint && !canInstallPWA && (
              <div style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 8,
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}>
                💡 {isId
                  ? <>Jika pop-up otomatis belum muncul (atau aplikasi sudah terpasang), ketuk menu <strong>titik tiga (⋮)</strong> di pojok kanan atas browser Chrome/Edge HP Anda, lalu pilih <strong>"Install app" / "Instal aplikasi"</strong>. Dalam 3–5 detik ikon <strong>Promptara</strong> akan muncul di layar utama HP Anda!</>
                  : <>If the automatic prompt didn't appear, tap the <strong>three-dot menu (⋮)</strong> in Chrome/Edge and select <strong>"Install app"</strong>. The <strong>Promptara</strong> icon will appear on your Home Screen in 3–5 seconds!</>}
              </div>
            )}

            {/* Step-by-step Android Guide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.79rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {isId ? 'Langkah Instalasi di HP Android:' : 'Android Installation Steps:'}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span>
                  {isId
                    ? <>Klik tombol hijau <strong>"Instal Aplikasi Android Sekarang"</strong> di atas, atau buka menu <strong>(⋮) → "Instal aplikasi" (Install app)</strong> di Chrome.</>
                    : <>Tap the green <strong>"Install Android App Now"</strong> button above, or open Chrome menu <strong>(⋮) → "Install app"</strong>.</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span>
                  {isId
                    ? <>Konfirmasi <strong>"Instal"</strong> pada pop-up yang muncul. Tunggu sekitar 3–5 detik saat Android merakit paket WebAPK resmi.</>
                    : <>Confirm <strong>"Install"</strong> on the dialog. Wait 3–5 seconds while Android builds the signed WebAPK package.</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span>
                  {isId
                    ? <>Selesai! Aplikasi <strong>Promptara</strong> akan muncul di daftar aplikasi (App Drawer) dan layar utama HP Anda.</>
                    : <>Done! <strong>Promptara</strong> will appear in your App Drawer and Home Screen.</>}
                </span>
              </div>
            </div>

            {/* PWABuilder APK Package Generator Link */}
            <div style={{
              marginTop: '0.2rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                📦 {isId ? 'Ingin mengekspor file bundel .APK / .AAB via PWABuilder?' : 'Want to export standalone .APK / .AAB via PWABuilder?'}
              </div>
              <a
                href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent('https://vibe.virtuenet.space')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent)',
                  textDecoration: 'none', padding: '0.3rem 0.65rem', borderRadius: 6,
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)'
                }}
              >
                <PackageCheck size={13} /> Buka di PWABuilder.com <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

        {/* ── iOS (iPHONE & iPAD) INSTALLER TAB ── */}
        {activeTab === 'ios' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🍎 Installer Aplikasi iOS (iPhone & iPad)
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {isId
                    ? 'Mendukung Safari Add to Home Screen & Profil Installer iOS (.mobileconfig).'
                    : 'Supports Safari Add to Home Screen & iOS WebClip Installer Profile.'}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,0.15)', padding: '0.2rem 0.55rem', borderRadius: 6 }}>
                iOS / iPadOS 14+
              </span>
            </div>

            {/* Method A: Safari Add to Home Screen (Recommended on iOS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {isId ? 'Cara 1 (Paling Cepat via Safari / Chrome iOS):' : 'Method 1 (Fastest via Safari / Chrome iOS):'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {isId ? 'Ketuk tombol' : 'Tap the'}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)', color: 'var(--accent)', fontWeight: 700
                  }}>
                    <Share size={13} /> Bagikan (Share)
                  </span>
                  {isId ? 'di bilah bawah Safari (atau kanan atas Chrome iOS).' : 'button in Safari (or top-right in Chrome iOS).'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {isId ? 'Pilih menu' : 'Select'}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontWeight: 700
                  }}>
                    <PlusSquare size={13} /> {isId ? 'Tambah ke Layar Utama (Add to Home Screen)' : 'Add to Home Screen'}
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span>
                  {isId
                    ? <>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Ikon aplikasi Promptara langsung muncul di Home Screen iPhone Anda!</>
                    : <>Tap <strong>"Add"</strong> in the top-right corner. Promptara will appear on your iPhone Home Screen!</>}
                </span>
              </div>
            </div>

            {/* Method B: Direct Downloadable iOS Installer Profile (.mobileconfig) */}
            <div style={{
              marginTop: '0.25rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isId ? 'Cara 2: Download File Installer Profil iOS (.mobileconfig)' : 'Method 2: Download iOS WebClip Installer Profile (.mobileconfig)'}
              </div>
              <button
                onClick={handleDownloadIOSProfile}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  border: '1px solid rgba(124, 58, 237, 0.5)',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(59, 130, 246, 0.25))',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Download size={16} color="#a78bfa" />
                {isId ? 'Download Installer iOS (Promptara-iOS-Installer.mobileconfig)' : 'Download iOS Installer (.mobileconfig)'}
              </button>
              <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {isId
                  ? 'Setelah diunduh di Safari, buka Pengaturan (Settings) iPhone → "Profil Diunduh" (Profile Downloaded) → ketuk Instal.'
                  : 'After downloading in Safari, open iPhone Settings → "Profile Downloaded" → tap Install.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
