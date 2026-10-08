# Week 05 — White-box Testing: Control Flow & Branch Coverage

## 1. Objective
Examine internal branch decisions, compute cyclomatic complexity, and verify branch coverage across isolated domain services.

## 2. Relevant Application Classes
- `App\Services\DiscountService`
- `App\Services\SalesOrderCalculator`
- `App\Services\InventoryService`
- `App\Services\PaymentService`

## 3. Control Flow Analysis Example: `DiscountService::calculateDiscount`
```
               [Start]
                  |
         (subtotal < 0 ?) ---- Yes ----> [Throw Exception]
                  | No
    (isDefectActive ?) ---- Yes -------> [Return Buggy Math]
                  | No
       (rate < 0 or > 100 ?) --- Yes --> [Throw Exception]
                  | No
   (rate > customer_max ?) -- Yes -----> [Throw Exception]
                  | No
       [Return round(subtotal * rate / 100)]
```
- **Cyclomatic Complexity (V(G))**: 5
- **Required Test Paths for 100% Branch Coverage**: 5 test cases implemented in `BusinessRulesAndCalculationsTest.php`.
