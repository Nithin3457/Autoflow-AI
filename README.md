# AutoFlow AI - Autonomous Workflow Orchestrator

**AutoFlow AI** is an intelligent enterprise workflow orchestration platform that converts unstructured natural language organizational requests into structured, automated, end-to-end task workflows. Powered by Google Gemini (`gemini-2.5-flash`), Supabase Cloud PostgreSQL, Node.js/Express, and React (Vite) with Tailwind CSS.

---

## 🌟 Key Features

1. **AI Natural Language Understanding**:
   - Parses complex, unstructured prose (e.g., *"I need a new Macbook Pro M3 for my design work because my old one is broken, I need it by next Tuesday"*).
   - Strict categorization into 5 core operational domains: `IT_SUPPORT`, `MAINTENANCE`, `PROCUREMENT`, `HR_LEAVE`, and `DOCUMENT_APPROVAL`.
   - Automatic extraction of key entities (items, locations, affected teams, urgency deadlines).

2. **Autonomous Multi-Step Workflow Generation**:
   - Creates sequential directed acyclic task graphs with automated role & department assignments.
   - Low-risk requests fast-tracked; high-risk requests routed with managerial approval milestones.

3. **Dynamic SLA Tracking & Monitoring**:
   - Automatic deadline calculation per task step (`estimated_hours_to_complete`).
   - Visual SLA health indicators: **Safe** (>2h remaining), **Warning** (<2h remaining), **Breached** (overdue), and **Met**.

4. **Automated Workflow Progression & Request Auto-Resolution**:
   - Completing a task automatically activates the next sequential task in the pipeline.
   - Completing the final milestone automatically marks the parent request as `RESOLVED`.
   - Immutable audit logging in `workflow_logs`.

5. **Role-Based Row-Level Security (RLS) & Isolation**:
   - `EMPLOYEE`: Access restricted strictly to requests they submitted.
   - `TECHNICIAN` / `MANAGER`: Access tasks matching their role or functional department.
   - `ADMIN`: Full organizational oversight across all records.
   - Built-in header persona switcher to easily test and demonstrate RLS scopes.

6. **Executive Bottleneck Analytics Dashboard**:
   - Real-time KPI summary cards with trends.
   - Interactive Recharts visualization (Workload by department, categorical distribution, average completion durations).
   - Live alert feed for breached and warning SLAs.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase Cloud PostgreSQL (`pg` driver & `@supabase/supabase-js`) |
| **AI SDK** | Official `@google/genai` SDK (`gemini-2.5-flash` model) with structured JSON schemas |
| **Validation** | Zod (API request body and AI output schema validation) |
| **Auth Simulation** | `x-user-id` and `x-user-role` headers with Persona Switcher dropdown |

---

## 📁 Repository Structure

```
/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── RequestForm.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SLAIndicator.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TaskBoard.jsx
│   │   │   ├── UserSelector.jsx
│   │   │   └── WorkflowTimeline.jsx
│   │   ├── context/            # AuthContext (Mock persona state & headers)
│   │   ├── pages/              # Routes (Dashboard, Submit, Requests, Inbox, Details)
│   │   ├── utils/              # API client, formatters, and domain constants
│   │   ├── App.jsx             # Router and layout configuration
│   │   ├── index.css           # Custom glassmorphism & Tailwind design system
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Node.js Express Backend
│   ├── controllers/            # Request, Task, User, Analytics controllers
│   ├── db/                     # Dual-mode database layer & migration runner
│   ├── middlewares/            # Auth extraction, Zod validation, error masking
│   ├── routes/                 # Express API routes
│   ├── services/               # Gemini AI orchestrator & workflow progression
│   ├── server.js               # Server entry point (PORT 3000)
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Complete PostgreSQL DDL, RLS, and seed data
├── .env                        # Active environment variables
├── .env.example                # Template configuration
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm

### 2. Environment Setup
The project root contains `.env` with Supabase and Google Gemini credentials:
```env
PORT=3000
SUPABASE_URL=https://dabcxrjwvajizhnwcurz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Migration
To apply the schema to your Supabase Cloud PostgreSQL database:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/dabcxrjwvajizhnwcurz).
2. Go to **SQL Editor** in the left sidebar.
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
4. Click **Run** (▶).
*(Alternatively, run `npm run migrate` from the `server/` directory).*

### 4. Running the Application

**Start the Backend Server (Port 3000):**
```bash
cd server
npm start
```

**Start the Frontend App (Port 5173):**
```bash
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Testing the User Flows & Scenarios

1. **Submit a Complex Natural Language Request**:
   - Go to `/requests/new`.
   - Click the preset starter or type:
     *"I need a new Macbook Pro M3 for my design work because my old one is broken, I need it by next Tuesday"*.
   - Click **Submit to AI Orchestrator**.
   - Watch the animated states (*"Analyzing intent...", "Generating workflow...", "Assigning tasks..."*).
   - The AI automatically categorizes it as `PROCUREMENT`, sets high priority, extracts the entities, and creates 3 sequential tasks!

2. **Step-by-Step Task Advancement**:
   - On the Request Details view (`/requests/:id`), click **Complete Step** on Step #1.
   - Notice Step #2 automatically transitions from `PENDING` to `IN_PROGRESS`.
   - Complete the remaining tasks; notice the parent Request automatically updates to `RESOLVED`!

3. **Test Role-Based Security (RLS)**:
   - Use the **User Persona Selector** in the top navigation bar.
   - Switch between **Sarah Jenkins** (Employee), **Alex Rivera** (IT Tech), **Marcus Vance** (Facilities Tech), **Elena Rostova** (Manager), and **David Sterling** (Admin).
   - Notice how `/requests` and `/tasks` dynamically filter data according to the selected user's role and department.

---

## 🔒 Security Best Practices Implemented
- **Server-Side API Key Protection**: Google Gemini SDK is strictly isolated on the backend. The API key is never sent to the browser.
- **SQL Injection Prevention**: Parameterized queries and strict object mapping.
- **Error Masking**: Express error handler masks stack traces and internal prompt structures, returning standard JSON errors.
- **No Unsafe HTML**: All unstructured inputs sanitized with standard React escaping.
