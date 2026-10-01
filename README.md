# Society Hub

A full-stack society recruitment platform built for NSUT students to discover societies, submit applications, and track their application status.

Society administrators can manage applications, set recruitment deadlines, create custom application questions, review student responses, and update application statuses in real time.

---

## ✨ Features

### 👨‍🎓 Student Features

* Student registration and login
* Secure password hashing using bcrypt
* JWT-based authentication
* Browse available societies
* View society details
* Apply to societies
* Answer custom application questions
* View submitted applications
* Track application status
* Real-time status updates
* Email notifications when application status changes

### 🛡️ Admin Features

* Admin authentication and role-based access control
* Society-specific application management
* View applicants
* View student details and application reasons
* View answers to custom application questions
* Accept or reject applications
* Set and update recruitment deadlines
* Server-side deadline enforcement
* Create custom application questions
* Application analytics
* Real-time applicant status updates

### ⚡ Real-Time Updates

Socket.IO is used to notify students immediately when an administrator changes their application status.

```text
Admin changes status
        ↓
REST API updates database
        ↓
Socket.IO emits event
        ↓
Student receives update
        ↓
Application status changes without refresh
```

### 📧 Email Notifications

Resend is integrated to send students an email when their application status is updated.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* Socket.IO Client

### Backend

* Node.js
* Express.js
* JWT
* bcrypt
* Socket.IO
* Resend

### Database

* MySQL
* Aiven

### Deployment

* Vercel — Frontend
* Render — Backend
* Aiven — Database

---

## 🏗️ Project Structure

```text
society-recruitment/
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Authorization

Society Hub uses JWT-based authentication.

Users receive a JWT after logging in, which is used to authenticate protected API requests.

The backend also implements role-based access control:

```text
Student
   ↓
Student-specific routes

Admin
   ↓
Admin-specific routes
```

Admin operations are verified on the server rather than relying only on frontend restrictions.

---

## 🗄️ Database

The application uses MySQL to persist:

* Students
* Societies
* Applications
* Application questions
* Application answers

Applications maintain relationships between students and societies, allowing administrators to manage applications belonging to their society.

---

## ⏰ Recruitment Deadlines

Administrators can configure a recruitment deadline.

The backend validates the deadline when an application is submitted, ensuring that applications cannot be submitted after the recruitment period has closed.

This validation is performed server-side rather than relying only on the frontend.

---

## 📊 Application Analytics

The admin dashboard provides an overview of applications:

* Total applications
* Pending applications
* Accepted applications
* Rejected applications

The analytics update when application statuses are changed.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/harshiii27/society-hub.git
cd society-hub
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder.

Example:

```env
DB_HOST=your_mysql_host
DB_PORT=your_mysql_port
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
```

**Do not commit your `.env` file to GitHub.**

### 5. Start the backend

From the `server` folder:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

## 🌐 Live Demo

### Frontend

[Society Hub](https://society-hub-woad.vercel.app/)

### Backend

[Society Hub API](https://society-hub-zsj4.onrender.com/)

### GitHub Repository

[GitHub Repository](https://github.com/harshiii27/society-hub)

---

## 🔄 Application Flow

```text
Student
   │
   ├── Register / Login
   │
   ├── Browse Societies
   │
   ├── Select Society
   │
   ├── Submit Application
   │
   └── Track Application
            │
            ▼
       Admin Dashboard
            │
            ├── Review Application
            │
            ├── View Answers
            │
            ├── Accept / Reject
            │
            ▼
      Database Updated
            │
       ┌────┴────┐
       ▼         ▼
  Socket.IO    Email
       │         │
       ▼         ▼
  Student UI   Notification
```

---

## 🎯 Project Goals

Society Hub was developed to provide a centralized platform for society recruitment, replacing fragmented application processes with a single system for:

* Society discovery
* Student applications
* Application management
* Recruitment deadlines
* Applicant evaluation
* Status tracking
* Real-time communication

---

## 👩‍💻 Author

**Harshita**

NSUT — Computer Science & Artificial Intelligence
