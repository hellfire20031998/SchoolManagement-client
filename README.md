# Gridaan Academy - School Management System

Full-stack admin app for **students**, **classes**, and **tasks** (assignments). Includes a public landing page, JWT authentication, and a protected dashboard.

**Repository layout**

| Folder    | Role                                         |
|-----------|----------------------------------------------|
| `client/` | React (Vite + TypeScript + MUI + Tailwind)   |
| `server/` | Node.js + Express + MongoDB (Mongoose)       |

---

## Tech stack

- **Frontend:** React 19, Vite 6, TypeScript, React Router, MUI, Tailwind CSS 4, Framer Motion
- **Backend:** Express 4, Mongoose 8, JWT, bcryptjs, CORS, dotenv
- **Database:** MongoDB (local or Atlas)

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/...`) **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## Server setup (`../server`)

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Environment**

   Copy the example env file and edit values:

   ```bash
   cp .env.example .env
   ```

   | Variable        | Description |
   |-----------------|-------------|
   | `PORT`          | API port (default `5000`) |
   | `MONGODB_URI`   | MongoDB connection string |
   | `JWT_SECRET`    | Long random string for signing tokens |
   | `CLIENT_ORIGIN` | Allowed browser origins for CORS (comma-separated, no spaces). Include `http://localhost:5173` for local UI. Trailing slashes are normalized. |

3. **Run (development)**

   ```bash
   npm run dev
   ```

   API listens on `http://localhost:5000` (or your `PORT`). Health check: `GET /api/health`.

4. **Run (production)**

   ```bash
   npm start
   ```

---

## Client setup (`./` - this folder)

1. **Install dependencies**

   ```bash
   cd client
   npm install
   ```

2. **Environment (optional for local dev)**

   Create `.env` if you need to override defaults (see `.env.example`):

   | Variable              | When to set |
   |-----------------------|-------------|
   | `VITE_API_BASE_URL`   | Leave **empty** for local dev: requests use `/api` and Vite proxies to `http://localhost:5000`. Set to your **deployed API origin** (no trailing slash) for production builds pointing at a remote server. |

3. **Run (development)**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`. The server must be running for API calls unless `VITE_API_BASE_URL` points elsewhere.

4. **Build**

   ```bash
   npm run build
   npm run preview
   ```

---

## Features implemented

### Authentication

- Admin **register** and **login** (JWT stored in `localStorage`)
- Protected dashboard routes; unauthenticated users redirected to login
- `GET /api/auth/me` for session restore

### Students

- List with pagination, search, and class filter
- **Add** / **edit** / **delete** students
- Classes (grade, section, batch year) managed in the same flow

### Tasks (assignments)

- Assign tasks to one or many students (bulk)
- **Edit** task title, description, due date, status
- Mark **pending** / **completed** (including bulk and repeat toggles)
- List with pagination, search (title, description, student name), and status filter
- Delete (single and bulk)

### Public site

- Marketing **landing page** with hero carousel (images from `public/school/`) and campus carousel (`public/activity/`)
- Logged-in users can return to the landing page via the home icon in the dashboard app bar

### Deployment notes (optional)

- **Client:** e.g. Vercel - set root to `client`, add `VITE_API_BASE_URL` if the API is on another domain; `vercel.json` can proxy `/api` to your backend.
- **Server:** e.g. Render/Fly/Railway - set env vars from `.env.example`; ensure `CLIENT_ORIGIN` includes every frontend URL you use.

Image paths for carousels are listed in `src/data/landingMedia.ts` - add files under `public/school/` and `public/activity/` and update that file when filenames change.

---

## API overview (all under `/api`, JWT required except auth)

| Area     | Examples |
|----------|----------|
| Auth     | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Classes  | `GET/POST /classes`, ... |
| Students | `GET /students`, `POST /students`, `PUT /students/:id`, `DELETE /students/:id`, `GET /students/minimal` |
| Tasks    | `GET /tasks`, `POST /tasks`, `POST /tasks/bulk`, `PUT /tasks/:id`, `PATCH /tasks/:id/complete`, `DELETE /tasks/:id`, bulk status/delete routes |

Send `Authorization: Bearer <token>` for protected routes.

---

## Example flow (assignment brief)

1. Register or log in as admin.
2. Add a **class** (e.g. Class 10, section A).
3. Add a **student** (e.g. Rahul) linked to that class.
4. Open **Tasks** and assign homework to Rahul (or use bulk assign).
5. Mark the task complete when done.

---

## Scripts summary

| Location | Command         | Purpose          |
|----------|-----------------|------------------|
| `server` | `npm run dev`   | API + watch      |
| `server` | `npm start`     | API production   |
| `client` | `npm run dev`   | Vite dev server  |
| `client` | `npm run build` | Production build |

---

## License

Private / educational use - adjust as needed for your submission.
