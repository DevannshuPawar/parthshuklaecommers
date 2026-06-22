# ShopKart E-Commerce Platform

A full-stack e-commerce application built with **React.js**, **Node.js**, **Express.js**, and **MySQL**.

---

## 🗂 Project Structure

```
E-Commers/
├── backend/         → Node.js + Express.js API (Port 5000)
├── frontend/        → React.js Customer Panel (Port 3000)
└── admin/           → React.js Admin Panel (Port 3001)
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [XAMPP](https://www.apachefriends.org/) (for MySQL)

---

## 🚀 Setup & Run

### Step 1: Database Setup
1. Start XAMPP → Start **Apache** and **MySQL**
2. Open **phpMyAdmin** → `http://localhost/phpmyadmin`
3. Create a new database: `shopkart_db`
4. Import the schema: `backend/database/schema.sql`

### Step 2: Backend
```bash
cd backend
npm install          # Install dependencies
npm run seed         # Seed admin, categories, products
npm run dev          # Start dev server (nodemon)
```
Backend runs at: `http://localhost:5000`

### Step 3: Customer Frontend
```bash
cd frontend
npm install
npm start            # Runs on port 3000
```
Customer panel: `http://localhost:3000`

### Step 4: Admin Panel
```bash
cd admin
npm install
npm start            # Runs on port 3001
```
Admin panel: `http://localhost:3001`

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopkart.com | Admin@123 |

---

## 📡 API Endpoints

| Module | Base URL |
|--------|----------|
| Auth | `/api/auth` |
| Products | `/api/products` |
| Categories | `/api/categories` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Users | `/api/users` |
| Dashboard | `/api/dashboard` |

---

## 💳 Payment

- Integrated with **Razorpay** for secure payments
- Supports Card, UPI, Net Banking, Wallet

---

## 🗺️ Delivery Location

- Customer location is captured via browser Geolocation API at checkout
- Latitude & Longitude are stored with each order
- Admin can view the Google Maps link in Order Details

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MySQL (via XAMPP) |
| Auth | JWT + bcrypt |
| Payment | Razorpay |
| Uploads | Multer |
