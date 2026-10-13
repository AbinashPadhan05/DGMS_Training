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
