import React from 'react';

function getPercentage(student) {
  if (typeof student.attendance === 'number') {
    return Number(student.attendance.toFixed(1));
  }
  if (student.total > 0) {
    return Number(((student.attended / student.total) * 100).toFixed(1));
  }
  return 0;
}

export default function StudentDetails({ student, onClose, onNotifyParent }) {
  if (!student) return null;

  const percentage = getPercentage(student);
  const isSafe = percentage >= 75;

  return (
    <div
      className="ag-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-details-title"
    >
      <div
        className="ag-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ag-modal-header">
          <div>
            <h2 id="student-details-title" className="ag-modal-title">
              {student.name}
            </h2>
            <p className="ag-modal-subtitle">Roll No: {student.rollNo}</p>
          </div>
          <button
            type="button"
            className="ag-icon-close"
            onClick={onClose}
            aria-label="Close student details"
          >
            ✕
          </button>
        </div>

        <div className="ag-modal-body">
          <div className="ag-detail-banner">
            <div>
              <span className="ag-detail-label">Current Attendance</span>
              <div className="ag-detail-big-value">{percentage.toFixed(1)}%</div>
            </div>
            <span
              className={`ag-badge ${
                isSafe ? 'ag-badge-safe' : 'ag-badge-shortage'
              }`}
            >
              {isSafe ? 'Safe' : 'Shortage'}
            </span>
          </div>

          <div className="ag-detail-grid">
            <div className="ag-detail-item">
              <span className="ag-detail-label">Classes Attended</span>
              <span className="ag-detail-value">{student.attended}</span>
            </div>
            <div className="ag-detail-item">
              <span className="ag-detail-label">Total Classes</span>
              <span className="ag-detail-value">{student.total}</span>
            </div>
            <div className="ag-detail-item ag-detail-full">
              <span className="ag-detail-label">Parent Email</span>
              <span className="ag-detail-value">{student.email}</span>
            </div>
            <div className="ag-detail-item ag-detail-full">
              <span className="ag-detail-label">Parent Phone Number</span>
              <span className="ag-detail-value">{student.parentPhone}</span>
            </div>
          </div>
        </div>

        <div className="ag-modal-footer">
          <button
            type="button"
            className="ag-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="ag-btn-primary"
            onClick={() => onNotifyParent && onNotifyParent(student)}
          >
            Notify Parent
          </button>
        </div>
      </div>
    </div>
  );
}