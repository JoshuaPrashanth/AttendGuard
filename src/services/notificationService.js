import { calculateAttendance, getClassesNeeded } from "./attendanceService";

const EMAILJS_SERVICE_ID = "service_p0gg9cr";
const EMAILJS_TEMPLATE_ID = "template_qygktxh";
const EMAILJS_PUBLIC_KEY = "mxyNtl1drFCYLoMp-";

export function generateParentMessage(student, threshold = 75) {
  if (!student) return "";

  const attendance = calculateAttendance(student);
  const classesNeeded = getClassesNeeded(student, threshold);

  return `Attendance Shortage Alert

Dear Parent,

This is to inform you that your ward ${student.name} (${student.rollNo}) currently has an attendance percentage of ${attendance}%, which is below the required ${threshold}%.

Your ward needs to attend the next ${classesNeeded} consecutive classes to reach the required attendance, assuming no further absences.

Kindly ensure regular attendance.

Regards,
College Administration`;
}

export function createNotificationRecord(
  student,
  channel = "Email",
  threshold = 75,
  status = "Sent",
) {
  if (!student) return null;

  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    studentId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    parentPhone: student.parentPhone || "",
    email: student.email || "",
    channel,
    message: generateParentMessage(student, threshold),
    status,
    createdAt: new Date().toISOString(),
  };
}

export async function sendAutomatedEmail(student, threshold = 75) {
  if (!student || !student.email) {
    return { success: false, status: "Failed", info: "Missing email address" };
  }

  const email = student.email.trim();
  const subject = `Attendance Shortage Alert - ${student.name} (${student.rollNo})`;
  const message = generateParentMessage(student, threshold);

  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: email,
            user_email: email,
            recipient: email,
            name: "AttendGuard Administration",
            title: subject,
            subject: subject,
            message: message,
            email: "joshuaprashanth.in@gmail.com",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: "Failed",
        info: `Delivery failed (${response.status}): ${errorText}`,
      };
    }

    return {
      success: true,
      status: "Sent",
      info: `Email sent to ${email} — check Gmail Sent folder!`,
    };
  } catch (error) {
    return {
      success: false,
      status: "Failed",
      info: error.message || "Network error while sending email",
    };
  }
}

export function getWhatsAppLink(student, threshold = 75) {
  if (!student || !student.parentPhone) return null;

  const digitsOnly = String(student.parentPhone).replace(/\D/g, "");
  if (digitsOnly.length < 10) return null;

  const message = generateParentMessage(student, threshold);
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function getEmailLink() {
  return null;
}
