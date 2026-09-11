# QEVN HRMS — People Operations Operating System

> Production-ready Human Resource Management System for QEVN built with Next.js (App Router), TypeScript, Supabase PostgreSQL, and the QEVN Maximalist Design System.

---

## ⚡ Features & Modules

- **Command Center Dashboard**: Actionable clickable KPI cards linked directly to filtered views, Attention Required queue, Lifecycle Radar, and Department Headcount charts.
- **People Directory**: Comprehensive master records for Employees, Interns, Contractors, and Consultants with multi-facet filtering, Add Person modal, and soft deactivation/archival.
- **Master Person Profile**: 8 tabbed views covering Overview, Historical Assignment Changes, Attendance Matrix, Leave Balances, Document Vault & Checklist, Onboarding Tasks, HR Timeline & Actions, and Performance Snapshots.
- **Time & Attendance**: Real-time daily tracking, bulk marking, monthly employee-by-day calendar matrix, and audited attendance correction with mandatory reasons.
- **Leave & Holidays**: Automatic working days duration calculation (excluding weekends and company holidays), multi-state approval flow (Approve, Reject, Clarify), and **automatic attendance synchronization on approval**.
- **Document Vault**: Private categorized storage (Joining, Employment, Internship, Performance, Exit), Required Document Compliance Matrix (% complete), and Expiring Documents Radar (&le; 45 days).
- **Onboarding & Lifecycle Radar**: Joiner task checklists with assignees/due dates, Probation Radar with confirmation/extension workflows, Internship Milestones with certificate tracking, and Offboarding history.
- **Enterprise Reports & Exports**: 6 Core Reports with live generation of CSV, styled Excel (`.xlsx`), and PDF reports.
- **Spreadsheet Import Wizard**: 4-step migration wizard for CSV/XLSX legacy spreadsheets with smart column mapping, row validation engine, and batch commit.
- **Compliance Audit Trail**: Immutable event logger with Before vs After JSON state diff viewer.
- **Settings & Business Policies**: Configurable departments, designations, leave types, holidays, and document rules.
- **Phases 2–4 Scalability Hub**: Pre-architected schema and feature flag matrix for ATS Recruitment, Asset Management, Performance KPIs, Payroll Handoff, and AI HR Assistant.

---

## 🛠 Tech Stack

- **Frontend / Framework**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom QEVN Maximalist Neo-Brutalist Theme
- **Backend / Database**: Supabase PostgreSQL + Row Level Security (RLS)
- **Auth & Storage**: Supabase Auth + Supabase Storage Private Buckets
- **Data Export**: `xlsx` (SheetJS) + `jspdf` + `jspdf-autotable`
- **Data Import / Parser**: `papaparse` + `xlsx`
- **Charts & Visuals**: `recharts` + `lucide-react`
- **Validation**: `zod` + `react-hook-form`
- **Notifications**: `sonner`

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/qevn-org/Qevn-HRMS.git
cd Qevn-HRMS
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEFAULT_TIMEZONE=Asia/Kolkata
STORAGE_MAX_FILE_SIZE_MB=10
```

### 3. Run Migrations (Supabase)
Apply SQL migrations located in `supabase/migrations/`:
- `001_core_tables.sql`
- `002_roles_permissions_rls.sql`
- `003_functions_triggers.sql`
- `006_future_phases_schema.sql`

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run automated domain test suite:
```bash
npx tsx src/lib/__tests__/hrms.test.ts
```

Run production build:
```bash
npm run build
```

---

## 🔒 Security & Privacy

- All confidential employee documents are stored in private Supabase Storage buckets.
- Row Level Security (RLS) protects sensitive employee notes and audit records.
- Soft deactivation preserves complete historical records without destructive loss.
- Every state mutation generates an immutable audit record with actor, reason, and before/after diffs.
