import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, ShieldCheck, Briefcase } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'rgba(11, 19, 41, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.9rem 2.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <GraduationCap size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
            Placement<span className="gradient-text">Hub</span>
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, letterSpacing: '0.03em' }}>
            Enterprise Campus Recruitment Platform
          </p>
        </div>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.45rem 1rem',
            borderRadius: '30px',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: '0 0 10px #38bdf8',
              display: 'inline-block'
            }} />
            {role === 'ADMIN' && <ShieldCheck size={16} color="#38bdf8" />}
            {role === 'RECRUITER' && <Briefcase size={16} color="#34d399" />}
            {role === 'STUDENT' && <User size={16} color="#fbbf24" />}
            
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user.email}
            </span>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.15rem 0.55rem',
              borderRadius: '6px',
              letterSpacing: '0.05em',
              background: role === 'ADMIN' ? 'rgba(56, 189, 248, 0.2)' : role === 'RECRUITER' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)',
              color: role === 'ADMIN' ? '#38bdf8' : role === 'RECRUITER' ? '#34d399' : '#fbbf24'
            }}>
              {role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
