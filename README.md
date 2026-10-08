# MADURA ERP / EIS — Complete 16-Week Enterprise System

[![CI Pipeline](https://github.com/madura-erp/madura-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/madura-erp/madura-erp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**MADURA ERP / EIS** is an enterprise resource planning and executive information system designed for the Madura Salt Industry (MSME and Industrial Salt Processors). It serves as the single continuous software engineering and testing subject across all 16 academic curriculum weeks.

---

## 1. System Architecture

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Laravel 12, PHP 8.4+, Eloquent ORM, Sanctum Token Authentication
- **Database**: PostgreSQL (Production/Docker) / SQLite (Deterministic Local Dev)
- **Course Control Center**: Dynamic 16-week progression switcher & Controlled Lab Defect injection mechanism

```
Browser
  ↓
Next.js (Port 3000)
  ↓
Laravel 12 REST API (Port 8000)
  ↓
PostgreSQL / SQLite Database
```

---

## 2. Quick Start (Local Development)

### Prerequisites
- PHP 8.3+ & Composer 2.x
- Node.js 20+ & npm
- Python 3.10+ (for ETL)

### Step 1: Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

### Step 2: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Pre-Seeded Academic Roles & Credentials

All users share the default password: `password123`

| Role | Email | Domain Responsibility |
| :--- | :--- | :--- |
| **ADMIN** | `admin@madura-erp.local` | System administrator, user access, audits |
| **MANAGER** | `manager@madura-erp.local` | Order & procurement approvals, EIS analysis |
| **SALES** | `sales@madura-erp.local` | Quotations & Sales Order management |
| **WAREHOUSE**| `warehouse@madura-erp.local` | Inventory cards, Goods Receipts, shipments |
| **PRODUCTION**| `production@madura-erp.local`| Salt refining, iodization, material consumption |
| **FINANCE** | `finance@madura-erp.local` | Customer billing, invoices, payment settlements|
| **CUSTOMER**| `customer@madura-erp.local` | Client portal inquiry |

---

## 4. Academic 16-Week Coverage

| Week | Activity | Module & Tool | Status |
| :---: | :--- | :--- | :---: |
| **W01** | SQA & V-Model | System Architecture & Verification Points | IMPLEMENTED |
| **W02** | Test Planning | Master Test Plan (`docs/test-plan/`) | IMPLEMENTED |
| **W03** | Black-box EP/BVA | Boundary checks on Quantity, Price, Discounts | IMPLEMENTED |
| **W04** | Decision Table & State Transition | Sales Order 7-State Workflow Machine | IMPLEMENTED |
| **W05** | White-box Testing | Services (`SalesOrderCalculator`, `InventoryService`) | IMPLEMENTED |
| **W06** | API Testing | Postman Collection & Newman suite (`api-tests/`) | IMPLEMENTED |
| **W07** | Test Automation | Playwright E2E Suite (`automation/playwright/`) | IMPLEMENTED |
| **W08** | UTS Testing Audit | Requirements Traceability & Defect Registry | IMPLEMENTED |
| **W09** | Performance Testing | k6 Load Test Scenarios (`performance/k6/`) | IMPLEMENTED |
| **W10** | Security Testing | OWASP ZAP Automation Spec (`security/zap/`) | IMPLEMENTED |
| **W11** | User Acceptance Testing (UAT)| Role-based acceptance scripts (`docs/uat/`) | IMPLEMENTED |
| **W12** | Implementation & Cutover | Phased / Big Bang Strategy (`docs/cutover/`) | IMPLEMENTED |
| **W13** | ETL / Data Migration | Python Pandas Pipeline (`migration/scripts/`) | IMPLEMENTED & VERIFIED |
| **W14** | CI/CD Deployment | GitHub Actions Workflows (`.github/workflows/`) | IMPLEMENTED |
| **W15** | Post Implementation Review | Maintenance & Defect Density Logs (`docs/pir/`)| IMPLEMENTED |
| **W16** | Final Deployment & Rollback | Docker Compose & Rollback Guides | IMPLEMENTED |

---

## 5. Controlled Lab Defect System

Under `Course Control Center` (`/course-center` or API `/api/qa/course-config`), instructors can set:
- `LAB_MODE=true`
- Toggle intentional faults:
  - `DEFECT_BOUNDARY_QUANTITY`
  - `DEFECT_DISCOUNT_CALCULATION`
  - `DEFECT_STOCK_CALCULATION`
  - `DEFECT_STATE_TRANSITION`
  - `DEFECT_AUTHORIZATION`

When `LAB_MODE=false`, the system strictly operates in production-safe mode.
