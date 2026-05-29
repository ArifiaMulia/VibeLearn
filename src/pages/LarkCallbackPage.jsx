import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { Bird } from 'lucide-react';

export default function LarkCallbackPage() {
  const { larkLogin } = useAuth();
  const { success, error } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginAttempted = useRef(false);

  useEffect(() => {
    if (loginAttempted.current) return;

    const code = searchParams.get('code');
    if (!code) {
      error('Authorization code missing from callback URL.');
      navigate('/login');
      return;
    }

    loginAttempted.current = true;
    const redirectUri = `${window.location.origin}/lark-callback`;

    larkLogin(code, redirectUri)
      .then(() => {
        success('Successfully signed in with Lark! 🚀');
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Lark Login Error:', err);
        error(err.message || 'Lark SSO authentication failed.');
        navigate('/login');
      });
  }, [larkLogin, searchParams, navigate, error, success]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      flexDirection: 'column',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '50vw', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />

      <div className="card animate-glow" style={{
        textAlign: 'center',
        padding: '3rem',
        maxWidth: 440,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)'
      }}>
        {/* Animated bird icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(59,130,246,0.25)',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          <Bird size={32} color="#3b82f6" />
        </div>

        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Authenticating with Lark</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
          Please wait while we sync your Lark account details and set up your workspace...
        </p>

        {/* Custom Spinner */}
        <div className="animate-spin" style={{
          width: 24,
          height: 24,
          border: '2px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          marginTop: '1rem'
        }} />
      </div>
    </div>
  );
}
