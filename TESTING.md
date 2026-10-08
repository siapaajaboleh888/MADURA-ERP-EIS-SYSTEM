# Testing Master Documentation — MADURA ERP / EIS

## 1. Testing Strategy Overview
Testing for MADURA ERP is aligned with the 16-week Software Quality Assurance (SQA) curriculum. Each activity tests the **same continuous codebase** from different architectural angles:

```
V-Model Levels:
Requirements Engineering  <--------->  User Acceptance Testing (Week 11)
System Architecture       <--------->  System & Performance (Week 9, 10, 16)
Integration Design        <--------->  API & Automation (Week 6, 7)
Unit & Component Code     <--------->  Unit & White-Box (Week 3, 4, 5)
```

## 2. Test Execution Commands

### Backend Unit & Feature Tests (PHPUnit / Pest)
```bash
cd backend
php artisan test
```

### Specific White-Box / Business Rule Tests
```bash
php artisan test --filter=BusinessRulesAndCalculationsTest
```

### API Testing via Newman / Postman
```bash
newman run api-tests/postman/madura_erp.postman_collection.json \
  -e api-tests/postman/madura_erp.postman_environment.json
```

### Browser E2E Automation (Playwright)
```bash
npx playwright test automation/playwright/e2e.spec.ts
```

### Performance Load Testing (k6)
```bash
k6 run performance/k6/load_test.js
```

### Security Baseline Scan (OWASP ZAP)
```bash
zap.sh -cmd -autorun security/zap/zap_config.yaml
```

## 3. Controlled Educational Defects
To run lab exercises, toggle defect injection under `/course-center` or set:
```bash
curl -X POST http://127.0.0.1:8000/api/qa/course-config \
  -H "Content-Type: application/json" \
  -d '{"current_week": 3, "lab_mode": true, "active_defects": ["DEFECT_DISCOUNT_CALCULATION"]}'
```
