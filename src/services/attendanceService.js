/**
 * Calculates attendance percentage rounded to 1 decimal place.
 */
export function calculateAttendance(student) {
  if (
    !student ||
    typeof student.attended !== "number" ||
    typeof student.total !== "number"
  ) {
    return 0;
  }
  if (student.total <= 0 || student.attended < 0) {
    return 0;
  }

  const rawPercentage = (student.attended / student.total) * 100;
  return Number(rawPercentage.toFixed(1));
}

/**
 * Determines whether a student's attendance is "Safe" or "Shortage".
 */
export function getAttendanceStatus(student, threshold = 75) {
  const attendance = calculateAttendance(student);
  return attendance >= threshold ? "Safe" : "Shortage";
}

/**
 * Calculates summary statistics across an array of students.
 */
export function getAttendanceSummary(students = [], threshold = 75) {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      totalStudents: 0,
      safeStudents: 0,
      shortageStudents: 0,
      averageAttendance: 0,
    };
  }

  const totalStudents = students.length;
  let safeStudents = 0;
  let shortageStudents = 0;
  let totalPercentageSum = 0;

  for (const student of students) {
    const pct = calculateAttendance(student);
    totalPercentageSum += pct;

    if (pct >= threshold) {
      safeStudents++;
    } else {
      shortageStudents++;
    }
  }

  const averageAttendance = Number(
    (totalPercentageSum / totalStudents).toFixed(1),
  );

  return {
    totalStudents,
    safeStudents,
    shortageStudents,
    averageAttendance,
  };
}

/**
 * Filters and returns students below the attendance threshold.
 */
export function getStudentsWithShortage(students = [], threshold = 75) {
  if (!Array.isArray(students)) return [];
  return students.filter((student) => calculateAttendance(student) < threshold);
}

/**
 * Calculates consecutive future classes needed to reach the threshold.
 * Formula: ceil((M * T - A) / (1 - M))
 */
export function getClassesNeeded(student, threshold = 75) {
  if (
    !student ||
    typeof student.attended !== "number" ||
    typeof student.total !== "number"
  ) {
    return 0;
  }
  if (student.total <= 0 || student.attended < 0) {
    return 0;
  }

  const currentPct = calculateAttendance(student);
  if (currentPct >= threshold) {
    return 0;
  }

  const M = threshold / 100;
  if (M >= 1) return 0; // Prevent division by zero if threshold is 100%

  const A = student.attended;
  const T = student.total;

  const needed = Math.ceil((M * T - A) / (1 - M));
  return needed > 0 ? needed : 0;
}
