# OpenFeedback

> A simple web app to collect anonymous feedback without any signups or accounts.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://openfeedback-t9mb.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 🌐 Live Website

Open the live website:  
👉 **[https://openfeedback-t9mb.onrender.com](https://openfeedback-t9mb.onrender.com)**

> ⏳ **Note about the live link:**  
> The site is hosted on Render's free tier. If no one has visited recently, the server goes into sleep mode to save resources. When opening the link for the first time, it might take **30 to 50 seconds** to wake up. Please wait a moment for the page to load!

---

## 📖 What is OpenFeedback?

**OpenFeedback** makes it easy to collect real, candid feedback from people without asking them to register or sign in.

There are **no accounts, no logins, and zero personal details collected**. When you type a topic name (like *"My Presentation"*, *"Design Review"*, or *"Team Retro"*), OpenFeedback instantly creates two simple links:

1. **🔗 Public Feedback Link (`/f/...`)**  
   Share this link with your audience, team, or friends. Anyone with the link can write and submit feedback anonymously in seconds. No names, emails, or IP addresses are ever saved.
2. **🔒 Secret Management Link (`/manage/...`)**  
   Save this link for yourself. It opens your private dashboard where you can read all received feedback, see category breakdowns, search messages, and download your data as a CSV file.

---

## ✨ Features

- **100% Anonymous**: No logins, email addresses, names, or IP tracking. Honest feedback without hesitation.
- **Instant Setup**: Create a topic in one click without signing up.
- **Two Simple Links**: One public link for collecting responses, and one secret link for managing them.
- **Categories**: Responders can tag their message as **Positive 👍**, **Improvement 💡**, or **General 💬**.
- **Real-Time Dashboard**: See responses appear live with visual breakdown percentages.
- **Search & Filter**: Quickly find specific feedback using the built-in search bar.
- **One-Click CSV Export**: Download all feedback into a spreadsheet anytime.
- **Bright & Dark Modes**: Clean theme switcher that remembers your preference with zero screen flicker.
- **Mobile Friendly**: Designed to look great and work smoothly on phones, tablets, and computers.

---

## 🛠️ Tech Stack

| Layer | Tools Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Hosting** | Render (Web Service + Cloud PostgreSQL) |

---

## 🚀 Getting Started Locally

Follow these quick steps to run the project on your computer.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** *(or use the built-in automatic runner)*

### 1. Clone the Repository

```bash
git clone https://github.com/VinayKrishna-7/Feedback_Application.git
cd Feedback_Application
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Files

Create a `.env` file in the `server` folder:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/openfeedback?schema=public"
CLIENT_URL="http://localhost:5173"
```

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

*(Note: Real `.env` files are automatically protected by `.gitignore`)*.

### 4. Setup Database

Generate Prisma client and create tables:

```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Start Development Server

Run both client and server together:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Running Tests

Run the automated tests:

```bash
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
