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

## 🟢 Running & Deploying Natively (Node.js)

Since migrating from Docker to native Node.js, we use standard npm scripts and PM2 to manage build/run states.

### Native Scripts (Root Directory)
We've configured several scripts in the root [package.json](package.json) to make local management and cloud deployment straightforward:

* **Install all dependencies** (Root, Backend, and Frontend):
  ```bash
  npm run install-all
  ```
* **Database Setup & Seed** (Prisma DB Push + Populate Sample Data):
  ```bash
  npm run db-setup
  ```
* **Build both Frontend & Backend**:
  ```bash
  npm run build-all
  ```
* **Run in Development Mode** (Concurrently starts backend on `5000` and frontend on `3000` with hot-reload):
  ```bash
  npm run dev
  ```
* **Start Backend (Production Mode)**:
  ```bash
  npm run start-backend
  ```
* **Start Frontend (Production Mode)**:
  ```bash
  npm run start-frontend
  ```

### Production Deployment using PM2
For continuous production hosting on VPS, cloud servers, or native environments, install PM2 globally:
```bash
npm install -g pm2
```

Start both the API backend and Next.js frontend concurrently in the background:
```bash
pm2 start ecosystem.config.js
```

Useful PM2 Commands:
* Check status: `pm2 status`
* Monitor logs: `pm2 logs`
* Restart all processes: `pm2 restart all`
* Stop all processes: `pm2 stop all`

