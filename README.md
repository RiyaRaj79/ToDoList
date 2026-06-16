# ⚡ TaskFlow X — AI-Powered Productivity Platform

> A premium, full-stack task management platform with AI assistance, gamification, habit tracking, real-time sync, and beautiful glassmorphism design.

![TaskFlow X](https://img.shields.io/badge/TaskFlow-X-6366f1?style=for-the-badge&logo=lightning&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss)

---

## 🚀 Features

### ✅ Smart Task Management
- Create, edit, delete, and complete tasks
- Priority levels: **Critical / High / Medium / Low**
- Due dates with overdue detection
- Recurring tasks (daily, weekly, monthly)
- Task categories & color coding
- Tags and subtasks
- Drag-and-drop task reordering
- **Voice-to-Task** (Web Speech API)
- PDF export

### 🤖 AI Productivity Assistant
- Break tasks into subtasks (AI-generated)
- Smart priority suggestions based on task title
- Daily plan generation with time scheduling
- Productivity insights and analysis
- Chat-style conversational AI interface
- 100% offline-capable (no API key needed)

### 📊 Productivity Dashboard
- Tasks completed today, weekly trends
- 7-day completion trend chart (AreaChart)
- Category breakdown pie chart
- Priority distribution bars
- Productivity score (0-100) with animated ring gauge
- Daily streak tracker with heatmap

### 🎮 Gamification
- **XP system** — earn XP for completing tasks (10-50 XP per task)
- **Level progression** — 10 titled levels from Novice to Transcendent
- **Achievement badges** (First Task, Week Warrior, Legend, etc.)
- **Daily streaks** with streak preservation
- **Pomodoro XP** — +2 XP per focus minute
- **Habit XP** — +15 XP per habit completion

### 🎯 Focus Mode (Pomodoro)
- Animated circular progress ring
- 25/5/15 minute work/short/long break cycles
- Fullscreen distraction-free mode
- Customizable timer durations
- Session history log
- Browser push notifications
- Automatic XP logging

### 🗂️ Kanban Board
- 4 columns: **To Do → In Progress → Review → Done**
- Full drag-and-drop between columns (dnd-kit)
- Real-time API sync on card move
- Visual progress indicators per card

### 📅 Calendar View
- Monthly, Weekly, Daily views (react-big-calendar)
- Color-coded events by priority
- Click-to-add tasks on date slots
- Task detail popup on event click

### 🔥 Habit Tracker
- Create habits with custom icon & color
- 7-day heatmap visualization
- Daily streak tracking
- Frequency settings (daily/weekdays/weekends/weekly)

### 😊 Mood Tracker (API)
- Daily mood logging (1-5 scale)
- Mood labels: terrible/bad/okay/good/excellent
- Factor tracking (sleep, work, exercise)
- 30-day trend analysis

### 🔔 Smart Notifications
- Browser push notifications for Pomodoro completion
- Toast notifications for all actions
- In-app notification panel

### 📡 Real-Time
- Socket.IO for live task sync across browser tabs
- Authenticated socket connections with JWT

### 🌐 PWA Support
- Installable on mobile devices
- Offline-capable (service worker ready)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, Framer Motion |
| **State** | Zustand (with persistence) |
| **Charts** | Recharts (AreaChart, PieChart, BarChart) |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Calendar** | react-big-calendar |
| **HTTP Client** | Axios (with JWT interceptors) |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (access + refresh tokens), Google OAuth (optional) |
| **Real-Time** | Socket.IO |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Validation** | express-validator |
| **Security** | Helmet, express-rate-limit, bcryptjs |

---

## 📁 Project Structure

```
taskflow-x/
├── client/                    # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json      # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # AppLayout, Sidebar, Navbar
│   │   │   └── tasks/         # TaskCard, TaskForm
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Marketing landing page
│   │   │   ├── Auth/          # Login, Register, AuthCallback
│   │   │   ├── Dashboard.jsx  # Analytics dashboard
│   │   │   ├── Tasks.jsx      # Task list view
│   │   │   ├── Kanban.jsx     # Kanban board
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── Focus.jsx      # Pomodoro timer
│   │   │   ├── Analytics.jsx  # AI assistant
│   │   │   ├── Habits.jsx     # Habit tracker
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js         # Axios service layer
│   │   │   └── socket.js      # Socket.IO client
│   │   ├── store/
│   │   │   └── index.js       # Zustand stores
│   │   ├── utils/
│   │   │   └── helpers.js     # Utilities, PDF export
│   │   ├── App.jsx            # Router + toaster
│   │   ├── main.jsx
│   │   └── index.css          # Global styles + Tailwind
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── server/                    # Express.js backend
    ├── config/
    │   ├── db.js              # MongoDB connection
    │   └── passport.js        # Google OAuth
    ├── controllers/
    │   ├── authController.js
    │   ├── taskController.js
    │   ├── analyticsController.js
    │   ├── habitController.js
    │   ├── moodController.js
    │   └── aiController.js
    ├── middleware/
    │   ├── authMiddleware.js  # JWT protect + token gen
    │   ├── errorHandler.js
    │   └── validate.js
    ├── models/
    │   ├── User.js
    │   ├── Task.js
    │   ├── Habit.js
    │   └── MoodEntry.js
    ├── routes/
    │   ├── auth.js
    │   ├── tasks.js
    │   ├── analytics.js
    │   ├── habits.js
    │   ├── mood.js
    │   └── ai.js
    ├── services/
    │   └── aiService.js       # Smart mock AI engine
    ├── socket/
    │   └── socketHandler.js   # Socket.IO events
    ├── app.js                 # Express app
    ├── server.js              # HTTP server + Socket.IO
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com))
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd taskflow-x

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflowx
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/taskflowx

JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=disabled
GOOGLE_CLIENT_SECRET=disabled

# OpenAI (optional — mock AI works without this)
OPENAI_API_KEY=disabled
USE_MOCK_AI=true
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Development

```bash
# Terminal 1 — Start backend
cd server
npm run dev    # uses nodemon for auto-reload
# OR without nodemon:
node server.js

# Terminal 2 — Start frontend
cd client
npx vite
```

Open **http://localhost:5173** in your browser.

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (email + password) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update profile / settings |
| POST | `/api/auth/focus-session` | Log Pomodoro session |
| GET | `/api/auth/google` | Google OAuth redirect |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Toggle completion + award XP |
| PATCH | `/api/tasks/reorder` | Bulk reorder (drag & drop) |
| GET | `/api/tasks/categories` | Get user's categories |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Full dashboard data |
| GET | `/api/analytics/productivity-score` | Productivity score (0-100) |
| GET | `/api/analytics/streaks` | Streak information |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/subtasks` | Generate subtasks |
| POST | `/api/ai/suggest-priority` | Suggest task priority |
| GET | `/api/ai/daily-plan` | Generate optimized daily plan |
| POST | `/api/ai/insights` | Get productivity insights |
| GET | `/api/ai/quote` | Motivational quote |
| GET | `/api/ai/tip` | Productivity tip |

### Habits & Mood
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/complete` | Mark habit done today |
| GET | `/api/mood` | Get mood entries |
| POST | `/api/mood` | Log daily mood |
| GET | `/api/mood/trend` | 30-day mood trend |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `client`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.render.com/api
   VITE_SOCKET_URL=https://your-backend.render.com
   ```
5. Deploy!

### Backend → Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables (all from `server/.env`)
5. Deploy!

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist `0.0.0.0/0` in Network Access
4. Get your connection string and set as `MONGODB_URI`

### Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://your-backend.render.com/api/auth/google/callback`
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your server env

---

## 🎮 XP & Level System

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Novice | 0 |
| 2 | Apprentice | 50 |
| 3 | Productive | 200 |
| 4 | Focused | 450 |
| 5 | Efficient | 800 |
| 6 | Expert | 1,250 |
| 7 | Master | 1,800 |
| 8 | Grandmaster | 2,450 |
| 9 | Legend | 3,200 |
| 10 | Transcendent | 4,050+ |

**XP Sources:**
- Complete Critical task: **+50 XP**
- Complete High task: **+30 XP**
- Complete Medium task: **+20 XP**
- Complete Low task: **+10 XP**
- Pomodoro focus minute: **+2 XP**
- Habit completion: **+15 XP**
- Mood logging: **+5 XP**
- Registration: **+50 XP**

---

## 🏆 Achievement Badges

| Badge | Condition |
|-------|-----------|
| 🎯 First Step | Complete your first task |
| 🚀 Getting Started | Complete 10 tasks |
| ⚡ Task Master | Complete 50 tasks |
| 🏆 Legend | Complete 100 tasks |
| 🔥 Week Warrior | Maintain a 7-day streak |
| 💎 Month Master | Maintain a 30-day streak |
| ⭐ Rising Star | Reach level 5 |
| 🎖️ Expert | Reach level 10 |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free for personal and commercial use.

---

<div align="center">
  <strong>Built with ❤️ for maximum productivity</strong><br/>
  <em>TaskFlow X — Work smarter, achieve more.</em>
</div>
