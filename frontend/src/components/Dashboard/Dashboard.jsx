import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { leadsAPI, formsAPI } from '../services/api';
import { getLeadColor, getLeadBgColor, formatDate } from '../utils/helpers';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, leadsRes, formsRes] = await Promise.all([
        leadsAPI.getStats(),
        leadsAPI.getAll(),
        formsAPI.getAll(),
      ]);

      setStats(statsRes.data.stats);
      setRecentLeads(leadsRes.data.leads.slice(0, 5));
      setForms(formsRes.data.forms);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={onLogout} />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Welcome back, {user.name}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 mb-4">
            <div className="stat-card">
              <div className="stat-label">Total Leads</div>
              <div className="stat-value">{stats?.total || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Converted</div>
              <div className="stat-value" style={{ color: '#10b981' }}>
                {stats?.converted || 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Conversion Rate</div>
              <div className="stat-value" style={{ color: '#3b82f6' }}>
                {stats?.conversionRate || 0}%
              </div>
            </div>
          </div>

          {/* Lead Classification Breakdown */}
          {stats?.byClassification && stats.byClassification.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Lead Classification</h2>
              </div>
              <div className="grid grid-cols-3">
                {stats.byClassification.map((item) => (
                  <div key={item._id} style={{ textAlign: 'center', padding: '1rem' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: '700',
                        backgroundColor: getLeadBgColor(item._id),
                        color: getLeadColor(item._id),
                      }}
                    >
                      {item.count}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {item._id === 'hot' ? '🔥 Hot Leads' : item._id === 'normal' ? '⚡ Normal Leads' : '❄️ Cold Leads'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {item.avgConfidence ? `${(item.avgConfidence * 100).toFixed(0)}% confidence` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Leads */}
          <div className="card mb-4">
            <div className="card-header flex-between">
              <h2 className="card-title">Recent Leads</h2>
              <Link to="/leads" className="btn btn-outline">
                View All
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <p>No leads yet. Share your forms to start collecting leads!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/leads')}
                  >
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getLeadBgColor(lead.classification),
                            color: getLeadColor(lead.classification),
                          }}
                        >
                          {lead.classification.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {formatDate(lead.createdAt)}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {lead.customerId?.name || 'Anonymous'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {lead.customerId?.email || 'No email'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Forms */}
          <div className="card">
            <div className="card-header flex-between">
              <h2 className="card-title">Your Forms</h2>
              <Link to="/forms" className="btn btn-primary">
                Create Form
              </Link>
            </div>
            {forms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <p>No forms yet. Create your first form to start collecting leads!</p>
                <Link to="/forms" className="btn btn-primary mt-2">
                  Create Your First Form
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {forms.slice(0, 4).map((form) => (
                  <div
                    key={form._id}
                    className="card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/forms')}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      {form.title}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {form.submissionCount} submissions
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {form.isActive ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          🤖 CEA
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/forms" className="navbar-link">
              Forms
            </Link>
          </li>
          <li>
            <Link to="/leads" className="navbar-link">
              Leads
            </Link>
          </li>
          <li>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {user.name}
            </span>
          </li>
          <li>
            <button onClick={onLogout} className="btn btn-outline">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Dashboard;