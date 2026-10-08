# Week 04 — Decision Table and State Transition Testing

## 1. Objective
Validate the business rules and state transition logic governing the 7-stage order-to-cash lifecycle and procurement approvals.

## 2. Relevant Application Module
- Sales Order State Machine (`SalesOrder`, `WorkflowService`)
- Delivery Status Workflow (`Delivery`)

## 3. State Transition Matrix (Sales Order)
| Current State | Target State | Valid / Invalid | Guard Condition |
| :--- | :--- | :--- | :--- |
| **DRAFT** | SUBMITTED | **VALID** | Order contains >= 1 item |
| **DRAFT** | DELIVERED | **INVALID** | Cannot bypass approval/reservation |
| **SUBMITTED** | APPROVED | **VALID** | Role is MANAGER or ADMIN |
| **APPROVED** | STOCK_RESERVED | **VALID** | Warehouse available stock >= order qty |
| **STOCK_RESERVED** | DELIVERED | **VALID** | Physical stock deducted, DO generated |
| **DELIVERED** | INVOICED | **VALID** | Invoice total mirrors sales order |
| **INVOICED** | PAID | **VALID** | Cumulative payments >= invoice total |

## 4. Controlled Lab Defect
Activate `DEFECT_STATE_TRANSITION` in `/course-center` to permit illegal state skipping for testing decision coverage.
