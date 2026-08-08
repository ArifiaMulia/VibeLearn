import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';

export default function VerifyCertificatePage() {
  const { cert_id } = useParams();
  const branding = useBranding();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [cert_id]);

  const fetchCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/certificates/verify/${cert_id}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or unverified certificate credential.');
      }
      setCert(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        
        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <img src={branding.app_logo_url || '/logo.png'} alt={branding.app_name} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem' }}>{branding.app_name || 'Promptara'} Verification Portal</span>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Verifying credential security signature...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderTop: '4px solid var(--danger)' }}>
            <ShieldAlert size={56} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Certificate Unverified</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{error}</p>
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '1.5rem' }}>
              Certificate ID: {cert_id}
            </div>
            <Link to="/" className="btn btn-ghost">
              <ArrowLeft size={16} /> Return to Home
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', borderTop: '4px solid var(--success)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Authenticity Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', padding: '0.4rem 0.85rem', borderRadius: 99, width: 'fit-content', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <ShieldCheck size={16} /> Authentic Credential Verified
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {cert.student_name}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Has successfully completed all academic and practical requirements for the course:
            </p>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Award size={24} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{cert.course_title}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} color="var(--success)" /> Issuer: {cert.issuer}
                </span>
              </div>
            </div>

            {/* Verification Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-light)', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Credential ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>{cert.certificate_id}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Verification Hash:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{cert.verification_hash}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" className="btn btn-ghost btn-sm">
                <ArrowLeft size={15} /> Back to App
              </Link>
              <a href={cert.verified_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Share Verification Link <ExternalLink size={14} />
              </a>
            </div>

          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
          Certified by {branding.app_name || 'Promptara'} • Powered by Virtuenet.id
        </p>

      </div>
    </div>
  );
}
