# MineMagma – Training Tracking & Monitoring

React (Vite) version of the MineMagma training platform.

## Run

```bash
npm install
npm run dev        # development server
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Demo logins

| Role     | Username   | Password      |
|----------|------------|---------------|
| Employee | `employee` | `employee123` |
| Admin    | `admin`    | `admin123`    |

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
│   ├── LoginPage.jsx
│   ├── employee/             # Dashboard, Exam, Certificate
│   └── admin/AdminPage.jsx
└── styles/                   # variables, layout, components, login, certificate
```

## Notes

- Data is stored in the browser (`localStorage`); session in `sessionStorage`. This is a demo – passwords are plain text and
  the login is not secure. A real deployment needs a backend (API + database + hashed passwords).
- `xlsx` is loaded lazily, only when Excel import/export is used.
