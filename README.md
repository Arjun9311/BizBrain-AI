# BizBrain AI
> "Your Intelligent Business Copilot"

BizBrain AI is a production-ready AI-powered ERP platform for Small and Medium Businesses (SMEs). It combines a stunning, glassmorphic SaaS interface with a modular Node/Express API backend.

BizBrain AI groups **AI Assistants**, **CRM**, **Inventory**, **Finance**, **Sales Orders**, **Analytics graphs**, **HR Employee records**, **Support desks**, **Website builders**, and **Export panels** into a single cohesive system.

---

## 🛠 Tech Stack

- **Frontend**: React, Next.js (App Router), TypeScript, TailwindCSS, Recharts (visualizations), Framer Motion, Lucide React (icons)
- **Backend**: Node.js, Express.js, TypeScript
- **Database ORM**: Prisma (configured with SQLite by default for immediate runnability; PostgreSQL toggles are available)
- **AI Core**: Gemini API (with robust rule-based mock fallbacks if no API key is specified)
- **Auth**: JWT, Mock Single Sign-On

---

## 🚀 Setup & Execution

### Prerequisites
- **Node.js**: v18+ (tested on v25)
- **npm**

### Step 1: Install Dependencies
From the root directory, run the command to install packages for the root, frontend, and backend folders:
```bash
npm run install-all
```

### Step 2: Set Up Database (SQLite Dev Mode)
Initialize the database schemas and populate the mock data tables. This step creates a local SQLite `dev.db` file and populates it with a dummy business ("BizBrain HQ"), admin user, products, clients, expenses, and invoices:
```bash
cd backend
npx prisma db push
npm run prisma:seed
cd ..
```

### Step 3: Run Dev Servers
Run both the frontend (Port 3000) and backend (Port 5000) concurrently:
```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) to view the SaaS Landing Page.

---

## 🔐 Credentials (Hackathon Demo Profile)

Use the following details on the Login screen to test the fully functional dashboard:
- **Email**: `admin@bizbrain.ai`
- **Password**: `password123`
- *Alternatively, click **"Login with Mock Google Credentials"** on the Sign-in panel to instantly bypass login.*

---

## 🐘 Switching to PostgreSQL
To run the platform on PostgreSQL:
1. Open [schema.prisma](file:///c:/Users/Arjun/projects/startover%2026/backend/prisma/schema.prisma) and change the database provider block:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Open the backend environment file [backend/.env](file:///c:/Users/Arjun/projects/startover%2026/backend/.env) and update `DATABASE_URL` with your PostgreSQL server connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bizbrain_db?schema=public"
   ```
3. Re-run database pushes and generate client types:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

---

## 🐋 Running in Docker
To orchestrate containerized builds:
```bash
docker-compose up --build
```
This boots:
- Express backend container on `http://localhost:5000`
- Next.js frontend container on `http://localhost:3000`
