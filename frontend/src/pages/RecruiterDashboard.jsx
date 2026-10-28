import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Briefcase, PlusCircle, Users, CheckCircle, AlertCircle, FileText, ExternalLink, RefreshCw, Building, Search, Filter } from 'lucide-react';

const RecruiterDashboard = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives'); // 'drives', 'create-drive', 'company'
  const [message, setMessage] = useState({ text: '', type: '' });

  // Applicant filtering & search
  const [applicantFilter, setApplicantFilter] = useState('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');

  // Company Profile Form
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    industry: 'Technology & Software',
    website: 'https://company.example.com',
    description: '',
    hr_contact_name: '',
    hr_contact_phone: ''
  });

  // Job Drive Form
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    ctc_lpa: 12.5,
    location: 'Bangalore / Remote',
    job_type: 'FULL_TIME',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
    eligibility: {
      min_cgpa: 7.5,
      min_tenth_percentage: 70.0,
      min_twelfth_percentage: 70.0,
      max_active_backlogs: 0,
      graduation_year: 2026,
      allowed_departments: ['Computer Science', 'Information Technology', 'Electronics & Communication']
    }
  });

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Company Profile
      try {
        const compRes = await api.get('/recruiters/profile/me');
        setCompany(compRes.data);
        setCompanyForm(compRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCompany(null);
          setActiveTab('company');
        }
      }

      // 2. Fetch Jobs
      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Recruiter fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      if (company) {
        const res = await api.put('/recruiters/profile/me', companyForm);
        setCompany(res.data);
        setMessage({ text: 'Company profile updated!', type: 'success' });
      } else {
        const res = await api.post('/recruiters/profile', companyForm);
        setCompany(res.data);
        setMessage({ text: 'Company profile submitted for TPO approval!', type: 'success' });
      }
      fetchRecruiterData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to save company details', type: 'error' });
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs/', jobForm);
      setMessage({ text: 'Job placement drive created successfully!', type: 'success' });
      setActiveTab('drives');
      fetchRecruiterData();
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to create job drive', type: 'error' });
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    try {
      const res = await api.get(`/applications/job/${job.id}`);
      setApplicants(res.data);
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to load applicants', type: 'error' });
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setMessage({ text: `Applicant status updated to ${newStatus}`, type: 'success' });
      if (selectedJob) {
        handleViewApplicants(selectedJob);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to update status', type: 'error' });
    }
  };

  const handleDownloadResume = async (s3Key) => {
    if (!s3Key) return alert("No resume uploaded by student");
    try {
      window.open(`http://localhost:8000/api/v1/students/mock-s3-download?s3_key=${s3Key}`, '_blank');
    } catch (err) {
      alert("Error generating download URL");
    }
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const studentName = app.student?.full_name || `${app.student?.first_name || ''} ${app.student?.last_name || ''}`;
    const matchesSearch = studentName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
                          (app.student?.roll_number || '').toLowerCase().includes(applicantSearch.toLowerCase());
    const matchesStatus = applicantFilter === 'ALL' ? true : app.status === applicantFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem' }}>Loading Recruiter Portal...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Top Banner Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Recruiter Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Post placement drives, set eligibility filters, and evaluate candidates</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn ${activeTab === 'drives' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('drives')}
          >
            <Briefcase size={18} /> Active Drives ({jobs.length})
          </button>
          <button
            className={`btn ${activeTab === 'create-drive' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('create-drive')}
            disabled={!company || !company.is_approved}
          >
            <PlusCircle size={18} /> Post New Drive
          </button>
          <button
            className={`btn ${activeTab === 'company' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('company')}
          >
            <Building size={18} /> Company Profile
          </button>
        </div>
      </div>

      {company && !company.is_approved && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <h3 style={{ color: '#fbbf24' }}>⏳ Company Account Pending TPO Approval</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Your company profile has been submitted. The Training & Placement Officer (TPO) must approve your account before you can create placement drives.
          </p>
        </div>
      )}

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

      {/* TAB 1: ACTIVE DRIVES & APPLICANTS */}
      {activeTab === 'drives' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Placement Drives</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="glass-card" style={{ borderColor: selectedJob?.id === job.id ? 'var(--primary)' : 'var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem' }}>{job.title}</h3>
                      <p style={{ color: '#34d399', fontWeight: 700 }}>₹ {job.ctc_lpa} LPA | {job.location}</p>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleViewApplicants(job)}>
                      <Users size={16} /> View Applicants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applicant Drawer / List */}
          {selectedJob && (
            <div className="glass-card">
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Applicants: {selectedJob.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Review candidate metrics and change pipeline stage
              </p>

              {/* Status Filter Tabs & Search */}
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search applicant name or roll no..."
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem', padding: '0.5rem 0.5rem 0.5rem 2.5rem', fontSize: '0.85rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {['ALL', 'APPLIED', 'SHORTLISTED', 'OFFERED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setApplicantFilter(st)}
                      style={{
                        background: applicantFilter === st ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApplicants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No applicants found under the current filter.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredApplicants.map((app) => (
                    <div key={app.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem' }}>{app.student?.full_name || `${app.student?.first_name || ''} ${app.student?.last_name || ''}`}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Roll: {app.student?.roll_number} | Dept: {app.student?.department}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, marginTop: '0.2rem' }}>
                            CGPA: {app.student?.cgpa} | Backlogs: {app.student?.active_backlogs}
                          </p>
                        </div>
                        <StatusBadge type={app.status} text={app.status} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDownloadResume(app.student?.resume_s3_key)}>
                          <FileText size={14} /> View S3 Resume
                        </button>
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem', fontSize: '0.8rem', width: 'auto' }}
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="ASSESSMENT_SCHEDULED">ASSESSMENT</option>
                          <option value="INTERVIEW_SCHEDULED">INTERVIEW</option>
                          <option value="OFFERED">OFFERED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POST NEW DRIVE */}
      {activeTab === 'create-drive' && (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create New Placement Drive</h2>

          <form onSubmit={handleCreateJob}>
            <div className="form-group">
              <label className="form-label">Job Title / Role</label>
              <input
                type="text"
                className="form-input"
                placeholder="Software Development Engineer - I"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CTC (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={jobForm.ctc_lpa}
                  onChange={(e) => setJobForm({ ...jobForm, ctc_lpa: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select
                  className="form-select"
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="INTERNSHIP_PPO">Internship + PPO</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Responsibilities, technical skills required (React, Python, SQL)..."
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
            </div>

            <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem 0', color: '#818cf8' }}>
              Automated Eligibility Criteria Filters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Minimum CGPA Required</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={jobForm.eligibility.min_cgpa}
                  onChange={(e) => setJobForm({
                    ...jobForm,
                    eligibility: { ...jobForm.eligibility, min_cgpa: parseFloat(e.target.value) }
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Allowed Active Backlogs</label>
                <input
                  type="number"
                  className="form-input"
                  value={jobForm.eligibility.max_active_backlogs}
                  onChange={(e) => setJobForm({
                    ...jobForm,
                    eligibility: { ...jobForm.eligibility, max_active_backlogs: parseInt(e.target.value) || 0 }
                  })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Publish Placement Drive
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recruiter Company Profile</h2>
          <form onSubmit={handleCompanySubmit}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-input"
                value={companyForm.company_name}
                onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry</label>
              <input
                type="text"
                className="form-input"
                value={companyForm.industry}
                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">HR Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyForm.hr_contact_name}
                  onChange={(e) => setCompanyForm({ ...companyForm, hr_contact_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">HR Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyForm.hr_contact_phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, hr_contact_phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Save Company Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
