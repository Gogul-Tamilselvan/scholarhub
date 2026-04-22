import { useState } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle, Lock, Mail, Eye, EyeOff, Shield, BookOpen, Users, FileText } from 'lucide-react';
import SEO from '@/components/SEO';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate with the PUBLIC Supabase client (This allows persistence/refresh)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        // Fallback or explicit error
        throw new Error(authError.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : authError.message);
      }

      const user = authData.user;
      if (!user) throw new Error('Authentication failed');

      // 2. Determine if user is Main Admin or Sub-Admin
      // Check main admin table (users)
      const { data: adminData } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (adminData) {
        // Update auth_id if it's the first time linking
        if (!adminData.auth_id) {
          await supabaseAdmin.from('users').update({ auth_id: user.id }).eq('id', adminData.id);
        }

        localStorage.setItem('adminSession', JSON.stringify({
          email: user.email,
          token: authData.session?.access_token, // Real JWT
          loginTime: new Date().toISOString()
        }));
        localStorage.removeItem('subAdminSession');
        setLocation('/admin/dashboard');
        return;
      }

      // Check sub-admin table
      const { data: subData } = await supabaseAdmin
        .from('sub_admins')
        .select('*')
        .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (subData) {
        if (!subData.is_active) throw new Error('Account is deactivated');
        
        // Update auth_id if linking for the first time
        if (!subData.auth_id) {
          await supabaseAdmin.from('sub_admins').update({ auth_id: user.id }).eq('id', subData.id);
        }
        
        // Update last_login timestamp
        await supabaseAdmin.from('sub_admins').update({ last_login: new Date().toISOString() }).eq('id', subData.id);
        
        localStorage.setItem('subAdminSession', JSON.stringify({
          id: subData.id,
          email: subData.email,
          name: subData.name,
          allowed_tabs: subData.allowed_tabs || [],
          allowed_journals: subData.allowed_journals || [],
          loginTime: new Date().toISOString()
        }));
        localStorage.removeItem('adminSession');
        setLocation('/admin/dashboard');
        return;
      }

      throw new Error('You do not have administrative access.');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <SEO
        title="Admin Login - Scholar India Publishers"
        description="Administrator access to manage reviewers and manuscript assignments."
      />

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* LEFT PANEL — Branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #0f1c3f 0%, #1a2f5e 40%, #213361 70%, #1e3a8a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="admin-left-panel">

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '-120px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
        }} />

        {/* Logo / Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '32px', boxShadow: '0 20px 40px rgba(79,142,247,0.35)'
        }}>
          <Shield size={40} color="#fff" />
        </div>

        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '12px', textAlign: 'center', lineHeight: 1.2 }}>
          Scholar India Publishers
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', textAlign: 'center', marginBottom: '48px', maxWidth: '320px', lineHeight: 1.6 }}>
          Secure administrative portal for journal management and editorial operations
        </p>

        {/* Feature highlights */}
        {[
          { icon: <FileText size={18} />, label: 'Manuscript Management', desc: 'Track submissions end-to-end' },
          { icon: <Users size={18} />, label: 'Reviewer Network', desc: 'Manage assignments & reviews' },
          { icon: <BookOpen size={18} />, label: 'Publication Workflow', desc: 'Streamlined journal publishing' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '16px',
            marginBottom: '24px', width: '100%', maxWidth: '320px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#93c5fd'
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '2px' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        padding: '48px 40px',
        position: 'relative',
      }} className="admin-right-panel">

        {/* Top badge */}
        <div style={{
          position: 'absolute', top: '32px', right: '32px',
          background: '#e0f2fe', borderRadius: '20px', padding: '6px 14px',
          fontSize: '0.75rem', fontWeight: 600, color: '#0369a1',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Secure Portal
        </div>

        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Lock icon header */}
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #213361, #1e3a8a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px', boxShadow: '0 8px 20px rgba(33,51,97,0.3)'
          }}>
            <Lock size={24} color="#fff" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            Admin Login
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '36px', lineHeight: 1.5 }}>
            Sign in to access the administrative dashboard
          </p>

          <form onSubmit={handleLogin}>
            {/* Error alert */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '12px', padding: '14px 16px', marginBottom: '20px'
              }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  id="admin-email"
                  data-testid="input-email"
                  placeholder="admin@scholarindia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: '44px', paddingRight: '16px',
                    paddingTop: '14px', paddingBottom: '14px',
                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '0.9rem', color: '#0f172a',
                    background: '#fff', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#213361';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33,51,97,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  data-testid="input-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: '44px', paddingRight: '48px',
                    paddingTop: '14px', paddingBottom: '14px',
                    border: '1.5px solid #e2e8f0', borderRadius: '12px',
                    fontSize: '0.9rem', color: '#0f172a',
                    background: '#fff', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#213361';
                    e.target.style.boxShadow = '0 0 0 3px rgba(33,51,97,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', padding: '2px',
                    cursor: 'pointer', color: '#9ca3af', display: 'flex',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="btn-admin-login"
              data-testid="button-login"
              disabled={loading || !email || !password}
              style={{
                width: '100%', padding: '15px',
                background: loading || !email || !password
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #213361, #1e3a8a)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '0.95rem', fontWeight: 600, cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'opacity 0.2s, transform 0.15s',
                boxShadow: loading || !email || !password ? 'none' : '0 6px 20px rgba(33,51,97,0.35)',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!loading && email && password) {
                  (e.target as HTMLButtonElement).style.opacity = '0.92';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '1';
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite'
                  }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div style={{
            marginTop: '32px', paddingTop: '24px',
            borderTop: '1px solid #e2e8f0', textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              🔒 This is a restricted area. All access attempts are logged.<br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Spinner animation */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .admin-left-panel { display: none !important; }
            .admin-right-panel { width: 100% !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
