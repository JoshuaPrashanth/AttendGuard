import { initialStudents } from "../data/students";

const STUDENTS_KEY = "attendguard_students_v3";
const NOTIFICATIONS_KEY = "attendguard_notifications_v3";

export function loadStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) {
      return initialStudents;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialStudents;
  } catch (error) {
    console.warn(
      "Failed to load students from localStorage, falling back to initial data:",
      error,
    );
    return initialStudents;
  }
}

export function saveStudents(students) {
  try {
    if (!Array.isArray(students)) return;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (error) {
    console.warn("Failed to save students to localStorage:", error);
  }
}

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load notifications from localStorage:", error);
    return [];
  }
}

export function saveNotifications(notifications) {
  try {
    if (!Array.isArray(notifications)) return;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn("Failed to save notifications to localStorage:", error);
  }
}
