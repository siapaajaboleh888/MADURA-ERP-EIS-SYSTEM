# Master Defect Log — MADURA ERP / EIS
Standard SQA Defect Registry for 16-Week Academic Progression

| Defect ID | Title | Module | Severity | Priority | Week Intro | Week Detect | Status | Root Cause |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **DEF-001** | Discount exceeds customer max rate when lab toggle enabled | Sales | MAJOR | HIGH | 3 | 3 | OPEN | Intentional lab simulation toggle `DEFECT_DISCOUNT_CALCULATION` active in `DiscountService`. |
| **DEF-002** | Boundary quantity check bypass | Sales | MAJOR | HIGH | 3 | 3 | OPEN | Controlled toggle `DEFECT_BOUNDARY_QUANTITY` active. |
| **DEF-003** | Inventory stock reservation exceeding available balance | Inventory | CRITICAL| HIGH | 5 | 5 | OPEN | Controlled toggle `DEFECT_STOCK_CALCULATION` active. |
| **DEF-004** | Illegal workflow transition from DRAFT directly to DELIVERED | Sales | CRITICAL| HIGH | 4 | 4 | OPEN | Controlled toggle `DEFECT_STATE_TRANSITION` active in `WorkflowService`. |
| **DEF-005** | Unauthorized role approving transaction | Sales | CRITICAL| HIGH | 6 | 6 | OPEN | Role gate bypass toggle `DEFECT_AUTHORIZATION` active. |

---

### Detailed Defect Record Example: DEF-001
- **Title**: Customer Maximum Discount Limit Bypass
- **Requirement ID**: `REQ-SALES-002`
- **Test Case**: `TC-EP-002`
- **Preconditions**: `LAB_MODE=true` and `DEFECT_DISCOUNT_CALCULATION` selected.
- **Reproduction Steps**:
  1. Authenticate as Sales representative.
  2. Create Sales Order for Customer `CUST-008` (Max discount 5%).
  3. Set discount rate to `25%`.
  4. Submit order.
- **Expected Result**: System rejects transaction with HTTP 422 ("Discount rate exceeds customer maximum").
- **Actual Result**: System calculates order with 25% discount and submits successfully.
- **Corrective Action**: Toggle off `LAB_MODE` in Course Control Center to restore production-safe calculation.
