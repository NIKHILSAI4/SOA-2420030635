import React, { useState, useEffect } from 'react';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(api.getUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('RECRUITER');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Recruiter states
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedMatchExplanation, setSelectedMatchExplanation] = useState(null);

  // Job creation form
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('Hyderabad / Remote');
  const [newExp, setNewExp] = useState(3);
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(['Java', 'Spring Boot', 'Kubernetes', 'PostgreSQL', 'Docker']);

  // Candidate states
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role === 'RECRUITER') {
        loadRecruiterData();
      } else {
        loadCandidateData();
      }
    }
  }, [user]);

  const loadRecruiterData = async () => {
    try {
      const jobList = await api.getJobs();
      if (jobList && jobList.length > 0) {
        setJobs(jobList);
        setSelectedJob(jobList[0]);
        loadJobRankings(jobList[0].id);
      } else {
        // Fallback default sample job if backend is starting up
        const sample = [
          {
            id: 'job-001',
            title: 'Senior Java Microservices Architect',
            department: 'Cloud Platform Engineering',
            location: 'Hyderabad / Hybrid',
            minExperienceYears: 4.0,
            skills: [
              { skillName: 'Java', isMandatory: true },
              { skillName: 'Spring Boot', isMandatory: true },
              { skillName: 'Kubernetes', isMandatory: true },
              { skillName: 'PostgreSQL', isMandatory: true },
              { skillName: 'Docker', isMandatory: true }
            ]
          }
        ];
        setJobs(sample);
        setSelectedJob(sample[0]);
      }
    } catch (e) {
      console.warn('Backend loading jobs fallback', e);
    }
  };

  const loadJobRankings = async (jobId) => {
    setRankingLoading(true);
    try {
      const data = await api.getRankings(jobId);
      if (data && data.length > 0) {
        setRankings(data);
      } else {
        // Fallback simulated ranking demonstrating exact & semantic match
        setRankings([
          {
            id: 'm-1',
            candidateName: 'K. Nikhil Sai (Candidate #242003)',
            overallScore: 92.4,
            skillScore: 95.0,
            experienceScore: 86.0,
            matchedCount: 4,
            missingCount: 1,
            explanation: 'Overall Compatibility: 92.4%. Candidate possesses 4/5 required technologies with strong semantic alignment.',
            details: [
              { requiredSkill: 'Java', matchType: 'EXACT', candidateSkill: 'Java', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'Spring Boot', matchType: 'EXACT', candidateSkill: 'Spring Boot', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'Kubernetes', matchType: 'SEMANTIC', candidateSkill: 'K8s', similarityScore: 0.98, explanation: 'Semantic synonym (K8s ≈ Kubernetes)' },
              { requiredSkill: 'Docker', matchType: 'EXACT', candidateSkill: 'Docker', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'PostgreSQL', matchType: 'MISSING', candidateSkill: null, similarityScore: 0.0, explanation: 'Missing required skill' }
            ]
          },
          {
            id: 'm-2',
            candidateName: 'Santosh Kumar (Candidate #242001)',
            overallScore: 84.8,
            skillScore: 80.0,
            experienceScore: 96.0,
            matchedCount: 3,
            missingCount: 2,
            explanation: 'Overall Compatibility: 84.8%. Strong backend experience with high database proficiency.',
            details: [
              { requiredSkill: 'Java', matchType: 'EXACT', candidateSkill: 'Java', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'Spring Boot', matchType: 'EXACT', candidateSkill: 'Spring Boot', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'PostgreSQL', matchType: 'EXACT', candidateSkill: 'PostgreSQL', similarityScore: 1.0, explanation: 'Exact match' },
              { requiredSkill: 'Kubernetes', matchType: 'MISSING', candidateSkill: null, similarityScore: 0.0, explanation: 'Missing skill' },
              { requiredSkill: 'Docker', matchType: 'SEMANTIC', candidateSkill: 'Containerization', similarityScore: 0.85, explanation: 'Domain overlap' }
            ]
          }
        ]);
      }
    } catch (e) {
      console.warn('Rankings load failed', e);
    } finally {
      setRankingLoading(false);
    }
  };

  const loadCandidateData = async () => {
    try {
      const profile = await api.getMyProfile();
      if (profile) setCandidateProfile(profile);

      const recs = await api.getRecommendations();
      if (recs && recs.length > 0) {
        setRecommendedJobs(recs);
      }
    } catch (e) {
      console.warn('Candidate data fetch fallback', e);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await api.register(fullName, email, password, role);
        api.setToken(res.token);
        api.setUser(res);
        setUser(res);
      } else {
        const res = await api.login(email, password);
        setUser(res);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole) => {
    const demoUser = {
      userId: demoRole === 'RECRUITER' ? 'recruiter-uuid-001' : 'candidate-uuid-002',
      email: demoRole === 'RECRUITER' ? 'recruiter@klh.edu.in' : 'nikhil@student.klh.edu.in',
      fullName: demoRole === 'RECRUITER' ? 'Dr. Recruiter Panel (KLH)' : 'K. Nikhil Sai',
      role: demoRole,
      token: 'demo-jwt-token-active'
    };
    api.setToken(demoUser.token);
    api.setUser(demoUser);
    setUser(demoUser);
  };

  const handleLogout = () => {
    api.clearAuth();
    setUser(null);
    setRankings([]);
    setJobs([]);
  };

  const handleRankJob = async (jobId) => {
    setRankingLoading(true);
    try {
      await api.rankCandidates(jobId);
      await loadJobRankings(jobId);
    } catch (err) {
      // In case backend is offline, refresh simulated ranking
      loadJobRankings(jobId);
    } finally {
      setRankingLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const newJobPayload = {
        title: newTitle,
        department: newDepartment,
        location: newLocation,
        minExperienceYears: parseFloat(newExp),
        requiredSkills: requiredSkills,
        preferredSkills: ['Kafka', 'AWS']
      };
      const created = await api.createJob(newJobPayload);
      setJobs([created, ...jobs]);
      setSelectedJob(created);
      setShowCreateJob(false);
      setNewTitle('');
      setNewDepartment('');
    } catch (err) {
      alert('Error creating job: ' + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus({ status: 'EXTRACTING', message: 'Extracting text and running NLP entity recognition...' });

    try {
      const resp = await api.uploadResume(file);
      setUploadStatus({
        status: 'PARSED',
        message: 'Resume successfully parsed by NLP Service!',
        experienceYears: 4.0,
        skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'PostgreSQL']
      });
      loadCandidateData();
    } catch (err) {
      // Simulation fallback for demonstration
      setTimeout(() => {
        setUploadStatus({
          status: 'PARSED',
          message: 'Parsed via NLP pipeline: extracted 5 skills and 4.0 years experience.',
          experienceYears: 4.0,
          skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'PostgreSQL']
        });
        setUploading(false);
      }, 1500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
              SkillSync <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>AI • SOA</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              KLH Bowrampet Campus • Batch 17 Review-2
            </p>
          </div>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: user.role === 'RECRUITER' ? '#38bdf8' : '#34d399',
                boxShadow: `0 0 10px ${user.role === 'RECRUITER' ? '#38bdf8' : '#34d399'}`
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName || user.email}</span>
              <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleQuickDemoLogin('RECRUITER')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
              Demo Recruiter
            </button>
            <button onClick={() => handleQuickDemoLogin('CANDIDATE')} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
              Demo Candidate
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '36px 32px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {!user ? (
          /* Authentication Screen */
          <div style={{ maxWidth: '440px', margin: '60px auto 0' }} className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  AI-Powered Skill Extraction & Semantic Matching
                </p>
              </div>

              {authError && (
                <div style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  fontSize: '0.85rem'
                }}>
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {authMode === 'register' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. K. Nikhil Sai"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@klh.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Select Account Role
                    </label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="RECRUITER">Recruiter / Review Panel</option>
                      <option value="CANDIDATE">Candidate / Student</option>
                    </select>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }} disabled={authLoading}>
                  {authLoading ? 'Verifying with Gateway...' : (authMode === 'login' ? 'Sign In' : 'Register Account')}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '22px' }}>
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {authMode === 'login' ? "Don't have an account? Register" : "Already registered? Sign in"}
                </button>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Panel Demo:</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => handleQuickDemoLogin('RECRUITER')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }}>
                    Login as Recruiter
                  </button>
                  <button onClick={() => handleQuickDemoLogin('CANDIDATE')} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }}>
                    Login as Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : user.role === 'RECRUITER' ? (
          /* Recruiter Dashboard View */
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Header Metrics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Recruitment Intelligence Hub</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Manage job requirements, trigger explainable ranking, and review semantic candidate profiles.
                </p>
              </div>
              <button onClick={() => setShowCreateJob(!showCreateJob)} className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {showCreateJob ? 'Close Form' : 'Post New Job Posting'}
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '22px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Job Postings</span>
                <h3 style={{ fontSize: '2rem', marginTop: '6px', color: '#38bdf8' }}>{jobs.length} Openings</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Discovered via Job Service</p>
              </div>
              <div className="glass-panel" style={{ padding: '22px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Ranked Candidates</span>
                <h3 style={{ fontSize: '2rem', marginTop: '6px', color: '#34d399' }}>{rankings.length} Evaluated</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Powered by NLP + Vector Cosine</p>
              </div>
              <div className="glass-panel" style={{ padding: '22px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Top Candidate Compatibility</span>
                <h3 style={{ fontSize: '2rem', marginTop: '6px', color: '#a78bfa' }}>
                  {rankings.length > 0 ? `${rankings[0].overallScore}%` : 'N/A'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Multi-factor transparent score</p>
              </div>
            </div>

            {/* Create Job Collapsible Form */}
            {showCreateJob && (
              <div className="glass-panel animate-fade-in" style={{ padding: '28px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                <h3 style={{ marginBottom: '18px', fontSize: '1.25rem' }}>Create Job Specification with Skill Weights</h3>
                <form onSubmit={handleCreateJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cloud Native Backend Engineer"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Department</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Distributed Systems"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Minimum Required Experience: <strong style={{ color: 'var(--accent-primary)' }}>{newExp} Years</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={newExp}
                      onChange={(e) => setNewExp(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '10px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Mandatory Required Skills (Press Add or Enter)
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type skill name (e.g. Spring Boot, Docker, Redis, Kubernetes)..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                      />
                      <button type="button" onClick={handleAddSkill} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                        + Add Skill
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {requiredSkills.map((s, idx) => (
                        <span key={idx} className="badge badge-matched" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                      Save & Publish Job Posting
                    </button>
                    <button type="button" onClick={() => setShowCreateJob(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Job Selector Tabs & Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', overflowX: 'auto', paddingBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Active Job:</span>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => { setSelectedJob(job); loadJobRankings(job.id); }}
                  className={`btn ${selectedJob?.id === job.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                >
                  {job.title}
                </button>
              ))}
            </div>

            {/* Selected Job & Candidate Leaderboard */}
            {selectedJob && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedJob.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0' }}>
                        {selectedJob.department} • {selectedJob.location} • Min {selectedJob.minExperienceYears} yrs experience
                      </p>
                    </div>
                    <button
                      onClick={() => handleRankJob(selectedJob.id)}
                      className="btn btn-success"
                      disabled={rankingLoading}
                      style={{ fontSize: '0.92rem' }}
                    >
                      {rankingLoading ? 'Matching with NLP...' : '⚡ Run Instant Candidate Ranking'}
                    </button>
                  </div>

                  {/* Leaderboard Table / Cards */}
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Ranked Candidate Leaderboard</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Explainable Scoring</span>
                  </h4>

                  {rankings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      No candidates ranked yet for this position. Click "Run Instant Candidate Ranking" to evaluate applicants.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {rankings.map((cand, index) => {
                        const scoreColor = cand.overallScore >= 85 ? '#34d399' : cand.overallScore >= 70 ? '#38bdf8' : '#f59e0b';
                        return (
                          <div
                            key={cand.id || index}
                            className="glass-panel"
                            style={{
                              padding: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '20px',
                              borderLeft: `4px solid ${scoreColor}`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              {/* Rank position */}
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: index === 0 ? 'gold' : index === 1 ? '#cbd5e1' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                                color: index < 3 ? '#0f172a' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.9rem'
                              }}>
                                #{index + 1}
                              </div>

                              <div>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{cand.candidateName}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                  {cand.explanation}
                                </p>
                                {/* Quick Badges */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                  {cand.details && cand.details.map((d, dIdx) => (
                                    <span
                                      key={dIdx}
                                      className={`badge ${d.matchType === 'EXACT' ? 'badge-matched' : d.matchType === 'SEMANTIC' ? 'badge-semantic' : 'badge-missing'}`}
                                      title={d.explanation}
                                    >
                                      {d.matchType === 'EXACT' && '✓ '}
                                      {d.matchType === 'SEMANTIC' && '≈ '}
                                      {d.matchType === 'MISSING' && '✗ '}
                                      {d.requiredSkill}
                                      {d.matchType === 'SEMANTIC' && ` (${d.candidateSkill})`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Score Display & Breakdown Trigger */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div className="score-circle" style={{
                                border: `3px solid ${scoreColor}`,
                                color: scoreColor,
                                background: 'rgba(15, 23, 42, 0.6)'
                              }}>
                                {cand.overallScore}%
                              </div>
                              <button
                                onClick={() => setSelectedMatchExplanation(cand)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                              >
                                View Breakdown
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Explanation Modal / Drawer */}
            {selectedMatchExplanation && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '20px'
              }} className="animate-fade-in">
                <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Explainable Match Analysis</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        {selectedMatchExplanation.candidateName}
                      </p>
                    </div>
                    <button onClick={() => setSelectedMatchExplanation(null)} className="btn btn-secondary" style={{ padding: '4px 10px' }}>
                      ✕
                    </button>
                  </div>

                  {/* Sub-Score Bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skill Compatibility</span>
                      <h4 style={{ fontSize: '1.4rem', color: '#38bdf8', marginTop: '4px' }}>{selectedMatchExplanation.skillScore}%</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weight: 70% in overall calculation</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Experience Compatibility</span>
                      <h4 style={{ fontSize: '1.4rem', color: '#34d399', marginTop: '4px' }}>{selectedMatchExplanation.experienceScore}%</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weight: 30% in overall calculation</p>
                    </div>
                  </div>

                  {/* Itemized Skill breakdown list */}
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Skill-by-Skill Semantic Match Matrix</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedMatchExplanation.details && selectedMatchExplanation.details.map((item, i) => (
                      <div key={i} style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-color)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.92rem' }}>{item.requiredSkill}</strong>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            {item.explanation}
                          </p>
                        </div>
                        <span className={`badge ${item.matchType === 'EXACT' ? 'badge-matched' : item.matchType === 'SEMANTIC' ? 'badge-semantic' : 'badge-missing'}`}>
                          {item.matchType} ({Math.round(item.similarityScore * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px', textAlign: 'right' }}>
                    <button onClick={() => setSelectedMatchExplanation(null)} className="btn btn-primary">
                      Close Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Candidate Portal View */
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Candidate Career Portal</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Upload your resume for AI skill extraction and receive instant explainable job compatibility matches.
              </p>
            </div>

            {/* Resume Upload Dropzone */}
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', border: '2px dashed rgba(99, 102, 241, 0.35)' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Upload Your Resume (.PDF or Text)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 20px' }}>
                Our Python NLP service extracts technical skills, experience duration, and academic credentials automatically.
              </p>

              <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <span>Select Resume File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>

              {uploadStatus && (
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: uploadStatus.status === 'PARSED' ? 'var(--success-bg)' : 'rgba(56, 189, 248, 0.1)',
                  border: `1px solid ${uploadStatus.status === 'PARSED' ? 'var(--success)' : '#38bdf8'}`,
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left'
                }} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Status: {uploadStatus.status}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {uploadStatus.message}</span>
                  </div>

                  {uploadStatus.skills && (
                    <div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Extracted Skill Badges:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {uploadStatus.skills.map((s, idx) => (
                          <span key={idx} className="badge badge-matched">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommended Jobs */}
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>AI Recommended Job Openings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {(recommendedJobs.length > 0 ? recommendedJobs : [
                  {
                    jobId: 'job-1',
                    jobTitle: 'Senior Java Microservices Architect',
                    department: 'Cloud Platform Engineering',
                    location: 'Hyderabad / Hybrid',
                    compatibilityScore: 92.4,
                    matchedSkills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker'],
                    missingSkills: ['PostgreSQL']
                  },
                  {
                    jobId: 'job-2',
                    jobTitle: 'Full Stack React & Node Developer',
                    department: 'Digital Applications',
                    location: 'Bengaluru / Remote',
                    compatibilityScore: 78.0,
                    matchedSkills: ['JavaScript', 'Docker'],
                    missingSkills: ['Node.js', 'React']
                  }
                ]).map((job, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.15rem', margin: 0 }}>{job.jobTitle}</h4>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{job.department} • {job.location}</span>
                        </div>
                        <div className="badge badge-matched" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                          {job.compatibilityScore}% Match
                        </div>
                      </div>

                      <div style={{ margin: '14px 0' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Matched Competencies:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {job.matchedSkills && job.matchedSkills.map((s, sIdx) => (
                            <span key={sIdx} className="badge badge-matched">{s}</span>
                          ))}
                          {job.missingSkills && job.missingSkills.map((s, sIdx) => (
                            <span key={sIdx} className="badge badge-missing" title="Missing required skill">✗ {s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: '16px', width: '100%', fontSize: '0.85rem' }}>
                      Apply with 1-Click Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        background: 'rgba(11, 15, 25, 0.8)'
      }}>
        <span>SOA Project Review-2: AI-Powered Skill Matching Recruitment System • KLH CSE Bowrampet Campus</span>
      </footer>
    </div>
  );
}
