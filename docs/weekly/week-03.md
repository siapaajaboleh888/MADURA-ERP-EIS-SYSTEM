# Week 03 — Black-box Testing: Equivalence Partitioning & Boundary Value Analysis

## 1. Objective
Design and execute black-box test cases targeting numeric input fields in Madura ERP using Equivalence Partitioning (EP) and Boundary Value Analysis (BVA).

## 2. Relevant Application Module
- Sales Order Line Item Entry (`SalesOrderItem`, `SalesOrderCalculator`)
- Customer Discount Configuration (`Customer`, `DiscountService`)

## 3. Fields Analyzed
- **Quantity**: Valid partition `[1, ∞)`, Invalid partition `(-∞, 0]`.
  - Boundary values: `0` (rejection), `1` (acceptance), `2` (acceptance).
- **Discount Rate**: Valid partition `[0, customer_max]`, Invalid partition `(customer_max, 100]` and `(100, ∞)`.

## 4. Expected Testing Activity
Execute tests against `SalesOrderCalculator::calculateItemTotal` and API `POST /api/sales-orders`.
Verify that quantity <= 0 throws `InvalidArgumentException` and returns HTTP 422.

## 5. Controlled Lab Defect
Toggle `DEFECT_BOUNDARY_QUANTITY` or `DEFECT_DISCOUNT_CALCULATION` in Course Control Center to observe test failures during student practice.
