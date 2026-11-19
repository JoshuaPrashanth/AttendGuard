import React, { useState } from 'react';

function getPercentage(student) {
  if (typeof student.attendance === 'number') {
    return Number(student.attendance.toFixed(1));
  }
  if (student.total > 0) {
    return Number(((student.attended / student.total) * 100).toFixed(1));
  }
  return 0;
}

export default function StudentTable({ students = [], onViewStudent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredStudents = students.filter((student) => {
    const percentage = getPercentage(student);
    const isSafe = percentage >= 75;

    // 1. Apply status filter
    if (statusFilter === 'safe' && !isSafe) return false;
    if (statusFilter === 'shortage' && isSafe) return false;

    // 2. Apply search query (name or roll number)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const matchesName = student.name.toLowerCase().includes(query);
      const matchesRoll = student.rollNo.toLowerCase().includes(query);
      return matchesName || matchesRoll;
    }

    return true;
  });

  return (
    <section className="ag-table-card">
      <div className="ag-table-toolbar">
        <div>
          <h2 className="ag-section-title">Student Attendance</h2>
          <p className="ag-section-subtitle">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>

        <div className="ag-controls">
          <div className="ag-search-wrapper">
            <span className="ag-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="ag-search-input"
              placeholder="Search by name or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search students by name or roll number"
            />
          </div>

          <select
            className="ag-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter students by attendance status"
          >
            <option value="all">All Students</option>
            <option value="safe">Safe (&ge; 75%)</option>
            <option value="shortage">Shortage (&lt; 75%)</option>
          </select>
        </div>
      </div>

      <div className="ag-table-responsive">
        <table className="ag-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Classes Attended</th>
              <th>Attendance Percentage</th>
              <th>Status</th>
              <th className="ag-text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="ag-empty-state">
                  No students match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const percentage = getPercentage(student);
                const isSafe = percentage >= 75;

                return (
                  <tr key={student.id}>
                    <td className="ag-student-name">{student.name}</td>
                    <td className="ag-roll-no">{student.rollNo}</td>
                    <td>
                      {student.attended} / {student.total}
                    </td>
                    <td className="ag-percentage">{percentage.toFixed(1)}%</td>
                    <td>
                      <span
                        className={`ag-badge ${
                          isSafe ? 'ag-badge-safe' : 'ag-badge-shortage'
                        }`}
                      >
                        {isSafe ? 'Safe' : 'Shortage'}
                      </span>
                    </td>
                    <td className="ag-text-right">
                      <button
                        type="button"
                        className="ag-btn-view"
                        onClick={() => onViewStudent && onViewStudent(student)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}