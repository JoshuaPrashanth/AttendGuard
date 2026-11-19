import React from 'react';

const TYPE_CONFIG = {
  total: { icon: '👥', className: 'stat-total' },
  safe: { icon: '✅', className: 'stat-safe' },
  shortage: { icon: '⚠️', className: 'stat-shortage' },
  average: { icon: '📊', className: 'stat-average' },
};

export default function StatCard({ title, value, subtitle, type = 'total' }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.total;

  return (
    <div className={`ag-stat-card ${config.className}`}>
      <div className="ag-stat-top">
        <span className="ag-stat-title">{title}</span>
        <span className="ag-stat-icon" aria-hidden="true">
          {config.icon}
        </span>
      </div>
      <div className="ag-stat-value">{value}</div>
      {subtitle && <div className="ag-stat-subtitle">{subtitle}</div>}
    </div>
  );
}