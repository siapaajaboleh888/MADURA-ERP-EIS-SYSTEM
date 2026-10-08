# System Architecture Document — MADURA ERP / EIS

## 1. Context and Scope
MADURA ERP / EIS is an integrated enterprise system engineered for salt manufacturing, packaging, and distribution MSMEs operating across Madura (Sumenep, Sampang, Pamekasan).

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------+
|                      Client Layer                         |
|     Next.js 16 (App Router) + TypeScript + Tailwind CSS   |
|         (Port 3000 / Production Nginx Reverse Proxy)      |
+-----------------------------+-----------------------------+
                              | HTTPS / JSON
                              v
+-----------------------------------------------------------+
|                    Application Layer                      |
|           Laravel 12 REST API + PHP 8.4 Engine            |
|                   (Sanctum Bearer Token)                  |
|  +-----------------------------------------------------+  |
|  | Isolated Business Services:                         |  |
|  | - SalesOrderCalculator (Math & Line Item Aggregation)|  |
|  | - DiscountService (Customer Max Limit Validation)   |  |
|  | - InventoryService (Reservations & Movements)       |  |
|  | - WorkflowService (Strict State Machine Transitions)|  |
|  | - PaymentService (Reconciliation & Invoices)        |  |
|  | - DefectToggleService (Safe Educational Lab Bugs)   |  |
|  +-----------------------------------------------------+  |
+-----------------------------+-----------------------------+
                              | Eloquent ORM
                              v
+-----------------------------------------------------------+
|                     Data Storage Layer                    |
|           PostgreSQL 16 (Relational Multi-Table)          |
|                 Normalized Master & Transactional         |
+-----------------------------------------------------------+
```

## 3. Security Architecture
- Password Hashing: Bcrypt with automatic cost tuning.
- Token Authorization: Laravel Sanctum personal access tokens.
- Role-Based Access Control: Backend-enforced via Role/Permission relations.
- Safe Error Handling: Strict JSON envelopes preventing raw stack trace disclosure in production.

## 4. White-Box Separation of Concerns
All critical business math and state transitions are decoupled from HTTP Controllers into testable domain services in `app/Services/`. This allows isolated white-box testing, cyclomatic complexity audits, and mutation analysis.
