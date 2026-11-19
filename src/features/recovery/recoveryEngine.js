import {
  calculateAttendance,
  getAttendanceStatus,
  getClassesNeeded,
} from "../../services/attendanceService";

/**
 * Projects future attendance given planned future classes and expected misses.
 */
export function calculateProjectedAttendance(
  student,
  futureClasses = 10,
  missedClasses = 0,
  threshold = 75,
) {
  if (
    !student ||
    typeof student.attended !== "number" ||
    typeof student.total !== "number"
  ) {
    return {
      currentAttendance: 0,
      projectedAttendance: 0,
      projectedAttended: 0,
      projectedTotal: 0,
      futureAttended: 0,
      missedClasses: 0,
      status: "Shortage",
      additionalClassesNeeded: 0,
    };
  }

  const safeFuture = Math.max(0, Math.floor(Number(futureClasses) || 0));
  const safeMissed = Math.min(
    safeFuture,
    Math.max(0, Math.floor(Number(missedClasses) || 0)),
  );

  const futureAttended = safeFuture - safeMissed;
  const projectedAttended = student.attended + futureAttended;
  const projectedTotal = student.total + safeFuture;

  const currentAttendance = calculateAttendance(student);
  const projectedAttendance =
    projectedTotal > 0
      ? Number(((projectedAttended / projectedTotal) * 100).toFixed(1))
      : 0;

  const projectedStudent = {
    attended: projectedAttended,
    total: projectedTotal,
  };

  const status = getAttendanceStatus(projectedStudent, threshold);
  const additionalClassesNeeded = getClassesNeeded(projectedStudent, threshold);

  return {
    currentAttendance,
    projectedAttendance,
    projectedAttended,
    projectedTotal,
    futureAttended,
    missedClasses: safeMissed,
    status,
    additionalClassesNeeded,
  };
}
