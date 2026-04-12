# Internix — Smart Internship Management System

A full-stack, multi-platform application (Web + Mobile) for managing the complete internship lifecycle: tasks, attendance, reports, and certification.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Web Frontend | React (Vite), Tailwind CSS, Zustand |
| Mobile App | Flutter (Dart), Provider |
| Auth | JWT with role-based access control |
| File Storage | Cloudinary |
| PDF Generation | PDFKit |

## Project Structure

```
Internix/
├── backend/          # Express.js REST API
│   └── src/
│       ├── config/       # DB & Cloudinary config
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, error, validation
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routes
│       ├── utils/        # Token gen, PDF gen, seeder
│       └── validators/   # Zod schemas
├── web/              # React + Vite frontend
│   └── src/
│       ├── components/   # Layout, Sidebar, Header, UI
│       ├── lib/          # Axios instance
│       ├── pages/        # All page components
│       └── store/        # Zustand stores
├── mobile/           # Flutter mobile app
│   └── lib/
│       ├── config/       # Theme, API config
│       ├── providers/    # State management (Provider)
│       ├── screens/      # All screen widgets
│       └── services/     # HTTP API service
└── README.md
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage users, create internships, assign mentors, view analytics, generate certificates |
| **Mentor** | Assign/manage tasks, mark attendance, review reports, provide feedback |
| **Student** | View/complete tasks, mark attendance, upload reports, track progress, download certificates |

---

## Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier works)
- **Flutter SDK** v3.0+ (for mobile app)

---

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a **free cluster** (M0 Sandbox)
3. Go to **Database Access** → Add a database user (e.g., `anantyash902` / your password)
4. Go to **Network Access** → Add `0.0.0.0/0` (Allow All) for development
5. Go to **Databases** → Click **Connect** → Choose **Connect your application**
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://anantyash902:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password and add database name:
   ```
   mongodb+srv://anantyash902:yourpassword@cluster0.xxxxx.mongodb.net/internix?retryWrites=true&w=majority
   ```

### 2. Cloudinary Setup

1. Go to [https://cloudinary.com](https://cloudinary.com) and create a free account
2. From the Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Backend Setup

```bash
cd backend

# Copy env file and fill in your values
copy .env.example .env
# Edit .env with your MongoDB URI, Cloudinary keys, and JWT secret

# Install dependencies
npm install

# Seed admin user (email: admin@internix.com / password: admin123)
npm run seed

# Start development server
npm run dev
```

The backend runs at **http://localhost:5000**.

#### Backend `.env` file (fill in real values):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://anantyash902:YOUR_PASSWORD@cluster0.YOUR_ID.mongodb.net/internix?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_secret_string_at_least_32_chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 4. Web Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Create env file
copy .env.example .env
# Default VITE_API_URL=http://localhost:5000/api works if backend runs on port 5000

# Start development server
npm run dev
```

The web app runs at **http://localhost:5173**.

### 5. Flutter Mobile App Setup

```bash
cd mobile

# Get dependencies
flutter pub get

# Run on Android emulator or connected device
flutter run
```

#### API URL Configuration for Mobile

Edit `mobile/lib/config/api_config.dart`:

| Platform | URL |
|----------|-----|
| Android Emulator | `http://10.0.2.2:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Physical Device | `http://YOUR_PC_IP:5000/api` |

To find your PC IP: run `ipconfig` on Windows, look for IPv4 address.

---

## Default Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@internix.com | admin123 |

Register new students and mentors through the app or API.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |

### Users (Admin/Mentor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users/assign-mentor` | Assign mentor to student |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filtered by role) |
| POST | `/api/tasks` | Create task (Mentor/Admin) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Student marks attendance |
| POST | `/api/attendance/mark` | Mentor marks for student |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports |
| POST | `/api/reports` | Upload report (multipart) |
| PUT | `/api/reports/:id/review` | Review report (Mentor) |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates` | List certificates |
| POST | `/api/certificates` | Generate certificate (Admin) |
| GET | `/api/certificates/:id/download` | Download PDF |

### Internships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/internships` | List internships |
| POST | `/api/internships` | Create internship (Admin) |
| PUT | `/api/internships/:id` | Update internship |
| POST | `/api/internships/:id/enroll` | Enroll student |
| DELETE | `/api/internships/:id` | Delete internship |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Role-aware dashboard analytics |

---

## Deployment

### Backend → Render
1. Push code to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all `.env` variables in Render's Environment settings

### Web → Vercel
1. Push `web/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set root directory to `web`
4. Framework: Vite
5. Add env variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Database → MongoDB Atlas
Already set up in step 1 above.

---

## Workflow Summary

1. **Admin** logs in → creates Internships → assigns Mentors
2. **Mentor** creates Tasks for students → reviews Reports → marks Attendance
3. **Student** views Tasks → marks Attendance → uploads Reports → downloads Certificates
4. **Admin** generates Certificates for completed students
