# SkillForge

## 1️⃣ Project Overview

SkillForge is a full-stack online learning platform where instructors publish courses and students enroll to learn, track progress, take quizzes and earn certificates. Students can enroll in courses, work through lessons, ask questions about specific lessons, and take end-of-course quizzes, while instructors manage course content and check enrolled student's progress.

## 2️⃣ Features

- **Authentication** — Secure signup/login for both students and instructors, with password reset via email
- **Course & Lesson Management** — Instructors create, update, and delete courses and their lessons
- **Enrollment** — Students enroll in courses; enrollment is restricted to logged-in students only (instructors cannot self-enroll)
- **Progress Tracking** — Students' progress through course lessons is tracked as they move through content
- **Quizzes** — End-of-course quizzes to assess student understanding
- **Certificates** — Auto-generated certificates on course completion
- **Account Management** — Users can securely delete their account from the dashboard

## 3️⃣ Tech Stack

| Technology | Role |
|---|---|
| **HTML/CSS/JavaScript** | Frontend UI — no framework, built with plain JS for direct DOM control and a lighter learning curve across the team |
| **Node.js + Express** | Backend REST API server handling routing, business logic, and middleware (auth checks, error handling) |
| **MongoDB** | Primary database — stores users, courses, lessons, enrollments, quizzes, and queries as flexible, document-based collections that map naturally to nested course/lesson structures |
| **Mongoose** | ODM layer for MongoDB — schema validation and model definitions |
| **JWT (JSON Web Tokens)** | Stateless authentication — tokens issued on login and stored in the browser's localStorage, sent with each authenticated request |
| **bcrypt** | Password hashing before storage, so raw passwords are never persisted |
| **Nodemailer** | Sends forgot-password / reset-password emails with secure, time-limited reset links |
| **pdfkit** | Customize certificates that students can download as pdf after completion of any course |

**Flow:** The frontend makes authenticated requests to the Express API using a JWT stored in localStorage. The backend validates the token via middleware, executes business logic in controllers, and reads/writes data through Mongoose models to MongoDB. Media uploads (thumbnails, lesson assets) are pushed to Cloudinary and their URLs are stored in MongoDB documents. Password reset flows trigger emails via the email service with a signed, expiring reset link.

## 4️⃣ Project Structure

```
skillforge/
├── frontend/
│   ├── pages/          # HTML pages (login, signup, dashboard, course, lesson, etc.)
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side logic — API calls, DOM handling, auth state
│           
│
└── backend/
    ├── routes/          # Express route definitions (auth, courses, lessons, enrollment, quizzes)
    ├── controllers/     # Request handling & business logic per route
    ├── models/          # Mongoose schemas (User, Course, Lesson, Enrollment, Quiz, Certificate)
    ├── middleware/       # JWT verification, role checks (student/instructor), error handling
    ├── config/           # DB connection, Cloudinary config, email service config
    └── server.js         # App entry point
```

## 5️⃣ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm
- A MongoDB instance (local or MongoDB Atlas)
- An email service account/API key (for password reset emails)

### Environment Variables
Create a `.env` file inside `/backend`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

EMAIL_HOST=your_email_provider_host
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password_or_app_key
```

### Setup Steps

1. Clone the repository
   ```
   git clone <repo-url>
   cd skillforge
   ```
2. Install backend dependencies
   ```
   cd backend
   npm install
   ```
3. Add the `.env` file as described above
4. Start the backend server
   ```
   npm run dev
   ```
5. Open the `frontend` folder with **Live Server** (or serve it with any static file server) to run the client

## 6️⃣ Usage

1. **Sign up** as either a Student or an Instructor.
2. **Log in** — you're redirected to your role-specific dashboard.
3. **Instructors**: create courses, add lessons, and quiz of those courses.
4. **Students**: browse available courses and enroll (enrollment requires being logged in as a student — instructors and logged-out users are blocked with a styled error message, and successful enrollment shows a confirmation message).
5. **Students**: move through enrolled lessons, ask questions on a specific lesson, and track progress.
6. **Students**: complete the end-of-course quiz to receive an auto-generated certificate.
7. From either dashboard, a user can delete their account via the **Delete Account** button at the bottom of the sidebar, which asks for confirmation before proceeding.

## 7️⃣ Engineering Decisions

- **Plain HTML/CSS/JS over a frontend framework**: Chosen to keep the learning curve low across a 3-person team working under a 3-week deadline, and to keep direct control over DOM/UI without added build tooling.
- **MongoDB over a relational database**: Course content (courses → lessons → quizzes) is naturally nested and varies in shape between courses, which fits a document database better than rigid relational tables.
- **JWT over session-based auth**: Chosen for statelessness — no server-side session store needed, which simplifies the backend and scales more easily since each request is self-authenticating via the token.
- **JWT stored in localStorage**: Simpler to implement client-side within the project timeline than httpOnly cookies, at the trade-off of some XSS exposure versus cookie-based storage.
- **bcrypt for password hashing**: Industry-standard, one-way hashing so plaintext passwords are never stored, even if the database is compromised.
- **Role-based access control at the middleware level**: Student vs. instructor permissions (e.g., blocking instructor self-enrollment) are enforced centrally in middleware rather than scattered per-route, keeping access rules consistent.

## 8️⃣ Testing

- **Backend**: All API endpoints (auth, course/lesson CRUD, enrollment, progress, queries, quizzes) were manually tested using **Thunder Client + Postman**, checking both success responses and expected error cases (e.g., unauthorized access, invalid role attempting an action).
- **Frontend**: The client was tested by running it through **Live Server** and manually walking through each user flow (signup/login, enrollment, lesson queries, quiz completion, account deletion) to confirm correct behavior and UI states.
- No automated test suite is included yet — testing was manual/exploratory for this project cycle.

## 9️⃣ Limitations & Future Improvements

- No automated test suite (unit/integration tests) yet — all testing was manual
- No payment/paid-course feature — all courses are currently free to enroll in
- No real-time query section on each lesson for students
- No admin role/dashboard for platform-wide moderation
- Search and filtering for courses could be expanded (e.g., by category, difficulty, rating)