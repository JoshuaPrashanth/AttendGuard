# AttendGuard — Intelligent Attendance Monitoring & Parent Alert System

AttendGuard is a web-based attendance monitoring application designed to help educational institutions identify students with low attendance and notify their parents before attendance shortages become serious.

It calculates attendance percentages, identifies students below the minimum attendance requirement, generates personalized parent alerts, and provides an attendance recovery simulator to help students understand how future attendance affects their eligibility.

## Problem Statement

**Automated Attendance Shortage Alerts**

Educational institutions often face difficulties identifying students with attendance shortages and informing their parents on time. Manual attendance checking and communication can be time-consuming and may delay necessary intervention.

AttendGuard aims to simplify this process through automated attendance monitoring and parent alert generation.

## Key Features

### 1. Attendance Monitoring

- View student attendance records.
- Calculate attendance percentages automatically.
- Identify students with attendance below the required threshold.
- Classify students as Safe or Shortage.

### 2. Attendance Dashboard

- Total number of students.
- Number of students with safe attendance.
- Number of students with attendance shortage.
- Average attendance percentage.
- Student-wise attendance overview.

### 3. Automated Parent Alert Generation

- Generate personalized attendance shortage messages.
- Include student name, roll number and current attendance percentage.
- Calculate the number of consecutive classes required to reach the minimum attendance threshold.
- Prepare messages for WhatsApp and email.

### 4. WhatsApp and Email Integration

- Open WhatsApp with a pre-filled parent notification.
- Open the default email application with a prepared alert.
- Allow administrators to review messages before sending.

_Note: Opening a messaging application does not confirm successful message delivery._

### 5. Notification History

- Maintain a record of generated notifications.
- Display notification details and preparation status.
- Preserve supported application data using browser localStorage.

### 6. Attendance Recovery Simulator

- Select a student.
- Specify the number of upcoming classes.
- Simulate different numbers of missed classes.
- Calculate projected attendance instantly.
- Display whether the student will meet the minimum attendance requirement.
- Calculate the additional consecutive classes needed to recover attendance.

## Technology Stack

| Technology             | Purpose                           |
| ---------------------- | --------------------------------- |
| React.js               | Frontend application              |
| JavaScript             | Application logic                 |
| Vite                   | Development server and build tool |
| CSS                    | User interface styling            |
| Browser localStorage   | Local data persistence            |
| WhatsApp Click-to-Chat | Parent message preparation        |
| Mailto links           | Email preparation                 |

## Attendance Calculation

Attendance percentage is calculated using:

\[
\text{Attendance Percentage} =
\frac{\text{Classes Attended}}{\text{Total Classes}}\times100
\]

The default minimum attendance requirement is **75%**.

- Attendance greater than or equal to 75%: Safe
- Attendance below 75%: Shortage

### Attendance Recovery Calculation

The number of consecutive future classes a student must attend to reach the required threshold is calculated using:

\[
x=\left\lceil\frac{MT-A}{1-M}\right\rceil
\]

Where:

- \(A\) = Classes attended
- \(T\) = Total classes
- \(M\) = Minimum attendance threshold as a decimal
- \(x\) = Additional consecutive classes required

This calculation assumes the student attends every upcoming class without missing any.

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Visual Studio Code or another code editor
- A modern web browser

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Folder

```bash
cd AttendGuard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

Open the localhost URL displayed in your terminal.

## Build for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Sample Demonstration Data

The application can be demonstrated using sample student records.

| Student | Roll Number | Attended | Total | Attendance |
| ------- | ----------- | -------: | ----: | ---------: |
| Aarav   | CS001       |       72 |    90 |      80.0% |
| Diya    | CS002       |       65 |    90 |      72.2% |
| Rohan   | CS003       |       60 |    90 |      66.7% |
| Meera   | CS004       |       78 |    90 |      86.7% |
| Arjun   | CS005       |       68 |    90 |      75.6% |
| Kavya   | CS006       |       55 |    90 |      61.1% |

## Project Structure

```text
AttendGuard/
├── public/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── StudentTable.jsx
│   │   └── StudentDetails.jsx
│   ├── services/
│   │   ├── attendanceService.js
│   │   └── notificationService.js
│   ├── data/
│   │   └── students.js
│   ├── utils/
│   │   └── storage.js
│   ├── features/
│   │   └── recovery/
│   │       ├── RecoverySimulator.jsx
│   │       └── recoveryEngine.js
│   ├── styles/
│   │   └── dashboard.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── README.md
```

## Future Enhancements

- Integration with real college attendance management systems.
- Secure administrator authentication.
- Centralized cloud database.
- Automatic scheduled parent notifications.
- Actual email and WhatsApp Business API integration.
- Multiple department and class management.
- Attendance reports and analytics.
- Student and parent portals.

## Project Limitations

- Demonstration data may be used instead of live institutional attendance records.
- Browser localStorage is used for local persistence and is not a centralized database.
- WhatsApp and email actions prepare messages but do not independently guarantee delivery.
- Scheduled notifications and institutional system integration require additional infrastructure.

## Project Objective

AttendGuard aims to reduce manual attendance monitoring, improve communication between educational institutions and parents, and help students take corrective action before their attendance falls further.

**AttendGuard — Monitor Early. Notify Parents. Improve Attendance.**
