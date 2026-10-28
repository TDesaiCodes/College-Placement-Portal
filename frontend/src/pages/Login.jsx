import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert, GraduationCap, Briefcase, ShieldCheck, Zap, Cpu, Cloud, BarChart3, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [activeRoleTab, setActiveRoleTab] = useState('STUDENT'); // 'STUDENT', 'RECRUITER', 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAutoFill = (demoEmail, demoPassword, role) => {
    setActiveRoleTab(role);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleHeader = () => {
    switch (activeRoleTab) {
      case 'RECRUITER':
        return {
          title: 'Recruiter Portal',
          subtitle: 'Post placement drives & evaluate candidate applications',
          icon: Briefcase,
          color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          placeholder: 'hr@techcorp.com'
        };
      case 'ADMIN':
        return {
          title: 'TPO Officer Panel',
          subtitle: 'Placement metrics, CSV audit exports & recruiter approvals',
          icon: ShieldCheck,
          color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
          placeholder: 'admin@college.edu'
        };
      default:
        return {
          title: 'Student Portal',
          subtitle: 'Verify drive eligibility, upload S3 resume & track offers',
          icon: GraduationCap,
          color: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          placeholder: 'alex.student@college.edu'
        };
    }
  };

  const roleInfo = getRoleHeader();
  const HeaderIcon = roleInfo.icon;

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '2.5rem',
        maxWidth: '1100px',
        width: '100%',
        alignItems: 'center'
      }}>
        {/* Left Side: System Architecture & Feature Showcase */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            padding: '0.35rem 0.85rem',
            borderRadius: '30px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <Zap size={14} /> Full-Stack Placement Engine
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Enterprise Campus <br />
            <span className="gradient-text">Recruitment System</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Powered by **FastAPI (Python 3.11)**, **React.js (Vite)**, **SQLAlchemy 2.0**, and **AWS S3** pre-signed URLs for zero-latency resume management and automated eligibility filtering.
          </p>

          {/* Architectural Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <div style={{
              background: 'rgba(17, 28, 56, 0.5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#38bdf8' }}>
                <Cpu size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Automated Server-Side Eligibility Engine</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validates CGPA, backlogs, department, and graduation year before application</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 28, 56, 0.5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#34d399' }}>
                <Cloud size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AWS S3 Pre-signed URL Cloud Storage</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct browser-to-cloud PDF transfers bypassing server bandwidth bottlenecks</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 28, 56, 0.5)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#c084fc' }}>
                <BarChart3 size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>TPO Analytics & Audit CSV Export</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time department stats, salary breakdown, and downloadable CSV reports</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Auto-Fill Menu */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px dashed rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚡ Auto-Fill Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleAutoFill('alex.student@college.edu', 'student123', 'STUDENT')}
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
              >
                🎓 Student (`alex.student@college.edu`)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleAutoFill('hr@techcorp.com', 'recruiter123', 'RECRUITER')}
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
              >
                🏢 Recruiter (`hr@techcorp.com`)
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleAutoFill('admin@college.edu', 'admin123', 'ADMIN')}
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                👑 TPO Admin (`admin@college.edu`)
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Authentication Card */}
        <div className="glass-card" style={{ padding: '2.25rem' }}>
          {/* Portal Selector Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.35rem',
            background: 'rgba(11, 19, 41, 0.9)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => { setActiveRoleTab('STUDENT'); setError(''); }}
              style={{
                background: activeRoleTab === 'STUDENT' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
                color: activeRoleTab === 'STUDENT' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.2rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'var(--transition)'
              }}
            >
              <GraduationCap size={15} /> Student
            </button>

            <button
              type="button"
              onClick={() => { setActiveRoleTab('RECRUITER'); setError(''); }}
              style={{
                background: activeRoleTab === 'RECRUITER' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: activeRoleTab === 'RECRUITER' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.2rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'var(--transition)'
              }}
            >
              <Briefcase size={15} /> Recruiter
            </button>

            <button
              type="button"
              onClick={() => { setActiveRoleTab('ADMIN'); setError(''); }}
              style={{
                background: activeRoleTab === 'ADMIN' ? 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)' : 'transparent',
                color: activeRoleTab === 'ADMIN' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 0.2rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'var(--transition)'
              }}
            >
              <ShieldCheck size={15} /> TPO Admin
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: roleInfo.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '0.65rem',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <HeaderIcon size={28} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{roleInfo.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              {roleInfo.subtitle}
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.9rem',
              color: '#fb7185',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder={roleInfo.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In to {activeRoleTab === 'ADMIN' ? 'TPO Panel' : activeRoleTab === 'RECRUITER' ? 'Recruiter Portal' : 'Student Portal'}</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create an Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
