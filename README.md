# Smart Steel Plant Employee & Operations Management System

A full-stack, responsive web application for managing employees, attendance tracking, shift schedule allocations, leave applications, machine breakdown maintenance, and operational analytics in a steel plant.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Chart.js
- **Backend**: Node.js, Express.js, JWT Authentication, Multer, Bcrypt
- **Database**: MySQL

---

## Getting Started

### 1. Database Setup
Make sure you have a MySQL server running locally.
Run the following commands, or let the initialization script do it for you:

Default configuration credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=steel_plant_db
JWT_SECRET=supersecuresecretkey12345!@#
```

### 2. Backend Setup & Database Initialization
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database schema and populate seed data (default shifts, machines, and test employee logins):
   ```bash
   node config/init-db.js
   ```
4. Start the backend developer API server:
   ```bash
   npm run dev
   ```
   The backend API will start running on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The client application will launch on `http://localhost:3000` (proxied to backend on `5000`).

---

## Credentials (Seed Accounts)
Log in with the following default credentials to test user roles and access permissions:

| Employee ID | Password | Role | Access / Permissions |
| :--- | :--- | :--- | :--- |
| **EMP001** | `admin123` | **Admin** | Full system control, rosters, leave approvals, CRUD employees, statistics |
| **EMP002** | `tech123` | **Technician** | View and update assigned machine repair requests, log check-in |
| **EMP003** | `emp123` | **Employee** | Check-in/out, submit leave requests, report machine breakdowns (with photos) |
