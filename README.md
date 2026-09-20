# AI-Based Internship & Placement Management System
*AIDS Integration: Job–Student Matching & Placement Analytics*

A complete, functional college DBMS mini-project built with React, Vite, Tailwind CSS, Recharts, Express.js, and MySQL / SQLite.

---

## 🌐 Deploy to Render (Step-by-Step Guide)

### Step 1: Push Code to GitHub
1. Create a new GitHub repository named `ai-placement-dbms`.
2. Push this project folder to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-placement-dbms.git
git push -u origin main
```

---

### Step 2: Deploy on Render

1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository `ai-placement-dbms`.
4. Render will automatically detect `render.yaml` Blueprint or configure settings manually as follows:
   - **Name**: `ai-placement-dbms`
   - **Environment**: `Node`
   - **Region**: Oregon (US West) or Singapore
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Click **Create Web Service**.

Render will automatically install dependencies, compile the React frontend distribution (`client/dist`), initialize the database, and launch the Web Service!

---

## 🔑 Demo Login Credentials
- **Admin**: `admin@placement.local` / `admin123`
- **Student**: `sahili@college.edu` / `student123`
- **Recruiter**: `recruiter@technova.local` / `recruiter123`
