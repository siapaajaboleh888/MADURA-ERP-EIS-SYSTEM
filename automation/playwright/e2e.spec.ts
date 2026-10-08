import { test, expect } from '@playwright/test';

test.describe('Madura ERP/EIS End-to-End Test Suite (Week 7)', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('01. User Authentication and Role Sign In', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page).toHaveTitle(/Madura ERP/i);

    // Fill credentials
    await page.fill('input[type="email"]', 'admin@madura-erp.local');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard
    await expect(page).toHaveURL(`${baseURL}/`);
    await expect(page.locator('text=Executive Information System')).toBeVisible();
  });

  test('02. Executive Dashboard Metrics Inspection', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.locator('text=Total Settled Revenue')).toBeVisible();
    await expect(page.locator('text=Outstanding Invoices')).toBeVisible();
    await expect(page.locator('text=Total Inventory Value')).toBeVisible();
  });

  test('03. Salt Master Data Catalog Browsing', async ({ page }) => {
    await page.goto(`${baseURL}/products`);
    await expect(page.locator('text=Salt Master Data Catalog')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    // Verify salt SKUs are rendered
    await expect(page.locator('text=GRM-')).toBeVisible();
  });

  test('04. Inventory Stock Balances Inspection', async ({ page }) => {
    await page.goto(`${baseURL}/inventory`);
    await expect(page.locator('text=Inventory Balances & Stock Card')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('05. Course Control Center Week Switching', async ({ page }) => {
    await page.goto(`${baseURL}/course-center`);
    await expect(page.locator('text=Course Control Center')).toBeVisible();
    await expect(page.locator('text=WEEK')).toBeVisible();
  });

  test('06. Requirements Traceability Matrix and Defect Log', async ({ page }) => {
    await page.goto(`${baseURL}/qa-traceability`);
    await expect(page.locator('text=Requirements Traceability Matrix')).toBeVisible();
    await expect(page.locator('text=REQ-AUTH-001')).toBeVisible();
  });
});
