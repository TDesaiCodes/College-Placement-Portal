import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Users, Briefcase, Award, TrendingUp, CheckCircle, XCircle, FileText, RefreshCw, Building, Download, Megaphone, Plus, Trash2, Cpu, Server, Shield, Layers } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Notice creation form state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'NORMAL' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analyticsRes = await api.get('/admin/analytics');
      setAnalytics(analyticsRes.data);

      // 2. Fetch Pending Recruiters
      const recruitersRes = await api.get('/admin/recruiters/pending');
      setPendingRecruiters(recruitersRes.data);

      // 3. Fetch Students
      const studentsRes = await api.get('/admin/students');
      setStudents(studentsRes.data);

      // 4. Fetch Notices
      const noticesRes = await api.get('/notices');
      setNotices(noticesRes.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecruiter = async (companyId, approve) => {
    try {
      await api.put(`/admin/recruiters/${companyId}/approve?approve=${approve}`);
      setMessage({ text: `Recruiter approval updated!`, type: 'success' });
      fetchAdminData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Action failed', type: 'error' });
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export-placements-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'placement_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ text: 'Placement report CSV downloaded successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to export CSV report', type: 'error' });
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', newNotice);
      setMessage({ text: 'Placement announcement published!', type: 'success' });
      setNewNotice({ title: '', content: '', priority: 'NORMAL' });
      setShowNoticeModal(false);
      fetchAdminData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to publish notice', type: 'error' });
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    try {
      await api.delete(`/notices/${noticeId}`);
      setMessage({ text: 'Notice deleted successfully', type: 'success' });
      fetchAdminData();
    } catch (err) {
      setMessage({ text: 'Failed to delete notice', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem' }}>Loading TPO Officer Control Panel...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Training & Placement Officer (TPO) Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>System overview, placement stats, recruiter approvals, and student registry</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowNoticeModal(true)}
            className="btn"
            style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', color: '#38bdf8' }}
          >
            <Megaphone size={16} /> Post Announcement
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-primary"
          >
            <Download size={16} /> Export Placement CSV
          </button>
        </div>
      </div>

      {/* 🚀 System Engineering Architecture Status Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem', background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
            <Cpu size={18} /> Backend Engine Specs:
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-main)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Server size={14} color="#34d399" /> <strong>FastAPI ASGI</strong> (Python 3.11)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} color="#38bdf8" /> <strong>SQLAlchemy 2.0 ORM</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} color="#a78bfa" /> <strong>AWS S3 Presigned URLs</strong>
            </span>
          </div>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} color="#38bdf8" /> Post Placement Announcement
            </h2>

            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., TechCorp Assessment Schedule"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-input"
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                >
                  <option value="NORMAL" style={{ background: '#111c38' }}>NORMAL</option>
                  <option value="IMPORTANT" style={{ background: '#111c38' }}>IMPORTANT</option>
                  <option value="URGENT" style={{ background: '#111c38' }}>URGENT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content / Details</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Provide detailed instruction or link..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowNoticeModal(false)}
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics KPI Metric Cards */}
      {analytics && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PLACEMENT RATE</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
              {analytics.placement_percentage}%
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              {analytics.placed_students} / {analytics.total_students} Placed
            </p>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HIGHEST PACKAGE</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', margin: '0.25rem 0' }}>
              ₹ {analytics.highest_ctc_lpa} LPA
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Avg: ₹ {analytics.avg_ctc_lpa} LPA
            </p>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL DRIVES</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '0.25rem 0' }}>
              {analytics.total_job_drives}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Active Companies</p>
          </div>

          <div className="glass-card">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PENDING RECRUITERS</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185', margin: '0.25rem 0' }}>
              {pendingRecruiters.length}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Approval Required</p>
          </div>
        </div>
      )}

      {/* Department-wise Placement Performance Breakdown */}
      {analytics?.department_breakdown?.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Department-wise Placement Performance</h2>
          <div className="grid-3">
            {analytics.department_breakdown.map((dept, idx) => (
              <div key={idx} style={{ background: 'rgba(11, 19, 41, 0.7)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{dept.department}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {dept.placement_rate}%
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {dept.placed_students} / {dept.total_students} Placed
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dept.placement_rate}%`, background: 'linear-gradient(90deg, #06b6d4 0%, #34d399 100%)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Notices Section */}
      {notices.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={20} color="#38bdf8" /> Live Placement Announcements ({notices.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notices.map((n) => (
              <div key={n.id} style={{
                background: 'rgba(11, 19, 41, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${n.priority === 'URGENT' ? '#fb7185' : n.priority === 'IMPORTANT' ? '#f59e0b' : '#38bdf8'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{n.title}</span>
                    <span className="badge" style={{
                      background: n.priority === 'URGENT' ? 'rgba(251,113,133,0.2)' : 'rgba(56,189,248,0.2)',
                      color: n.priority === 'URGENT' ? '#fb7185' : '#38bdf8',
                      fontSize: '0.7rem'
                    }}>{n.priority}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{n.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteNotice(n.id)}
                  style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', padding: '0.25rem' }}
                  title="Delete Notice"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Recruiter Approvals */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={20} color="#fbbf24" /> Pending Recruiter Account Approvals ({pendingRecruiters.length})
        </h2>

        {pendingRecruiters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '0.5rem 0' }}>
            No recruiters waiting for approval.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>COMPANY NAME</th>
                <th>WEBSITE</th>
                <th>HR CONTACT</th>
                <th>PHONE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecruiters.map((company) => (
                <tr key={company.id}>
                  <td style={{ fontWeight: 600 }}>{company.company_name}</td>
                  <td style={{ color: '#38bdf8' }}>{company.website || 'N/A'}</td>
                  <td>{company.hr_contact_name || 'HR Team'}</td>
                  <td style={{ color: 'var(--text-subtle)' }}>{company.hr_contact_phone}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleApproveRecruiter(company.id, true)}
                    >
                      <CheckCircle size={14} /> Approve Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Registry */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Student Registry ({students.length})</h2>
        {students.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No registered students found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ROLL NO</th>
                <th>NAME</th>
                <th>DEPARTMENT</th>
                <th>CGPA</th>
                <th>BACKLOGS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td style={{ fontWeight: 600, color: '#38bdf8' }}>{st.roll_number}</td>
                  <td>{st.full_name || `${st.first_name || ''} ${st.last_name || ''}`}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{st.department}</td>
                  <td style={{ fontWeight: 700 }}>{st.cgpa}</td>
                  <td style={{ color: st.active_backlogs > 0 ? '#fb7185' : 'var(--text-muted)' }}>
                    {st.active_backlogs}
                  </td>
                  <td>
                    <span className={`badge ${st.placement_status === 'PLACED' ? 'badge-eligible' : 'badge-ineligible'}`}>
                      {st.placement_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
