TeamBoard — Project Management App
A full-stack MERN project management app with real-time collaboration and Kanban board.
🔗 Live Demo: team-task-manager-eta-tan.vercel.app

Tech Stack
FrontendReact 18 + Vite + Tailwind CSSBackendNode.js + Express.jsDatabaseMongoDB AtlasAuthJWT + bcryptjsReal-timeSocket.IO

Features

JWT authentication with role-based access (Admin / Member)
Create and manage projects with color labels
Drag-and-drop Kanban board (Todo / In Progress / Done)
Real-time task updates and comments via Socket.IO
Project analytics, activity logs, and overdue detection
Add/remove team members per project


Getting Started
bashgit clone https://github.com/Adarsh1212-21/Team-Task-Manager.git
cd Team-Task-Manager
Backend:
bashcd server
npm install
npm start
Frontend:
bashcd client
npm install
npm run dev
Required Environment Variables:
env# server/.env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

Deployment

Backend → Render — root directory: server
Frontend → Vercel — root directory: client
