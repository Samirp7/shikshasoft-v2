# ShikshaSoft — Nepal School Management System 🇳🇵

A full-stack school management SaaS built for Nepal schools. Manage students, fees, attendance, results, and notices — all in one place.

## Tech Stack
- **Frontend**: React + Vite + Recharts
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT
- **Deploy**: Vercel (frontend) + Render (backend)

---

## Quick Start

### 1. Database Setup
Open MySQL Workbench and run:
```
backend/config/schema.sql
```
This creates all tables and a demo admin account.

### 2. Backend Setup
```bash
cd backend
npm install
# Edit .env — set your MySQL password
npm run dev
```
Backend runs on http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Demo Login
- Email: `admin@shikshasoft.com`
- Password: `password`

---

## Deploy to Production

### Frontend → Vercel
1. Push `frontend/` folder to GitHub
2. Go to vercel.com → Import repo
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend → Render
1. Push `backend/` folder to GitHub
2. Go to render.com → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env`

---

## Features
- ✅ Student registration and management
- ✅ Class and subject management  
- ✅ Daily attendance marking
- ✅ Fee structure and payment recording
- ✅ Exam results and NEB grading
- ✅ School notices
- ✅ Role-based access (Admin, Teacher, Accountant)
- ✅ JWT authentication
- ✅ Dashboard with charts

## Pricing (for schools)
| Plan | Price | Students |
|------|-------|----------|
| Basic | NPR 1,500/mo | Up to 200 |
| Standard | NPR 2,500/mo | Up to 500 |
| Premium | NPR 4,500/mo | Unlimited |

---

Built by Samir Parajuli — MIT Bagbazar, Kathmandu, Nepal
