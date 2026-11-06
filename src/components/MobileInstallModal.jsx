import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Smartphone, Download, Share, PlusSquare, CheckCircle2, X,
  QrCode, Sparkles, WifiOff, Newspaper, BookOpen, ShieldCheck
} from 'lucide-react';

// Global store for deferred PWA install prompt so it persists across route changes
let deferredInstallPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
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
    window.addEventListener('pwa-install-available', handleAvailable);
    return () => window.removeEventListener('pwa-install-available', handleAvailable);
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

export default function MobileInstallModal({ open, onClose }) {
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const { canInstallPWA, isStandalone, platform, triggerNativeInstall } = useMobileAppInstall();
  const [activeTab, setActiveTab] = useState(platform === 'ios' ? 'ios' : 'android');
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (platform === 'ios') setActiveTab('ios');
    else if (platform === 'android') setActiveTab('android');
  }, [platform]);

  if (!open) return null;

  const appUrl = typeof window !== 'undefined' ? `${window.location.origin}/news` : 'https://vibe.virtuenet.space/news';

  const handleAndroidInstall = async () => {
    const ok = await triggerNativeInstall();
    if (ok) setInstalledSuccess(true);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(5, 5, 20, 0.76)',
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
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1.5px solid rgba(124, 58, 237, 0.45)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)'
            }}>
              <Smartphone size={22} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isId ? 'Aplikasi Mobile (iOS & Android)' : 'Mobile App (iOS & Android)'}
                </h3>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem',
                  borderRadius: 20, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.35)'
                }}>
                  PWA + OFFLINE READY
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isId
                  ? 'Belajar Vibe Coding & baca berita siber terkini ("Black October") di mana saja langsung dari layar utama HP Anda.'
                  : 'Learn Vibe Coding & read breaking cyber news ("Black October") anywhere right from your phone home screen.'}
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

        {/* Mobile Features Highlight */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.6rem',
        }}>
          {[
            {
              icon: Newspaper,
              color: '#ef4444',
              title: isId ? 'Berita & Audio Briefing' : 'News & Audio Briefing',
              desc: isId ? 'Baca & dengarkan laporan Black October saat di perjalanan' : 'Read & listen to Black October briefings on the go',
            },
            {
              icon: WifiOff,
              color: '#06b6d4',
              title: isId ? 'Mode Baca Offline' : 'Offline Reading Mode',
              desc: isId ? 'Berita & daftar kursus tersimpan otomatis di perangkat' : 'News & courses are cached automatically on your phone',
            },
            {
              icon: BookOpen,
              color: '#10b981',
              title: isId ? 'Layar Penuh (Native)' : 'Full-Screen Native Feel',
              desc: isId ? 'Tanpa address bar browser, navigasi bawah cepat 1-klik' : 'No browser address bar, 1-tap mobile bottom navigation',
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 10,
                  padding: '0.7rem 0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <Icon size={15} color={feat.color} />
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>{feat.title}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{feat.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Already installed state */}
        {(isStandalone || installedSuccess) && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#10b981',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}>
            <CheckCircle2 size={18} />
            {isId
              ? 'Aplikasi Mobile sudah terinstal dan berjalan dalam mode Native Standalone!'
              : 'Mobile App is already installed and running in Native Standalone mode!'}
          </div>
        )}

        {/* Platform Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'var(--bg-surface)',
          padding: '0.35rem',
          borderRadius: 12,
          border: '1px solid var(--border-light)',
        }}>
          <button
            onClick={() => setActiveTab('android')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: activeTab === 'android' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'android' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            🤖 Android (Chrome / Edge)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: activeTab === 'ios' ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'transparent',
              color: activeTab === 'ios' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            🍎 iOS (iPhone & iPad)
          </button>
        </div>

        {/* Tab Content: ANDROID */}
        {activeTab === 'android' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}>
            {canInstallPWA && (
              <button
                onClick={handleAndroidInstall}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Download size={18} />
                {isId ? 'Instal Sekarang (1-Klik Android App)' : 'Install Now (1-Click Android App)'}
              </button>
            )}

            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isId ? 'Cara Instal di HP Android (Chrome / Samsung Internet):' : 'How to Install on Android (Chrome / Edge):'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span>
                  {isId
                    ? <>Buka <strong>vibe.virtuenet.space</strong> di aplikasi <strong>Google Chrome</strong> pada HP Android Anda.</>
                    : <>Open <strong>vibe.virtuenet.space</strong> in <strong>Google Chrome</strong> on your Android phone.</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span>
                  {isId
                    ? <>Ketuk tombol <strong>"Instal Sekarang"</strong> di atas, atau ketuk ikon menu titik tiga <strong>(⋮)</strong> di pojok kanan atas Chrome.</>
                    : <>Tap the <strong>"Install Now"</strong> button above, or tap the three-dot menu <strong>(⋮)</strong> in Chrome.</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span>
                  {isId
                    ? <>Pilih <strong>"Instal aplikasi" (Install app)</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>. Ikon aplikasi akan langsung muncul di layar HP Anda!</>
                    : <>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. The app icon will appear on your phone!</>}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: iOS (iPhone / iPad) */}
        {activeTab === 'ios' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isId ? 'Cara Instal di iPhone & iPad (iOS Safari):' : 'How to Install on iPhone & iPad (iOS Safari):'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span>
                  {isId
                    ? <>Buka <strong>vibe.virtuenet.space</strong> menggunakan browser <strong>Safari</strong> di iPhone/iPad Anda.</>
                    : <>Open <strong>vibe.virtuenet.space</strong> in <strong>Safari</strong> on your iPhone or iPad.</>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {isId ? 'Ketuk tombol' : 'Tap the'}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)', color: 'var(--accent)', fontWeight: 700
                  }}>
                    <Share size={13} /> Bagikan (Share)
                  </span>
                  {isId ? 'di bilah navigasi bawah Safari.' : 'button on the bottom bar of Safari.'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {isId ? 'Geser ke bawah lalu pilih' : 'Scroll down and tap'}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.15rem 0.5rem', borderRadius: 6, background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontWeight: 700
                  }}>
                    <PlusSquare size={13} /> {isId ? 'Tambah ke Layar Utama (Add to Home Screen)' : 'Add to Home Screen'}
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
                <span>
                  {isId
                    ? <>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Aplikasi siap dibuka layar penuh seperti aplikasi App Store!</>
                    : <>Tap <strong>"Add"</strong> in the top-right corner. The app will launch full-screen just like a native iOS app!</>}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Mobile Link Copy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          padding: '0.75rem 1rem',
          borderRadius: 10,
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent)' }}>{isId ? '🔗 Tautan Langsung Berita Mobile:' : '🔗 Direct Mobile News Link:'}</strong>{' '}
            <code style={{ fontSize: '0.74rem', color: 'var(--text-primary)' }}>{appUrl}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(appUrl);
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.74rem', padding: '0.3rem 0.7rem', minHeight: 32 }}
          >
            {isId ? 'Salin Link HP' : 'Copy Mobile Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
