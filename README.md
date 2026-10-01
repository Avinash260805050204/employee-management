# Smart Steel Plant Employee & Operations Management System

A full-stack, responsive web application designed to streamline employee administration and industrial operations in a steel manufacturing environment. The system provides modules for employee management, attendance tracking, leave management, shift scheduling, machine maintenance, notifications, and operational analytics through an intuitive role-based dashboard.

## 🚀 Features

* 👥 Employee Management (Add, Update, Delete, Search) 
* 📅 Attendance Management
* 📝 Leave Management
* ⏰ Shift Scheduling     
* 🔧 Machine Maintenance Tracking
* 📢 Notifications
* 📊 Dashboard Analytics with Charts
* 👤 Role-Based Dashboards (Admin, Technician, Employee)
* 📱 Responsive Modern UI
* 🌐 RESTful API Integration
* 💾 MySQL Database with JSON Mock Database Fallback

---

# 🛠 Tech Stack

## Frontend

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios
* Chart.js

## Backend

* Node.js
* Express.js
* REST APIs
* Multer
* Bcrypt

## Database

* MySQL
* JSON Mock Database (Offline Fallback)

## Deployment

* Vercel (Frontend)
* Render (Backend)
* Railway MySQL

---

# 📂 Project Structure

```text
frontend/
backend/
```

---

# ⚙️ Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Avinash260805050204/employee-management.git
cd employee-management
```

---

## 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```
Create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=steel_plant_db
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

Initialize the database:

```bash
node config/init-db.js
```


Start the backend server:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## 3. Frontend Setup

Navigate to the frontend folder:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 👤 Demo Mode

The application is configured in **Demo Mode** for easy evaluation.

Instead of logging in, users are presented with a **Role Selection** screen where they can choose one of the following roles:

* 👑 Admin
* 🔧 Technician
* 👨‍🏭 Employee

After selecting a role, the corresponding dashboard is loaded immediately.

This allows reviewers to explore the complete application without authentication while preserving role-based functionality.

---

# 📊 Modules

## Admin

* Dashboard Analytics
* Employee Management
* Attendance Management
* Leave Approval
* Shift Management
* Maintenance Monitoring
* Notifications

## Technician

* Dashboard
* Assigned Maintenance Tasks
* Machine Status
* Attendance
* Notifications

## Employee

* Dashboard
* Attendance
* Leave Requests
* Personal Information
* Notifications

---

# 📈 Dashboard

The dashboard provides:

* Employee Statistics
* Attendance Overview
* Leave Summary
* Maintenance Statistics
* Interactive Charts

---

# 🔐 Authentication

The original project included JWT-based authentication.

For demonstration purposes, the deployed version uses a **Role Selection** interface instead of a login page, allowing reviewers to access Admin, Technician, and Employee dashboards directly.

---

# 🌐 Deployment

Frontend:

* Vercel

Backend:

* Render

Database:

* Railway MySQL

---
# 🏗 System Architecture

```text
React Frontend
      │
Axios API Requests
      ▼
Express REST API
      │
      ▼
MySQL Database
      │
JSON Mock Database (Fallback)



---

# 👨‍💻 Developed By

**Surya Avinash Sanapala **

B.Tech Computer Science & Engineering

ANITS (2023–2027)
