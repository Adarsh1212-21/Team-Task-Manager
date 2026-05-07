# Team Flow - Project Management Application

A full-stack project management web application built with the MERN stack, featuring real-time collaboration, role-based access control, and a clean Kanban board interface.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS v3   |
| Backend     | Node.js + Express.js                |
| Database    | MongoDB Atlas                       |
| Auth        | JWT + bcryptjs                      |
| Real-time   | Socket.IO                           |
| Charts      | Recharts                            |
| DnD         | @hello-pangea/dnd                   |

---

## Features

### Authentication & Authorization
- JWT-based login/signup with bcrypt password hashing
- Role-based access: **Admin** and **Member**
- Protected routes on both frontend and backend

### Admin Features
- Create, edit, delete projects with color labels
- Add/remove team members from projects
- Create and assign tasks with full control
- View project analytics (status, priority, member performance)
- Access activity logs

### Member Features
- View assigned projects and tasks
- Update own task status via Kanban board or task detail
- Comment on tasks (real-time via Socket.IO)
- Personal task dashboard with filters

### Task Management
- Full task schema: title, description, deadline, priority, assignee, status
- Drag-and-drop Kanban board (Todo / In Progress / Done)
- Task search and priority/status filters
- Overdue task detection

### Dashboard
- Task completion stats and circular progress indicator
- Recent tasks overview
- Quick action shortcuts

### Real-time Features (Socket.IO)
- Live task creation, updates, and deletions across the project board
- Live comments on task detail view
- Real-time member additions/removals

### Activity Logs
- Tracks: project creation, task assignment, status changes, comments

---

## Project Structure

```
project-management-app/
├── client/                    # React Frontend
│   └── src/
│       ├── api/axios.js       # Axios instance + all API helpers
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth context
│       ├── pages/             # Route pages
│       └── socket/            # Socket.IO client
├── server/                    # Node/Express Backend
│   ├── config/                # DB + Socket.IO setup
│   ├── controllers/           # Route logic
│   ├── middleware/            # Auth, role, validation, error
│   ├── models/                # Mongoose schemas
│   └── routes/                # Express route files
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd project-management-app

# Install all dependencies
npm run install:all
```

### 2. Configure Environment Variables

**Server** – copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/projectmanagement
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** – copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or separately:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Description         | Auth  |
|--------|-----------------------|---------------------|-------|
| POST   | /api/auth/register    | Register user       | -     |
| POST   | /api/auth/login       | Login user          | -     |
| GET    | /api/auth/me          | Get current user    | JWT   |
| PUT    | /api/auth/profile     | Update profile      | JWT   |
| GET    | /api/auth/users       | Get all users       | Admin |

### Projects
| Method | Endpoint                         | Auth         |
|--------|----------------------------------|--------------|
| GET    | /api/projects                    | JWT          |
| POST   | /api/projects                    | JWT          |
| GET    | /api/projects/:id                | Member       |
| PUT    | /api/projects/:id                | Project Admin|
| DELETE | /api/projects/:id                | Project Admin|
| POST   | /api/projects/:id/members        | Project Admin|
| DELETE | /api/projects/:id/members/:uid   | Project Admin|
| GET    | /api/projects/:id/analytics      | Member       |

### Tasks
| Method | Endpoint                         | Auth   |
|--------|----------------------------------|--------|
| GET    | /api/tasks/dashboard             | JWT    |
| GET    | /api/tasks/my                    | JWT    |
| GET    | /api/tasks/project/:projectId    | JWT    |
| POST   | /api/tasks                       | JWT    |
| GET    | /api/tasks/:id                   | JWT    |
| PUT    | /api/tasks/:id                   | JWT    |
| DELETE | /api/tasks/:id                   | JWT    |
| PUT    | /api/tasks/reorder               | JWT    |

### Comments
| Method | Endpoint                         | Auth   |
|--------|----------------------------------|--------|
| GET    | /api/comments/task/:taskId       | JWT    |
| POST   | /api/comments/task/:taskId       | JWT    |
| DELETE | /api/comments/:id                | JWT    |

### Activities
| Method | Endpoint                          | Auth   |
|--------|-----------------------------------|--------|
| GET    | /api/activities                   | Admin  |
| GET    | /api/activities/project/:id       | JWT    |

---

## Deployment

### Backend → Railway
1. Push to GitHub
2. Create new Railway project → connect repo
3. Set root directory to `server`
4. Add environment variables in Railway dashboard
5. Deploy

### Frontend → Vercel
1. Create new Vercel project → connect repo
2. Set root directory to `client`
3. Add `VITE_API_URL=https://your-railway-backend.railway.app`
4. Add `VITE_SOCKET_URL=https://your-railway-backend.railway.app`
5. Deploy

---

## Database Collections

| Collection   | Key Fields                                              |
|--------------|---------------------------------------------------------|
| users        | name, email, password (hashed), role, isActive         |
| projects     | name, owner, members[], status, priority, deadline      |
| tasks        | title, project, assignedTo, status, priority, deadline  |
| comments     | content, task, author                                   |
| activitylogs | action, description, user, project, task                |

---

## License
MIT
