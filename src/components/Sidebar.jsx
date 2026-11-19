import React from 'react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'recovery', label: 'Recovery Simulator', icon: '📈' },
];

export default function Sidebar({ activePage = 'overview', onNavigate }) {
  return (
    <aside className="ag-sidebar">
      <div className="ag-sidebar-header">
        <div className="ag-logo-badge">🛡️</div>
        <div>
          <h1 className="ag-brand-title">AttendGuard</h1>
          <p className="ag-brand-subtitle">Attendance Intelligence</p>
        </div>
      </div>

      <nav className="ag-nav" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`ag-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate && onNavigate(item.id)}
            >
              <span className="ag-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="ag-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="ag-sidebar-footer">
        <div className="ag-admin-avatar">A</div>
        <div className="ag-admin-info">
          <div className="ag-admin-name">Admin</div>
          <div className="ag-admin-role">College Administrator</div>
        </div>
      </div>
    </aside>
  );
}