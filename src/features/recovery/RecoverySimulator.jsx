import { useState, useEffect } from "react";
import { calculateProjectedAttendance } from "./recoveryEngine";

export default function RecoverySimulator({ students = [] }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id ?? "");
  const [futureClasses, setFutureClasses] = useState(10);
  const [missedClasses, setMissedClasses] = useState(0);

  useEffect(() => {
    if (
      students.length > 0 &&
      !students.some((s) => String(s.id) === String(selectedId))
    ) {
      setSelectedId(students[0].id);
    }
  }, [students, selectedId]);

  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="card-panel">
        <h2 className="card-title">Attendance Recovery Simulator</h2>
        <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>
          No student records available to simulate.
        </p>
      </div>
    );
  }

  const selectedStudent =
    students.find((s) => String(s.id) === String(selectedId)) || students[0];

  const handleFutureChange = (e) => {
    const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
    setFutureClasses(val);
    if (missedClasses > val) {
      setMissedClasses(val);
    }
  };

  const handleMissedChange = (e) => {
    const val = Math.max(
      0,
      Math.min(futureClasses, Number(e.target.value) || 0),
    );
    setMissedClasses(val);
  };

  const result = calculateProjectedAttendance(
    selectedStudent,
    futureClasses,
    missedClasses,
    75,
  );

  const isSafe = result.status === "Safe";

  return (
    <section className="card-panel">
      <div className="card-header-row">
        <div>
          <h2 className="card-title">Attendance Recovery Simulator</h2>
          <p
            style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6B7280" }}
          >
            Simulate how attending or missing upcoming classes affects the 75%
            eligibility threshold
          </p>
        </div>
        <span className={isSafe ? "badge-safe" : "badge-shortage"}>
          Projected: {result.status}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="sim-student"
            style={{ fontSize: "0.84rem", fontWeight: 600, color: "#374151" }}
          >
            Select Student
          </label>
          <select
            id="sim-student"
            value={selectedStudent.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="filter-select"
            style={{ width: "100%", padding: "9px 12px" }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.rollNo}) — {s.attended}/{s.total}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="sim-future"
            style={{ fontSize: "0.84rem", fontWeight: 600, color: "#374151" }}
          >
            Future Classes Planned: <strong>{futureClasses}</strong>
          </label>
          <input
            id="sim-future"
            type="number"
            min="0"
            max="100"
            value={futureClasses}
            onChange={handleFutureChange}
            className="search-input"
            style={{ width: "100%", minWidth: 0, padding: "9px 12px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="sim-missed"
            style={{ fontSize: "0.84rem", fontWeight: 600, color: "#374151" }}
          >
            Expected Classes Missed: <strong>{missedClasses}</strong> of{" "}
            {futureClasses}
          </label>
          <input
            id="sim-missed"
            type="range"
            min="0"
            max={futureClasses}
            value={missedClasses}
            onChange={handleMissedChange}
            disabled={futureClasses === 0}
            style={{
              width: "100%",
              marginTop: "10px",
              accentColor: "#4F46E5",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Current Attendance
          </div>
          <div
            style={{
              fontSize: "1.65rem",
              fontWeight: 700,
              color: "#111827",
              margin: "4px 0",
            }}
          >
            {result.currentAttendance}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            {selectedStudent.attended} / {selectedStudent.total} classes
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Projected Attendance
          </div>
          <div
            style={{
              fontSize: "1.65rem",
              fontWeight: 700,
              color: isSafe ? "#15803D" : "#B91C1C",
              margin: "4px 0",
            }}
          >
            {result.projectedAttendance}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            {result.projectedAttended} / {result.projectedTotal} classes
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
            }}
          >
            Consecutive Classes Still Needed
          </div>
          <div
            style={{
              fontSize: "1.65rem",
              fontWeight: 700,
              color: "#4F46E5",
              margin: "4px 0",
            }}
          >
            {result.additionalClassesNeeded}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            {result.additionalClassesNeeded === 0
              ? "Target 75% achieved"
              : "After simulated classes"}
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#EEF2FF",
          border: "1px solid #C7D2FE",
          color: "#1E1B4B",
          padding: "14px 16px",
          borderRadius: "8px",
          fontSize: "0.88rem",
          lineHeight: 1.55,
        }}
      >
        <strong>Simulation Breakdown:</strong> If{" "}
        <strong>{selectedStudent.name}</strong> attends{" "}
        <strong>{result.futureAttended}</strong> and misses{" "}
        <strong>{result.missedClasses}</strong> of the next{" "}
        <strong>{futureClasses}</strong> classes, attendance becomes{" "}
        <strong>
          {result.projectedAttended}/{result.projectedTotal} (
          {result.projectedAttendance}%)
        </strong>
        .{" "}
        {isSafe
          ? "This meets or exceeds the 75% minimum requirement."
          : `They will still need ${result.additionalClassesNeeded} consecutive class${
              result.additionalClassesNeeded === 1 ? "" : "es"
            } afterward to reach 75%.`}
      </div>
    </section>
  );
}
