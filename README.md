# MineMagma – Training Tracking & Monitoring

React (Vite) version of the MineMagma training platform.

## Run

```bash
npm install
npm run dev        # development server
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Roles & logins

| Role     | Where                  | Username   | Password      |
|----------|------------------------|------------|---------------|
| Employee | `/` (Employee tab)     | `employee` | `employee123` |
| Manager  | `/` (Manager tab)      | `manager`  | `manager123`  |
| Admin    | `/admin` (hidden page) | `admin`    | `admin123`    |

- **Employee** – own training status, syllabus & circulars (all circulars visible), assessment, certificate.
- **Manager** (the old "admin") – monitor/update training records, add/import employees, view syllabus. Cannot delete employees or manage the question bank.
- **Admin** – `/admin`, not linked anywhere on the site. Full control: employees (edit/delete/passwords), managers, circulars & syllabus, question bank, PDF reports, settings (pass mark, defaults, admin password), backup/restore.
- Employees are **Regular** or **Contractual** (tabs, filters, reports). Reports download as **PDF only**.
- If hosted statically, configure the server to serve `index.html` for `/admin` (SPA fallback).

## Training compliance tracking (DGMS Circular 01/2026)

The site tracks training; it does not deliver it.

- **Mine category** per employee (Aboveground, Opencast, Underground, Gassy UG, Onshore/Offshore Oil) gives the minimum days from the circular's table (`src/constants/training.js`).
- **Training records:** an employee can have several (Initial, Refresher, Special, After absence/accident/job change, Other). The newest is the active one.
- **Fail flow:** below the pass mark -> additional training (2 days after initial, 1 after refresher) -> re-evaluation. Employees cannot re-attempt the online test until the additional days are recorded.
- **Practical field test** for highly skilled categories (required before the certificate).
- **Refresher due dates** (due in 30 days / overdue) on dashboards, tables, filters and PDF reports. The interval is a setting (Admin -> Settings); the circular does not state it, so confirm the value.
- **Certificates** carry the training type, category, dates and a serial number; a **Certificate Register** (PDF) lists them.
- Old data is migrated automatically: each existing employee becomes one Initial training record. Set their mine category to get the required days.

### Records, retention and audit

- **Attendance page** (Manager and Admin sidebar → *Attendance*): pick a date, mark Present / Half day / Absent / Leave for many employees at once ("Mark all unmarked as Present"), then Save. Shows employees whose training is still running; tick "Show all active employees" to include others. Writes into each employee's attendance register.
- **Attendance register** per training record (day-wise Present / Half day / Absent / Leave, range entry skips Sundays). When used, days completed are calculated from it.
- **Training log:** sessions with module, topic, trainer and hours. Warns when an OJT session has a trainer who is not an authorized OJT trainer.
- **Trainers register** (training officer, instructors, authorized OJT trainers), shown to manager and admin.
- **Archive instead of delete:** archived employees keep their records, cannot log in, and show "retain until" = leaving date + 5 years. Permanent delete (admin) is blocked until then, except for records created by mistake.
- **Retraining triggers:** one click creates a 3-day-minimum record for absence over 1 year, accident, job change or new technology.
- **Documents:** demo only, the file name/type/size are stored, not the file.
- **Audit log** (admin, Audit & Compliance): every change with user and time, PDF export.
- **PDFs:** inspection report (all training records), single employee record, trainers register, audit log, certificate register.

## Folder structure

```
src/
├── main.jsx                  # entry point, imports global styles
├── App.jsx                   # providers + login/app switch
├── constants/config.js       # pass mark, storage keys, filters
├── data/                     # seed employees, default questions
├── utils/                    # training rules, csv, excel, storage helpers
├── hooks/                    # usePersistentState, useCurrentEmployee
├── context/                  # DataContext (employees, questions), AuthContext
├── components/
│   ├── common/               # Pill, StatCard
│   ├── layout/               # AppShell, Topbar, Sidebar
│   └── admin/                # admin panel building blocks
├── pages/
│   ├── LoginPage.jsx         # staff login (/) and admin login (/admin)
│   ├── employee/             # Dashboard, Exam, Certificate
│   ├── manager/              # ManagerPage
│   ├── common/               # SyllabusPage (employees + managers)
│   └── admin/                # Overview, Employees, Managers, Circulars, Questions, Reports, Settings
└── styles/                   # variables, layout, components, login, certificate
```

## Notes

- Data is stored in the browser (`localStorage`); session in `sessionStorage`. This is a demo – passwords are plain text and
  the login is not secure. A real deployment needs a backend (API + database + hashed passwords).
- `xlsx` is loaded lazily, only when Excel import/export is used.
