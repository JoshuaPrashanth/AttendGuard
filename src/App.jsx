import { useState, useEffect } from "react";
import "./App.css";
import {
  calculateAttendance,
  getAttendanceStatus,
  getAttendanceSummary,
  getClassesNeeded,
} from "./services/attendanceService";
import {
  createNotificationRecord,
  sendAutomatedEmail,
  getWhatsAppLink,
} from "./services/notificationService";
import {
  loadStudents,
  saveStudents,
  loadNotifications,
  saveNotifications,
} from "./utils/storage";
import RecoverySimulator from "./features/recovery/RecoverySimulator";

function ShieldLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [students, setStudents] = useState(() => loadStudents());
  const [notifications, setNotifications] = useState(() => loadNotifications());
  const [activeNotification, setActiveNotification] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [toastBanner, setToastBanner] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Track which students have already received an automated Email
  const emailedStudentIds = new Set(
    notifications
      .filter((n) => n.channel === "Email" && n.status !== "Failed")
      .map((n) => n.studentId),
  );

  const enrichedStudents = students.map((student) => ({
    ...student,
    attendance: calculateAttendance(student),
  }));

  const summary = getAttendanceSummary(enrichedStudents, 75);
  const unsentShortageList = enrichedStudents.filter(
    (s) =>
      getAttendanceStatus(s, 75) === "Shortage" && !emailedStudentIds.has(s.id),
  );

  const filteredStudents = enrichedStudents.filter((student) => {
    const status = getAttendanceStatus(student, 75);
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      student.name.toLowerCase().includes(q) ||
      student.rollNo.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const showBanner = (type, text) => {
    setToastBanner({ type, text });
    setTimeout(() => {
      setToastBanner(null);
    }, 7000);
  };

  const handleSendEmailInstant = async (student) => {
    if (
      sendingId === student.id ||
      sendingAll ||
      emailedStudentIds.has(student.id)
    )
      return;
    setSendingId(student.id);

    const result = await sendAutomatedEmail(student, 75);
    const record = createNotificationRecord(
      student,
      "Email",
      75,
      result.status,
    );

    if (record) {
      setNotifications((prev) => [record, ...prev]);
      setActiveNotification({
        record,
        student,
        info: result.info,
        whatsappUrl: getWhatsAppLink(student, 75),
      });
    }

    showBanner(
      result.success ? "success" : "error",
      `${student.name}: ${result.info}`,
    );
    setSendingId(null);
  };

  const handleSendAllShortageEmails = async () => {
    if (sendingAll || unsentShortageList.length === 0) return;
    setSendingAll(true);

    let sentCount = 0;
    let failedCount = 0;
    let lastError = "";
    const newRecords = [];

    for (const student of unsentShortageList) {
      setSendingId(student.id);
      const result = await sendAutomatedEmail(student, 75);
      const record = createNotificationRecord(
        student,
        "Email",
        75,
        result.status,
      );
      if (record) {
        newRecords.push(record);
      }
      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        lastError = result.info;
      }
    }

    if (newRecords.length > 0) {
      setNotifications((prev) => [...newRecords, ...prev]);
      setActiveNotification({
        record: newRecords[0],
        student: unsentShortageList[0],
        info: `Batch dispatch complete: ${sentCount} sent, ${failedCount} failed.`,
        whatsappUrl: getWhatsAppLink(unsentShortageList[0], 75),
      });
    }

    if (failedCount === 0) {
      showBanner(
        "success",
        `Successfully dispatched automated emails to ${sentCount} shortage student${sentCount === 1 ? "" : "s"}.`,
      );
    } else {
      showBanner(
        "error",
        `Sent: ${sentCount}, Failed: ${failedCount}. Error: ${lastError}`,
      );
    }

    setSendingId(null);
    setSendingAll(false);
  };

  const handleSendWhatsAppDirect = (student) => {
    const record = createNotificationRecord(
      student,
      "WhatsApp",
      75,
      "Prepared",
    );
    if (record) {
      setNotifications((prev) => [record, ...prev]);
      setActiveNotification({
        record,
        student,
        info: `WhatsApp alert prepared for +${student.parentPhone}`,
        whatsappUrl: getWhatsAppLink(student, 75),
      });
    }

    const whatsappUrl = getWhatsAppLink(student, 75);
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navItems = [
    {
      id: "Overview",
      label: "Overview",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "Students",
      label: "Students",
      count: enrichedStudents.length,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "Notifications",
      label: "Notifications",
      count: notifications.length,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: "Recovery Simulator",
      label: "Recovery Simulator",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
    },
  ];

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div>
          <div className="brand-box">
            <div className="brand-logo-wrap">
              <ShieldLogo />
            </div>
            <div>
              <h1 className="brand-title">AttendGuard</h1>
              <p className="brand-sub">Attendance Intelligence</p>
            </div>
          </div>

          <div className="sidebar-section-label">Navigation</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {typeof item.count === "number" && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="admin-avatar">JP</div>
          <div>
            <div className="admin-name">College Admin</div>
            <div className="admin-role">CSE Department • MIT Mysore</div>
          </div>
        </div>
      </aside>

      <main className="main-workspace">
        <header className="page-header">
          <div>
            <h1 className="page-title">{activePage}</h1>
            <p className="page-subtitle">
              Automated attendance compliance monitoring, instant parent alerts
              &amp; recovery analytics
            </p>
          </div>
          <div className="header-badges">
            <span className="live-indicator">
              <span className="live-dot" />
              Alert Engine Active
            </span>
            <span className="threshold-pill">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Min Threshold: 75%
            </span>
          </div>
        </header>

        {toastBanner && (
          <div
            className={`toast-banner ${
              toastBanner.type === "success" ? "toast-success" : "toast-error"
            }`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {toastBanner.type === "success" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>{toastBanner.text}</span>
            </div>
            <button
              onClick={() => setToastBanner(null)}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                color: "inherit",
                fontSize: "1rem",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {activePage === "Overview" && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Total Students</span>
                <span
                  className="stat-icon-box"
                  style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              </div>
              <div className="stat-value">{summary.totalStudents}</div>
              <div className="stat-sub">Registered in current semester</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Safe Attendance</span>
                <span
                  className="stat-icon-box"
                  style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
              </div>
              <div className="stat-value" style={{ color: "#15803D" }}>
                {summary.safeStudents}
              </div>
              <div className="stat-sub">Meeting 75% requirement</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Attendance Shortage</span>
                <span
                  className="stat-icon-box"
                  style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
              </div>
              <div className="stat-value" style={{ color: "#B91C1C" }}>
                {summary.shortageStudents}
              </div>
              <div className="stat-sub">Action required below 75%</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span className="stat-label">Class Average</span>
                <span
                  className="stat-icon-box"
                  style={{ backgroundColor: "#F3E8FF", color: "#6D28D9" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
              </div>
              <div className="stat-value" style={{ color: "#4F46E5" }}>
                {summary.averageAttendance}%
              </div>
              <div className="stat-sub">Overall cohort mean</div>
            </div>
          </section>
        )}

        {activeNotification && (
          <section className="card-panel">
            <div className="card-header-row">
              <div className="card-title-group">
                <div className="card-title-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-title">
                    Dispatch Log — {activeNotification.student.name} (
                    {activeNotification.student.rollNo})
                  </h2>
                  <p className="card-desc">{activeNotification.info}</p>
                </div>
              </div>
              <button
                className="btn-outline"
                onClick={() => setActiveNotification(null)}
              >
                Dismiss
              </button>
            </div>

            <div className="alert-preview-card">
              <div className="alert-meta">
                <strong>Recipient Email:</strong>{" "}
                {activeNotification.student.email} &nbsp;•&nbsp;
                <strong>WhatsApp:</strong> +
                {activeNotification.student.parentPhone} &nbsp;•&nbsp;
                <strong>Status:</strong> {activeNotification.record.status}
              </div>
              <pre className="alert-body">
                {activeNotification.record.message}
              </pre>

              <div className="alert-actions">
                {activeNotification.whatsappUrl && (
                  <a
                    href={activeNotification.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    Open WhatsApp Chat
                  </a>
                )}

                <button
                  className="btn-outline"
                  onClick={() =>
                    handleCopyMessage(
                      activeNotification.record.message,
                      activeNotification.record.id,
                    )
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copiedId === activeNotification.record.id
                    ? "Copied"
                    : "Copy Message"}
                </button>
              </div>
            </div>
          </section>
        )}

        {(activePage === "Overview" || activePage === "Students") && (
          <section className="card-panel">
            <div className="card-header-row">
              <div className="card-title-group">
                <div className="card-title-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-title">Student Attendance Roster</h2>
                  <p className="card-desc">
                    Showing {filteredStudents.length} of{" "}
                    {enrichedStudents.length} registered students
                  </p>
                </div>
              </div>

              <div className="filter-toolbar">
                <button
                  className="btn-danger"
                  disabled={sendingAll || unsentShortageList.length === 0}
                  onClick={handleSendAllShortageEmails}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  {sendingAll
                    ? "Dispatching Batch..."
                    : unsentShortageList.length === 0
                      ? "All Shortage Notified"
                      : `Notify All Shortage (${unsentShortageList.length})`}
                </button>

                <div className="search-wrap">
                  <svg
                    className="search-icon-svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">
                    All Statuses ({enrichedStudents.length})
                  </option>
                  <option value="Safe">Safe ({summary.safeStudents})</option>
                  <option value="Shortage">
                    Shortage ({summary.shortageStudents})
                  </option>
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 16px",
                  color: "#64748B",
                }}
              >
                No students match &ldquo;{searchQuery}&rdquo; under the{" "}
                {statusFilter} filter.
              </div>
            ) : (
              <div className="table-scroll-wrapper">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Classes</th>
                      <th>Attendance</th>
                      <th>Status</th>
                      <th>Recovery Target</th>
                      <th>Automated Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const status = getAttendanceStatus(student, 75);
                      const needed = getClassesNeeded(student, 75);
                      const isSafe = status === "Safe";
                      const isSending = sendingId === student.id;
                      const alreadySent = emailedStudentIds.has(student.id);

                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="student-profile-cell">
                              <div className="student-avatar-circle">
                                {getInitials(student.name)}
                              </div>
                              <div>
                                <div className="student-name-cell">
                                  {student.name}
                                </div>
                                <div className="student-email-sub">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="roll-pill">{student.rollNo}</span>
                          </td>
                          <td>
                            <strong>{student.attended}</strong>{" "}
                            <span style={{ color: "#64748B" }}>
                              / {student.total}
                            </span>
                          </td>
                          <td>
                            <div className="pct-cell">
                              <strong>{student.attendance}%</strong>
                              <div className="progress-track">
                                <div
                                  className={
                                    isSafe
                                      ? "progress-fill-safe"
                                      : "progress-fill-shortage"
                                  }
                                  style={{
                                    width: `${Math.min(100, student.attendance)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                isSafe ? "badge-safe" : "badge-shortage"
                              }
                            >
                              {isSafe ? (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                              )}
                              {status}
                            </span>
                          </td>
                          <td>
                            {isSafe ? (
                              <span
                                style={{
                                  color: "#64748B",
                                  fontSize: "0.82rem",
                                }}
                              >
                                Eligible
                              </span>
                            ) : (
                              <strong
                                style={{
                                  color: "#B91C1C",
                                  fontSize: "0.84rem",
                                }}
                              >
                                +{needed} classes
                              </strong>
                            )}
                          </td>
                          <td>
                            {!isSafe ? (
                              <div className="action-btn-group">
                                <button
                                  className="btn-indigo"
                                  disabled={
                                    isSending || sendingAll || alreadySent
                                  }
                                  style={
                                    alreadySent
                                      ? {
                                          backgroundColor: "#E2E8F0",
                                          borderColor: "#CBD5E1",
                                          color: "#475569",
                                        }
                                      : undefined
                                  }
                                  onClick={() =>
                                    handleSendEmailInstant(student)
                                  }
                                >
                                  {alreadySent ? (
                                    <>
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                      Sent
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                      </svg>
                                      {isSending ? "Sending..." : "Send Email"}
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn-outline"
                                  onClick={() =>
                                    handleSendWhatsAppDirect(student)
                                  }
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#16A34A"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                  </svg>
                                  WhatsApp
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{ color: "#94A3B8", fontSize: "0.8rem" }}
                              >
                                No alert required
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {(activePage === "Overview" || activePage === "Notifications") && (
          <section className="card-panel">
            <div className="card-header-row">
              <div className="card-title-group">
                <div className="card-title-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-title">
                    Notification Audit Log ({notifications.length})
                  </h2>
                  <p className="card-desc">
                    Persistent history of all automated parent dispatches
                  </p>
                </div>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0 }}>
                No parent alerts dispatched yet. Click &ldquo;Notify All
                Shortage&rdquo; or &ldquo;Send Email&rdquo; on any shortage
                student above.
              </p>
            ) : (
              <div className="table-scroll-wrapper">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Channel</th>
                      <th>Recipient</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.studentName}</strong>
                        </td>
                        <td>
                          <span className="roll-pill">{item.rollNo}</span>
                        </td>
                        <td>{item.channel}</td>
                        <td>
                          {item.channel === "Email"
                            ? item.email
                            : item.parentPhone}
                        </td>
                        <td>
                          <span
                            className={
                              item.status === "Failed"
                                ? "badge-shortage"
                                : "badge-safe"
                            }
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ color: "#64748B", fontSize: "0.82rem" }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            className="btn-outline"
                            onClick={() =>
                              handleCopyMessage(item.message, item.id)
                            }
                          >
                            {copiedId === item.id ? "Copied" : "Copy Text"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {(activePage === "Overview" || activePage === "Recovery Simulator") && (
          <RecoverySimulator students={enrichedStudents} />
        )}
      </main>
    </div>
  );
}
