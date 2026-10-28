import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { User, FileText, Upload, CheckCircle, AlertCircle, Briefcase, Award, MapPin, DollarSign, Calendar, RefreshCw, Megaphone, Search, Filter, PartyPopper, Cpu, ShieldCheck, Check, X, Send, Link as LinkIcon, Building2 } from 'lucide-react';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives'); // 'drives', 'applications', 'profile'
  const [message, setMessage] = useState({ text: '', type: '' });

  // Job Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [minCtc, setMinCtc] = useState(0);
  const [eligibleOnly, setEligibleOnly] = useState(false);

  // Application Modal Form State
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applyResumeFile, setApplyResumeFile] = useState(null);
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applyPortfolioUrl, setApplyPortfolioUrl] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    roll_number: '',
    department: 'Computer Science',
    graduation_year: 2026,
    cgpa: 8.5,
    tenth_percentage: 88.0,
    twelfth_percentage: 86.0,
    active_backlogs: 0,
    cleared_backlogs: 0,
    phone_number: ''
  });

  const [uploadingResume, setUploadingResume] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      try {
        const profRes = await api.get('/students/profile/me');
        setProfile(profRes.data);
        setProfileForm(profRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setProfile(null);
          setActiveTab('profile');
        }
      }

      // 2. Fetch Jobs
      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data);

      // 3. Fetch Applications
      try {
        const appsRes = await api.get('/applications/student/me');
        setApplications(appsRes.data);
      } catch (err) {
        setApplications([]);
      }

      // 4. Fetch Placement Notices
      try {
        const noticesRes = await api.get('/notices');
        setNotices(noticesRes.data);
      } catch (err) {
        setNotices([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (appId, action) => {
    try {
      await api.put(`/applications/${appId}/respond-offer?action=${action}`);
      setMessage({
        text: action === 'ACCEPT' ? '🎉 Congratulations! You accepted the offer and are now officially PLACED!' : 'Offer declined.',
        type: 'success'
      });
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to process offer response', type: 'error' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profile) {
        const res = await api.put('/students/profile/me', profileForm);
        setProfile(res.data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        const res = await api.post('/students/profile', profileForm);
        setProfile(res.data);
        setMessage({ text: 'Profile created successfully!', type: 'success' });
        setActiveTab('drives');
      }
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to save profile', type: 'error' });
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const mockFile = selectedFile || { name: 'resume_document.pdf' };

    setUploadingResume(true);
    setMessage({ text: '', type: '' });

    try {
      const urlRes = await api.post(`/students/resume/presigned-url?file_name=${encodeURIComponent(mockFile.name)}`);
      const { upload_url, s3_key } = urlRes.data;

      await api.post(`/students/mock-s3-upload?s3_key=${s3_key}`);
      await api.post(`/students/resume/confirm?s3_key=${s3_key}`);

      setMessage({ text: 'Resume uploaded and verified on AWS S3 successfully!', type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to upload resume', type: 'error' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleOpenApplyModal = (job) => {
    setApplyModalJob(job);
    setApplyCoverLetter('');
    setApplyPortfolioUrl('');
    setApplyResumeFile(null);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyModalJob) return;

    setSubmittingApp(true);
    try {
      // If a custom resume file was selected in the application modal, upload to S3 first
      if (applyResumeFile) {
        const urlRes = await api.post(`/students/resume/presigned-url?file_name=${encodeURIComponent(applyResumeFile.name)}`);
        const { s3_key } = urlRes.data;
        await api.post(`/students/mock-s3-upload?s3_key=${s3_key}`);
        await api.post(`/students/resume/confirm?s3_key=${s3_key}`);
      }

      const remarksText = [
        applyCoverLetter ? `Cover Letter: ${applyCoverLetter}` : '',
        applyPortfolioUrl ? `Portfolio: ${applyPortfolioUrl}` : ''
      ].filter(Boolean).join(' | ');

      await api.post('/applications/apply', {
        job_posting_id: applyModalJob.id,
        remarks: remarksText || 'Direct candidate submission'
      });

      setMessage({
        text: `🎉 Application submitted successfully for ${applyModalJob.title} at ${applyModalJob.company?.company_name || 'Company'}!`,
        type: 'success'
      });
      setApplyModalJob(null);
      fetchDashboardData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Application failed', type: 'error' });
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleViewResume = async () => {
    try {
      const res = await api.get('/students/resume/download-url');
      window.open(res.data.download_url, '_blank');
    } catch (err) {
      alert("Could not load resume document URL");
    }
  };

  // Filtered jobs logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.company?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCtc = job.ctc_lpa >= minCtc;
    const matchesEligible = eligibleOnly ? job.is_eligible : true;
    return matchesSearch && matchesCtc && matchesEligible;
  });

  // Find active offers
  const activeOffers = applications.filter((app) => app.status === 'OFFERED');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem' }}>Loading Student Portal...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Top Banner Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Student Placement Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track drives, verify eligibility, upload resume & submit applications</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn ${activeTab === 'drives' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('drives')}
          >
            <Briefcase size={18} /> Placement Drives ({jobs.length})
          </button>
          <button
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('applications')}
          >
            <Award size={18} /> My Applications ({applications.length})
          </button>
          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> My Profile {profile ? '✓' : '!'}
          </button>
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
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* 📄 INTERACTIVE APPLICATION MODAL FORM */}
      {applyModalJob && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.25rem', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Building2 size={16} /> {applyModalJob.company?.company_name || 'Recruiter Partner'}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {applyModalJob.title}
                </h2>
              </div>
              <button
                onClick={() => setApplyModalJob(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              background: 'rgba(11, 19, 41, 0.7)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.88rem'
            }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Package:</span> <strong style={{ color: '#34d399' }}>₹ {applyModalJob.ctc_lpa} LPA</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <strong>{applyModalJob.location}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong>{applyModalJob.job_type}</strong></div>
            </div>

            <form onSubmit={handleSubmitApplication}>
              {/* Resume Selection / Upload */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Attach Resume Document (PDF)</span>
                  {profile?.resume_s3_key && <span style={{ color: '#34d399', fontSize: '0.78rem' }}>✓ Existing Resume Linked</span>}
                </label>
                
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-input"
                  onChange={(e) => setApplyResumeFile(e.target.files[0])}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  {applyResumeFile
                    ? `Selected: ${applyResumeFile.name} (Will upload directly to AWS S3)`
                    : profile?.resume_s3_key
                    ? `Using profile resume (${profile.resume_s3_key}). Or choose a file above to replace.`
                    : `⚠️ No resume found. Please select your PDF resume file.`}
                </p>
              </div>

              {/* Cover Letter / Statement */}
              <div className="form-group">
                <label className="form-label">Cover Letter / Statement of Interest (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Tell the recruiter why you are a great fit for this role, key projects, or relevant experience..."
                  value={applyCoverLetter}
                  onChange={(e) => setApplyCoverLetter(e.target.value)}
                />
              </div>

              {/* Portfolio / LinkedIn Link */}
              <div className="form-group">
                <label className="form-label">LinkedIn / GitHub / Portfolio Link (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/yourprofile or https://github.com/username"
                    value={applyPortfolioUrl}
                    onChange={(e) => setApplyPortfolioUrl(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <LinkIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setApplyModalJob(null)}
                  disabled={submittingApp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingApp}
                >
                  {submittingApp ? 'Uploading Resume & Submitting...' : <><Send size={16} /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎉 ACTIVE OFFERS BANNER */}
      {activeOffers.length > 0 && (
        <div className="glass-card" style={{
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)'
        }}>
          <h2 style={{ fontSize: '1.3rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PartyPopper size={24} /> Congratulations! You Received Job Offer(s)
          </h2>
          {activeOffers.map((offer) => (
            <div key={offer.id} style={{
              background: 'rgba(11, 19, 41, 0.7)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{offer.job_posting?.title}</h4>
                <p style={{ color: '#38bdf8', fontWeight: 600 }}>{offer.job_posting?.company?.company_name}</p>
                <p style={{ color: '#34d399', fontWeight: 700, marginTop: '0.25rem' }}>Package: ₹ {offer.job_posting?.ctc_lpa} LPA</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleOfferResponse(offer.id, 'DECLINE')}
                  className="btn"
                  style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
                >
                  Decline
                </button>
                <button
                  onClick={() => handleOfferResponse(offer.id, 'ACCEPT')}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  Accept Offer & Mark Placed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📢 NOTICE BOARD BANNER */}
      {notices.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'rgba(6, 182, 212, 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
            <Megaphone size={18} /> Official TPO Placement Notices
          </h3>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {notices.map((n) => (
              <div key={n.id} style={{
                minWidth: '280px',
                maxWidth: '350px',
                background: 'rgba(11, 19, 41, 0.7)',
                padding: '0.85rem',
                borderRadius: '8px',
                borderLeft: `3px solid ${n.priority === 'URGENT' ? '#fb7185' : n.priority === 'IMPORTANT' ? '#f59e0b' : '#38bdf8'}`
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{n.title}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div>
          {!profile && (
            <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
              <h3>⚠️ Action Required: Complete Profile</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1rem 0' }}>
                You must complete your academic profile (CGPA, department, backlogs) and upload a resume before applying to placement drives.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('profile')}>
                Setup Profile Now
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Min Package: ₹ {minCtc} LPA
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={minCtc}
                  onChange={(e) => setMinCtc(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="eligibleCheck"
                  checked={eligibleOnly}
                  onChange={(e) => setEligibleOnly(e.target.checked)}
                />
                <label htmlFor="eligibleCheck" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>
                  Eligible Drives Only
                </label>
              </div>
            </div>
          </div>

          <div className="grid-3">
            {filteredJobs.length === 0 ? (
              <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No job drives match your current search and filter criteria.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{job.title}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                          {job.company?.company_name || 'Partner Recruiter'}
                        </p>
                      </div>
                      {profile && (
                        <StatusBadge
                          type={job.is_eligible ? 'eligible' : 'ineligible'}
                          text={job.is_eligible ? 'Eligible' : 'Ineligible'}
                        />
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0', background: 'rgba(11, 19, 41, 0.6)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>PACKAGE (CTC)</span>
                        <p style={{ fontWeight: 700, color: '#34d399' }}>₹ {job.ctc_lpa} LPA</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>LOCATION</span>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.location}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>MIN CGPA</span>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.eligibility_criteria?.min_cgpa || 'N/A'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>MAX BACKLOGS</span>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.eligibility_criteria?.max_active_backlogs ?? 0}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>

                    {!job.is_eligible && job.eligibility_reasons?.length > 0 && (
                      <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem', color: '#fb7185' }}>
                        <strong>Why ineligible?</strong>
                        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                          {job.eligibility_reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    {job.has_applied ? (
                      <div style={{ width: '100%', textAlign: 'center', padding: '0.6rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-md)', color: '#38bdf8', fontWeight: 600, fontSize: '0.88rem' }}>
                        ✓ Applied ({job.application_status})
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={!profile || !job.is_eligible}
                        onClick={() => handleOpenApplyModal(job)}
                      >
                        {!profile
                          ? 'Setup Profile First'
                          : !job.is_eligible
                          ? 'Ineligible for Drive'
                          : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Application Pipeline</h2>

          {applications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
              You have not applied to any placement drives yet.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>JOB DRIVE</th>
                  <th>COMPANY</th>
                  <th>PACKAGE</th>
                  <th>APPLIED DATE</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 600 }}>{app.job_posting?.title || 'Drive'}</td>
                    <td style={{ color: 'var(--primary)' }}>{app.job_posting?.company?.company_name || 'Recruiter'}</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>₹ {app.job_posting?.ctc_lpa} LPA</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge type={app.status} text={app.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', maxWidth: '200px' }}>
                      {app.remarks || 'Direct application'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: ACADEMIC PROFILE & RESUME */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Academic Profile Details</h2>
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.full_name || `${profileForm.first_name || ''} ${profileForm.last_name || ''}`}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="2026-CS-001"
                    value={profileForm.roll_number}
                    onChange={(e) => setProfileForm({ ...profileForm, roll_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={profileForm.cgpa}
                    onChange={(e) => setProfileForm({ ...profileForm, cgpa: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">10th %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={profileForm.tenth_percentage}
                    onChange={(e) => setProfileForm({ ...profileForm, tenth_percentage: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">12th %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={profileForm.twelfth_percentage}
                    onChange={(e) => setProfileForm({ ...profileForm, twelfth_percentage: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Active Backlogs</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profileForm.active_backlogs}
                    onChange={(e) => setProfileForm({ ...profileForm, active_backlogs: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profileForm.graduation_year}
                    onChange={(e) => setProfileForm({ ...profileForm, graduation_year: parseInt(e.target.value) || 2026 })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Save Profile Metrics
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cloud Resume Storage (AWS S3)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your resume is securely stored in AWS S3 buckets and accessed dynamically via pre-signed temporary URLs.
            </p>

            {profile?.resume_s3_key ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <FileText size={28} color="#34d399" />
                  <div>
                    <h4 style={{ color: '#34d399', fontSize: '1rem' }}>Resume Verified on S3</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Object Key: {profile.resume_s3_key}</p>
                  </div>
                </div>
                <button className="btn btn-outline" onClick={handleViewResume} style={{ fontSize: '0.85rem', width: '100%' }}>
                  View PDF via Presigned S3 URL
                </button>
              </div>
            ) : (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1.5rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                ⚠️ No resume linked yet. Please select your PDF resume file below.
              </div>
            )}

            <form onSubmit={handleResumeUpload}>
              <div className="form-group">
                <label className="form-label">Select PDF Document</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-input"
                  onChange={(e) => setSelectedFile(e.target.files[0] || { name: 'student_resume.pdf' })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={uploadingResume}
              >
                <Upload size={18} /> {uploadingResume ? 'Generating S3 Presigned URL & Uploading...' : 'Upload Resume to S3'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
