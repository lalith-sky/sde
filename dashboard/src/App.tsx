import React, { useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from './services/api';

// Authenticated image component to load screenshots with JWT headers
const AuthenticatedImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    const fetchImage = async () => {
      try {
        const token = getToken();
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(src, { headers });
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
        setError(false);
      } catch (err) {
        console.error('Image loading error:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (error) {
    return <div className="img-placeholder error">Failed to load screenshot</div>;
  }

  return imgSrc ? (
    <img src={imgSrc} alt={alt} className={className} />
  ) : (
    <div className="img-placeholder loading">Loading...</div>
  );
};

export const App: React.FC = () => {
  // Navigation & User State
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'timeline' | 'screenshots' | 'analytics' | 'settings'>('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App Data State
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);

  // Filtering states
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotalPages, setActivitiesTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSessionId, setFilterSessionId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Selected details
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [timelineSession, setTimelineSession] = useState<any>(null);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);

  // Settings state
  const [screenshotInterval, setScreenshotInterval] = useState(10);
  const [captureMode, setCaptureMode] = useState<'active_tab' | 'desktop'>('active_tab');
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(0.7);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  // 1. Check Auth state on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const profile = await api.getMe();
          if (profile.success) {
            setUser(profile.user);
          } else {
            removeToken();
          }
        } catch (err) {
          removeToken();
        }
      }
    };
    checkAuth();
  }, []);

  // 2. Load Dashboard Stats
  const loadDashboardStats = async () => {
    if (!user) return;
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentActivities(res.recentActivityFeed);
        setSystemLogs(res.systemLogs);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // 3. Load Sessions List
  const loadSessions = async (page = 1) => {
    if (!user) return;
    try {
      const res = await api.getSessions(page, 10);
      if (res.success) {
        setSessions(res.sessions);
        setSessionsPage(res.pagination.page);
        setSessionsTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching sessions list:', err);
    }
  };

  // 4. Load Activities List (Timeline Filter view)
  const loadActivities = async (page = 1) => {
    if (!user) return;
    try {
      const res = await api.getActivities({
        page,
        limit: 10,
        sessionId: filterSessionId || undefined,
        q: searchQuery || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
      });
      if (res.success) {
        setActivities(res.activities);
        setActivitiesPage(res.pagination.page);
        setActivitiesTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  // 5. Load Session specific timeline
  const loadSessionTimeline = async (sessId: string) => {
    if (!sessId) return;
    try {
      const res = await api.getTimeline(sessId);
      if (res.success) {
        setTimelineSession(res.session);
        setTimelineData(res.activities);
        setActiveScreenshotIndex(0);
      }
    } catch (err) {
      console.error('Error loading session timeline:', err);
    }
  };

  // 6. Load User Settings
  const loadUserSettings = async () => {
    if (!user) return;
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setScreenshotInterval(res.settings.screenshotInterval);
        setCaptureMode(res.settings.captureMode);
        setAiConfidenceThreshold(res.settings.aiConfidenceThreshold);
        setGeminiApiKey(res.settings.geminiApiKey || '');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  // Fetch triggers when tabs change
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else if (activeTab === 'sessions') {
      loadSessions(1);
    } else if (activeTab === 'timeline') {
      loadActivities(1);
      // Populate sessions filter dropdown
      api.getSessions(1, 100).then((res) => {
        if (res.success) setSessions(res.sessions);
      });
    } else if (activeTab === 'screenshots') {
      // Auto-select latest session if none selected
      api.getSessions(1, 5).then((res) => {
        if (res.success && res.sessions.length > 0) {
          const defaultSess = res.sessions[0]._id;
          setSelectedSessionId(defaultSess);
          loadSessionTimeline(defaultSess);
        }
      });
    } else if (activeTab === 'analytics') {
      loadDashboardStats();
    } else if (activeTab === 'settings') {
      loadUserSettings();
    }
  }, [activeTab, user]);

  // Handle Login & Register Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      let res;
      if (isRegistering) {
        res = await api.register({ email: authEmail, password: authPassword });
      } else {
        res = await api.login({ email: authEmail, password: authPassword });
      }

      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout Action
  const handleLogout = () => {
    removeToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  // End an active session from the dashboard
  const handleStopActiveSession = async (sessId: string) => {
    try {
      const res = await api.endSession(sessId);
      if (res.success) {
        if (activeTab === 'dashboard') loadDashboardStats();
        if (activeTab === 'sessions') loadSessions(sessionsPage);
      }
    } catch (err) {
      alert('Failed to stop session: ' + (err as Error).message);
    }
  };

  // Update Settings Submit
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage('');
    try {
      const res = await api.updateSettings({
        screenshotInterval,
        captureMode,
        aiConfidenceThreshold,
        geminiApiKey,
      });
      if (res.success) {
        setSettingsMessage('Settings successfully saved!');
        setTimeout(() => setSettingsMessage(''), 3000);
      }
    } catch (err) {
      setSettingsMessage('Error updating settings: ' + (err as Error).message);
    }
  };

  // Render Login state
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card glass">
          <div className="login-header">
            <span className="login-logo">👁️</span>
            <h1>Visual AI Agent</h1>
            <p>Production-Quality Activity Analyzer & Screen Logger</p>
          </div>

          <form onSubmit={handleAuthSubmit}>
            <h2>{isRegistering ? 'Create Administrative Account' : 'Sign In'}</h2>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="developer@work.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {authError && <div className="error-alert">{authError}</div>}

            <button type="submit" className="btn-primary" disabled={authLoading}>
              {authLoading ? 'Please wait...' : isRegistering ? 'Register Admin Account' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="login-footer">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="toggle-auth">
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard Interface
  return (
    <div className="dashboard-layout">
      {/* Left Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo-icon">👁️</span>
          <h2>Visual AI Agent</h2>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Overview
          </button>
          <button type="button" className={`nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            ⏱️ Sessions Log
          </button>
          <button type="button" className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            📅 Activity Timeline
          </button>
          <button type="button" className={`nav-item ${activeTab === 'screenshots' ? 'active' : ''}`} onClick={() => setActiveTab('screenshots')}>
            🖼️ Screenshot Viewer
          </button>
          <button type="button" className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📈 Metrics & Charts
          </button>
          <button type="button" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Preferences Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile text-ellipsis" title={user.email}>
            <span className="user-avatar">👤</span>
            <div className="user-details">
              <span className="user-email">{user.email}</span>
              <span className="user-role">{user.role.toUpperCase()}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn-logout">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="content-header">
          <div className="page-title-area">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'sessions' && 'Recording Sessions'}
              {activeTab === 'timeline' && 'Activity Logs & Filter Timeline'}
              {activeTab === 'screenshots' && 'Visual Gallery & AI Inspector'}
              {activeTab === 'analytics' && 'Usage Analytics Breakdown'}
              {activeTab === 'settings' && 'System Configuration Settings'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Real-time telemetry and summary insights.'}
              {activeTab === 'sessions' && 'Review start, end, and duration records of monitoring sessions.'}
              {activeTab === 'timeline' && 'Search and filter recorded browser actions chronological feed.'}
              {activeTab === 'screenshots' && 'Carousel browser view matching detailed visual AI logs.'}
              {activeTab === 'analytics' && 'Visual breakdown of domains and activity distributions.'}
              {activeTab === 'settings' && 'Adjust intervals, confidence scales, and API credentials.'}
            </p>
          </div>

          <div className="system-indicator">
            <span className="indicator-dot online"></span>
            Server Connection: Active
          </div>
        </header>

        {/* Tab View Contents */}
        <div className="content-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="tab-dashboard animate-fade">
              {/* Metric Row */}
              <div className="grid-metrics">
                <div className="metric-card glass">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-info">
                    <h3>Tracked Hours</h3>
                    <p className="metric-value">
                      {stats ? (stats.totalDuration / 3600).toFixed(2) : '0.00'} hrs
                    </p>
                  </div>
                </div>

                <div className="metric-card glass">
                  <div className="metric-icon">📂</div>
                  <div className="metric-info">
                    <h3>Total Sessions</h3>
                    <p className="metric-value">{stats ? stats.totalSessions : '0'}</p>
                  </div>
                </div>

                <div className="metric-card glass">
                  <div className="metric-icon">📸</div>
                  <div className="metric-info">
                    <h3>Screenshots</h3>
                    <p className="metric-value">{stats ? stats.totalScreenshots : '0'}</p>
                  </div>
                </div>

                <div className="metric-card glass">
                  <div className="metric-icon">🤖</div>
                  <div className="metric-info">
                    <h3>AI Activities</h3>
                    <p className="metric-value">{stats ? stats.totalActivities : '0'}</p>
                  </div>
                </div>
              </div>

              {/* Middle Row */}
              <div className="grid-dashboard-middle">
                {/* Active Tracking Details */}
                <div className="dashboard-panel glass flex-column">
                  <h2>Active Monitoring Session</h2>
                  {stats && stats.activeSession ? (
                    <div className="active-session-details">
                      <div className="pulse-alert">
                        <span className="pulse-dot"></span>
                        Recording Session active now
                      </div>
                      <div className="detail-row">
                        <span>Session ID:</span>
                        <code>{stats.activeSession.id}</code>
                      </div>
                      <div className="detail-row">
                        <span>Started At:</span>
                        <span>{new Date(stats.activeSession.startTime).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span>Interval:</span>
                        <span>every {stats.activeSession.screenshotInterval} seconds</span>
                      </div>
                      <button type="button" onClick={() => {
                        console.log('🛑 Stop Session clicked:', stats.activeSession.id);
                        handleStopActiveSession(stats.activeSession.id);
                      }} className="btn-stop-monitoring">
                        🛑 Stop Recording Session
                      </button>
                    </div>
                  ) : (
                    <div className="empty-panel">
                      <p>No recording session is currently running.</p>
                      <small>Open the extension in your browser toolbar to start a session.</small>
                    </div>
                  )}
                </div>

                {/* Top Visited Domains */}
                <div className="dashboard-panel glass flex-column">
                  <h2>Top Visited Domains</h2>
                  {stats && stats.topDomains && stats.topDomains.length > 0 ? (
                    <div className="domains-list">
                      {stats.topDomains.map((item: any, idx: number) => (
                        <div className="domain-item" key={idx}>
                          <span className="domain-index">{idx + 1}</span>
                          <span className="domain-name text-ellipsis">{item.domain}</span>
                          <span className="domain-badge">{item.count} captures</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-panel">No activities captured yet.</div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Recent Feed and Logs */}
              <div className="grid-dashboard-bottom">
                {/* Activity Feed */}
                <div className="dashboard-panel glass flex-column overflow-y">
                  <h2>Recent Activity Feed</h2>
                  <div className="feed-list">
                    {recentActivities && recentActivities.length > 0 ? (
                      recentActivities.map((item: any) => (
                        <div className="feed-item" key={item._id}>
                          <div className="feed-item-header">
                            <span className="feed-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            <span className="feed-domain text-ellipsis">{item.url ? new URL(item.url).hostname : 'System'}</span>
                          </div>
                          <p className="feed-title text-ellipsis">{item.pageTitle}</p>
                          <p className="feed-summary text-ellipsis">{item.summary}</p>
                        </div>
                      ))
                    ) : (
                      <div className="empty-panel">No activities recorded.</div>
                    )}
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="dashboard-panel glass flex-column overflow-y">
                  <h2>System Audit Trails</h2>
                  <div className="logs-list">
                    {systemLogs && systemLogs.length > 0 ? (
                      systemLogs.map((item: any) => (
                        <div className={`log-item ${item.level}`} key={item._id}>
                          <span className="log-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          <span className="log-level">{item.level.toUpperCase()}</span>
                          <span className="log-msg">{item.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-panel">No audit logs found.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS LOG */}
          {activeTab === 'sessions' && (
            <div className="tab-sessions animate-fade glass card-padding flex-column">
              <h2>Recorded Tracking Sessions</h2>
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Interval (s)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions && sessions.length > 0 ? (
                    sessions.map((sess: any) => (
                      <tr key={sess._id}>
                        <td><code>{sess._id}</code></td>
                        <td>{new Date(sess.startTime).toLocaleString()}</td>
                        <td>{sess.endTime ? new Date(sess.endTime).toLocaleString() : '-'}</td>
                        <td>
                          {sess.duration
                            ? sess.duration > 60
                              ? `${Math.round(sess.duration / 60)}m ${sess.duration % 60}s`
                              : `${sess.duration}s`
                            : 'Active...'}
                        </td>
                        <td>{sess.screenshotInterval}s</td>
                        <td>
                          <span className={`badge-status ${sess.status}`}>
                            {sess.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {sess.status === 'active' ? (
                            <button type="button" onClick={() => handleStopActiveSession(sess._id)} className="btn-stop-sm">
                              Stop
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSessionId(sess._id);
                                loadSessionTimeline(sess._id);
                                setActiveTab('screenshots');
                              }}
                              className="btn-inspect-sm"
                            >
                              Inspect
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">No sessions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pagination-bar">
                <button
                  type="button"
                  disabled={sessionsPage === 1}
                  onClick={() => {
                    console.log('⬅️ Sessions Previous clicked');
                    loadSessions(sessionsPage - 1);
                  }}
                  className="btn-page"
                >
                  Previous
                </button>
                <span>Page {sessionsPage} of {sessionsTotalPages}</span>
                <button
                  type="button"
                  disabled={sessionsPage === sessionsTotalPages}
                  onClick={() => {
                    console.log('➡️ Sessions Next clicked');
                    loadSessions(sessionsPage + 1);
                  }}
                  className="btn-page"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="tab-timeline animate-fade flex-column">
              {/* Filters toolbar */}
              <div className="filters-toolbar glass">
                <div className="filter-input-group">
                  <label>Search Query</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords, page titles, text..."
                  />
                </div>

                <div className="filter-input-group">
                  <label>Session</label>
                  <select value={filterSessionId} onChange={(e) => setFilterSessionId(e.target.value)}>
                    <option value="">All Sessions</option>
                    {sessions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {new Date(s.startTime).toLocaleDateString()} - {s._id.substring(0, 8)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-input-group">
                  <label>Start Date</label>
                  <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                </div>

                <div className="filter-input-group">
                  <label>End Date</label>
                  <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                </div>

                <button type="button" onClick={() => {
                  console.log('🔍 Apply Filters clicked');
                  loadActivities(1);
                }} className="btn-filter">
                  Apply Filters
                </button>
              </div>

              {/* Activities Timeline list */}
              <div className="activities-list glass flex-column overflow-y">
                {activities && activities.length > 0 ? (
                  activities.map((act) => (
                    <div className="activity-card" key={act._id}>
                      <div className="activity-meta">
                        <div className="meta-time">{new Date(act.timestamp).toLocaleString()}</div>
                        <div className="meta-confidence">AI Confidence: {(act.confidence * 100).toFixed(0)}%</div>
                      </div>

                      <div className="activity-info-grid">
                        <div className="info-main">
                          <h3 className="activity-title">{act.pageTitle}</h3>
                          <a href={act.url} target="_blank" rel="noopener noreferrer" className="activity-url text-ellipsis">
                            {act.url}
                          </a>
                          <p className="activity-summary">{act.summary}</p>
                          <div className="text-tags">
                            {act.detectedTexts && act.detectedTexts.slice(0, 6).map((txt: string, idx: number) => (
                              <span className="text-tag" key={idx}>{txt}</span>
                            ))}
                          </div>
                        </div>

                        {act.screenshotId && (
                          <div className="info-screenshot">
                            <AuthenticatedImage
                              src={api.getScreenshotUrl(act.screenshotId._id)}
                              alt="Activity Capture"
                              className="activity-img"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-panel">No activities found matching filters.</div>
                )}

                <div className="pagination-bar">
                  <button
                    type="button"
                    disabled={activitiesPage === 1}
                    onClick={() => {
                      console.log('⬅️ Activities Previous clicked');
                      loadActivities(activitiesPage - 1);
                    }}
                    className="btn-page"
                  >
                    Previous
                  </button>
                  <span>Page {activitiesPage} of {activitiesTotalPages}</span>
                  <button
                    type="button"
                    disabled={activitiesPage === activitiesTotalPages}
                    onClick={() => {
                      console.log('➡️ Activities Next clicked');
                      loadActivities(activitiesPage + 1);
                    }}
                    className="btn-page"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCREENSHOT VIEWER & CAROUSEL */}
          {activeTab === 'screenshots' && (
            <div className="tab-screenshots animate-fade flex-row gap-16">
              {/* Left side: Carousel View */}
              <div className="screenshots-carousel-panel glass flex-column">
                <div className="panel-header-select">
                  <h2>Screenshot Gallery Viewer {timelineSession && `(${timelineSession._id.substring(0, 8)})`}</h2>
                  <select
                    value={selectedSessionId}
                    onChange={(e) => {
                      setSelectedSessionId(e.target.value);
                      loadSessionTimeline(e.target.value);
                    }}
                  >
                    <option value="" disabled>Select Session</option>
                    {sessions.map((s) => (
                      <option key={s._id} value={s._id}>
                        Session: {new Date(s.startTime).toLocaleTimeString()} ({s._id.substring(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                {timelineData && timelineData.length > 0 ? (
                  <div className="carousel-wrapper">
                    <div className="carousel-image-area">
                      {timelineData[activeScreenshotIndex]?.screenshotId && (
                        <AuthenticatedImage
                          src={api.getScreenshotUrl(timelineData[activeScreenshotIndex].screenshotId._id)}
                          alt="Carousel Focus"
                          className="carousel-main-img"
                        />
                      )}
                    </div>
                    
                    <div className="carousel-controls">
                      <button
                        type="button"
                        disabled={activeScreenshotIndex === 0}
                        onClick={() => {
                          console.log('⬅️ Screenshot Previous clicked');
                          setActiveScreenshotIndex(activeScreenshotIndex - 1);
                        }}
                        className="btn-carousel-ctrl"
                      >
                        ◀ Previous
                      </button>
                      <span className="carousel-indicator">
                        Capture {activeScreenshotIndex + 1} of {timelineData.length}
                      </span>
                      <button
                        type="button"
                        disabled={activeScreenshotIndex === timelineData.length - 1}
                        onClick={() => {
                          console.log('➡️ Screenshot Next clicked');
                          setActiveScreenshotIndex(activeScreenshotIndex + 1);
                        }}
                        className="btn-carousel-ctrl"
                      >
                        Next ▶
                      </button>
                    </div>

                    {/* Thumbnail scrollbar */}
                    <div className="thumbnails-scrollbar">
                      {timelineData.map((item, idx) => (
                        <div
                          key={item._id}
                          className={`thumbnail-box ${idx === activeScreenshotIndex ? 'active' : ''}`}
                          onClick={() => setActiveScreenshotIndex(idx)}
                        >
                          {item.screenshotId && (
                            <AuthenticatedImage
                              src={api.getScreenshotUrl(item.screenshotId._id)}
                              alt="thumb"
                              className="thumb-img"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-panel">No screenshots captured in this session.</div>
                )}
              </div>

              {/* Right side: AI inspection details */}
              <div className="screenshots-inspect-panel glass card-padding flex-column">
                <h2>AI Screen understanding</h2>
                
                {timelineData && timelineData[activeScreenshotIndex] ? (
                  <div className="inspect-details overflow-y">
                    <div className="inspect-row">
                      <span className="inspect-label">Captured Time:</span>
                      <span className="inspect-value">
                        {new Date(timelineData[activeScreenshotIndex].timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="inspect-row">
                      <span className="inspect-label">Page Title:</span>
                      <span className="inspect-value highlight">
                        {timelineData[activeScreenshotIndex].pageTitle}
                      </span>
                    </div>

                    <div className="inspect-row">
                      <span className="inspect-label">URL:</span>
                      <a
                        href={timelineData[activeScreenshotIndex].url}
                        target="_blank"
                        rel="noreferrer"
                        className="inspect-value url-link text-ellipsis"
                      >
                        {timelineData[activeScreenshotIndex].url || 'System Tab'}
                      </a>
                    </div>

                    <div className="inspect-row">
                      <span className="inspect-label">Confidence:</span>
                      <span className="inspect-value text-success">
                        {(timelineData[activeScreenshotIndex].confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <div className="inspect-box">
                      <h4>AI Action Summary</h4>
                      <p className="summary-text">{timelineData[activeScreenshotIndex].summary}</p>
                    </div>

                    <div className="inspect-box">
                      <h4>Extracted Text Elements</h4>
                      <div className="inspect-tags">
                        {timelineData[activeScreenshotIndex].detectedTexts &&
                        timelineData[activeScreenshotIndex].detectedTexts.length > 0 ? (
                          timelineData[activeScreenshotIndex].detectedTexts.map((text: string, i: number) => (
                            <span className="inspect-tag" key={i}>{text}</span>
                          ))
                        ) : (
                          <span className="text-muted">No texts detected.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-panel">No details available.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: USAGE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="tab-analytics animate-fade">
              {/* Analytics metrics row */}
              <div className="grid-metrics">
                <div className="metric-card glass">
                  <div className="metric-icon">⏰</div>
                  <div className="metric-info">
                    <h3>Average Duration</h3>
                    <p className="metric-value">
                      {stats && stats.totalSessions
                        ? Math.round(stats.totalDuration / stats.totalSessions / 60)
                        : '0'}{' '}
                      mins
                    </p>
                  </div>
                </div>

                <div className="metric-card glass">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-info">
                    <h3>Productivity Score</h3>
                    <p className="metric-value">92%</p>
                  </div>
                </div>

                <div className="metric-card glass">
                  <div className="metric-icon">🌐</div>
                  <div className="metric-info">
                    <h3>Tracked Domains</h3>
                    <p className="metric-value">
                      {stats && stats.topDomains ? stats.topDomains.length : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Domain analytics table */}
              <div className="analytics-charts-area glass card-padding flex-column">
                <h2>Productivity Domain Share</h2>
                <p className="text-muted" style={{ marginBottom: '16px' }}>
                  A clean breakdown of time captured by websites. Focus on development resources vs distractions.
                </p>

                <div className="charts-bar-grid">
                  {stats && stats.topDomains && stats.topDomains.length > 0 ? (
                    stats.topDomains.map((item: any, idx: number) => {
                      const totalCount = stats.topDomains.reduce((acc: number, d: any) => acc + d.count, 0);
                      const percentage = Math.round((item.count / totalCount) * 100);
                      
                      // Mock classification styling
                      const isProductive =
                        item.domain.includes('github') ||
                        item.domain.includes('stackoverflow') ||
                        item.domain.includes('localhost') ||
                        item.domain.includes('google');
                      
                      return (
                        <div className="bar-row-item" key={idx}>
                          <div className="bar-row-header">
                            <span className="bar-domain">{item.domain}</span>
                            <span className="bar-category" style={{ color: isProductive ? 'var(--success)' : '#eab308' }}>
                              {isProductive ? 'Productive (Work)' : 'General / Other'}
                            </span>
                            <span className="bar-percentage">{percentage}%</span>
                          </div>
                          <div className="bar-line-container">
                            <div
                              className="bar-line-fill"
                              style={{
                                width: `${percentage}%`,
                                background: isProductive
                                  ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                  : 'linear-gradient(90deg, #eab308, #ef4444)',
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-panel">No domain metrics available yet. Keep recording tabs to generate analytics.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PREFERENCES SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-settings animate-fade glass card-padding">
              <h2>System Configuration</h2>
              
              <form onSubmit={handleSettingsUpdate} className="settings-form">
                <div className="form-section">
                  <h3>Extension Preferences</h3>
                  
                  <div className="form-group">
                    <label htmlFor="screenshotInterval">Default Screenshot Interval (seconds)</label>
                    <input
                      id="screenshotInterval"
                      type="number"
                      min="5"
                      max="3600"
                      value={screenshotInterval}
                      onChange={(e) => setScreenshotInterval(parseInt(e.target.value) || 10)}
                    />
                    <small className="help-text">How often the extension takes background screen captures.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="captureMode">Capture Scope</label>
                    <select
                      id="captureMode"
                      value={captureMode}
                      onChange={(e) => setCaptureMode(e.target.value as 'active_tab' | 'desktop')}
                    >
                      <option value="active_tab">Active Tab (Visible Area)</option>
                      <option value="desktop">Full Monitor Desktop Capture (Not Supported Local)</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>AI Processing Configuration</h3>

                  <div className="form-group">
                    <label htmlFor="aiConfidenceThreshold">AI Confidence Threshold</label>
                    <input
                      id="aiConfidenceThreshold"
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="1.0"
                      value={aiConfidenceThreshold}
                      onChange={(e) => setAiConfidenceThreshold(parseFloat(e.target.value) || 0.7)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="geminiApiKey">Google Gemini 1.5 API Key</label>
                    <input
                      id="geminiApiKey"
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                    <small className="help-text">
                      Leave blank to run on mock visual parser. Put your real Gemini API key to activate multimodal vision.
                    </small>
                  </div>
                </div>

                {settingsMessage && <div className="settings-alert-msg">{settingsMessage}</div>}

                <button type="submit" className="btn-primary" style={{ maxWidth: '240px' }}>
                  Save Configurations
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
