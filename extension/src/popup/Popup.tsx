import React, { useState, useEffect } from 'react';
import './Popup.css';

export const Popup: React.FC = () => {
  // Configuration
  const [serverUrl, setServerUrl] = useState('http://localhost:5000');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Session State
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<'idle' | 'monitoring'>('idle');
  const [screenshotInterval, setScreenshotInterval] = useState(10); // seconds
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  // 1. Initial State Load
  useEffect(() => {
    chrome.storage.local.get([
      'token',
      'userEmail',
      'monitoringStatus',
      'interval',
      'sessionId',
      'serverUrl',
      'lastCaptureTime'
    ], (data) => {
      if (data.token) setToken(data.token);
      if (data.userEmail) setUserEmail(data.userEmail);
      if (data.monitoringStatus) setMonitoringStatus(data.monitoringStatus);
      if (data.interval) setScreenshotInterval(data.interval);
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.serverUrl) setServerUrl(data.serverUrl);
      if (data.lastCaptureTime) {
        setLastCapture(new Date(data.lastCaptureTime).toLocaleTimeString());
      }

      // Check current background status to ensure synchronization
      chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (bgData) => {
        if (bgData) {
          setMonitoringStatus(bgData.status);
          setSessionId(bgData.sessionId);
          setScreenshotInterval(bgData.interval);
          setServerUrl(bgData.serverUrl);
          if (bgData.lastCaptureTime) {
            setLastCapture(new Date(bgData.lastCaptureTime).toLocaleTimeString());
          }
        }
      });
    });
  }, []);

  // Poll background for last capture updates when active
  useEffect(() => {
    let intervalId: any;
    if (monitoringStatus === 'monitoring') {
      intervalId = setInterval(() => {
        chrome.storage.local.get(['lastCaptureTime'], (data) => {
          if (data.lastCaptureTime) {
            setLastCapture(new Date(data.lastCaptureTime).toLocaleTimeString());
          }
        });
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [monitoringStatus]);

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store in state & storage
      setToken(data.token);
      setUserEmail(data.user.email);
      chrome.storage.local.set({
        token: data.token,
        userEmail: data.user.email,
        serverUrl
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = async () => {
    if (monitoringStatus === 'monitoring') {
      await handleStopMonitoring();
    }
    setToken(null);
    setUserEmail(null);
    chrome.storage.local.remove(['token', 'userEmail', 'sessionId', 'monitoringStatus']);
  };

  // 4. Start Monitoring Session
  const handleStartMonitoring = async () => {
    setError('');
    setLoading(true);

    try {
      // First, let's update settings on server
      await fetch(`${serverUrl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ screenshotInterval }),
      });

      // Call API to start session
      const res = await fetch(`${serverUrl}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to start session on server');
      }

      const activeSessionId = data.session._id;
      setSessionId(activeSessionId);
      setMonitoringStatus('monitoring');

      // Command service worker background runner
      chrome.runtime.sendMessage({
        action: 'START_MONITORING',
        payload: {
          sessionId: activeSessionId,
          interval: screenshotInterval,
          token,
          serverUrl
        }
      }, (response) => {
        if (response && response.success) {
          console.log('[Popup] Started monitoring process');
        }
      });

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Stop Monitoring Session
  const handleStopMonitoring = async () => {
    setError('');
    setLoading(true);

    try {
      // Call API to end session
      await fetch(`${serverUrl}/api/sessions/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      setMonitoringStatus('idle');
      setSessionId(null);

      // Command background runner to halt alarms
      chrome.runtime.sendMessage({ action: 'STOP_MONITORING' });

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Open Web Dashboard
  const openDashboard = () => {
    const dashboardHost = serverUrl.replace('5000', '5173'); // Map standard backend port 5000 to Vite frontend port 5173
    window.open(dashboardHost, '_blank');
  };

  // Rendering Authentication Form
  if (!token) {
    return (
      <div className="popup-container">
        <header className="popup-header">
          <div className="logo-section">
            <span className="logo-icon">👁️</span>
            <h1>Visual AI Agent</h1>
          </div>
        </header>

        <main className="popup-body">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Connect to Account</h2>
            
            <div className="form-group">
              <label htmlFor="serverUrl">Backend Server URL</label>
              <input
                id="serverUrl"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:5000"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="action-btn primary-btn" disabled={loading}>
              {loading ? 'Connecting...' : 'Login & Link Extension'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Rendering Controller view when Authenticated
  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo-section">
          <span className="logo-icon">👁️</span>
          <h1>Visual AI Agent</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          🚪
        </button>
      </header>

      <main className="popup-body">
        <div className="status-card">
          <div className="status-row">
            <span className="status-label">Agent Status</span>
            <span className={`status-indicator ${monitoringStatus}`}>
              {monitoringStatus === 'monitoring' ? (
                <>
                  <span className="pulse-dot"></span>
                  Monitoring Active
                </>
              ) : (
                'Idle'
              )}
            </span>
          </div>

          <div className="status-row">
            <span className="status-label">User Account</span>
            <span className="status-value text-ellipsis" title={userEmail || ''}>
              {userEmail}
            </span>
          </div>

          {monitoringStatus === 'monitoring' && lastCapture && (
            <div className="status-row">
              <span className="status-label">Last Screen Captured</span>
              <span className="status-value highlight">{lastCapture}</span>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>Monitoring Preferences</h3>
          
          <div className="form-group-inline">
            <label htmlFor="interval">Capture Interval (seconds)</label>
            <input
              id="interval"
              type="number"
              min="5"
              max="3600"
              value={screenshotInterval}
              onChange={(e) => setScreenshotInterval(Math.max(5, parseInt(e.target.value) || 5))}
              disabled={monitoringStatus === 'monitoring'}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="actions-section">
          {monitoringStatus === 'monitoring' ? (
            <button
              onClick={handleStopMonitoring}
              className="action-btn stop-btn"
              disabled={loading}
            >
              {loading ? 'Stopping...' : '🔴 Stop Monitoring Session'}
            </button>
          ) : (
            <button
              onClick={handleStartMonitoring}
              className="action-btn start-btn"
              disabled={loading}
            >
              {loading ? 'Starting...' : '🟢 Start Monitoring Session'}
            </button>
          )}

          <button onClick={openDashboard} className="action-btn secondary-btn">
            📊 Open Web Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};
