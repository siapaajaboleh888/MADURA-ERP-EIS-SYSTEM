<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PurchasingController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\EisController;
use App\Http\Controllers\Api\QaController;
use App\Http\Controllers\Api\HealthController;

// Public Health & Auth Routes
Route::get('/health', [HealthController::class, 'check']);
Route::post('/auth/login', [AuthController::class, 'login']);

// QA & Academic Control Center (accessible for course inspections & test runner)
Route::prefix('qa')->group(function () {
    Route::get('/course-config', [QaController::class, 'getCourseConfig']);
    Route::post('/course-config', [QaController::class, 'updateCourseConfig']);
    Route::get('/requirements', [QaController::class, 'requirements']);
    Route::get('/test-cases', [QaController::class, 'testCases']);
    Route::get('/defects', [QaController::class, 'defects']);
    Route::post('/defects', [QaController::class, 'storeDefect']);
    Route::get('/traceability', [QaController::class, 'traceabilityMatrix']);
});

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // EIS Dashboard & Reports
    Route::get('/eis/dashboard', [EisController::class, 'dashboard']);

    // Master Data
    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('suppliers', SupplierController::class);

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::get('/inventory/movements', [InventoryController::class, 'movements']);
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
    Route::post('/inventory/transfer', [InventoryController::class, 'transfer']);

    // Quotations
    Route::apiResource('quotations', QuotationController::class)->only(['index', 'show', 'store']);

    // Sales Orders Workflow
    Route::apiResource('sales-orders', SalesOrderController::class)->only(['index', 'show', 'store']);
    Route::post('/sales-orders/{id}/submit', [SalesOrderController::class, 'submit']);
    Route::post('/sales-orders/{id}/approve', [SalesOrderController::class, 'approve']);
    Route::post('/sales-orders/{id}/reserve-stock', [SalesOrderController::class, 'reserveStock']);
    Route::post('/sales-orders/{id}/deliver', [SalesOrderController::class, 'deliver']);
    Route::post('/sales-orders/{id}/invoice', [SalesOrderController::class, 'invoice']);

    // Invoices & Payments
    Route::apiResource('invoices', InvoiceController::class)->only(['index', 'show']);
    Route::post('/invoices/{id}/payments', [InvoiceController::class, 'pay']);

    // Purchasing Workflow
    Route::apiResource('purchase-orders', PurchasingController::class)->only(['index', 'show', 'store']);
    Route::post('/purchase-orders/{id}/approve', [PurchasingController::class, 'approve']);
    Route::post('/purchase-orders/{id}/receive-goods', [PurchasingController::class, 'receiveGoods']);

    // Production Workflow
    Route::apiResource('production-orders', ProductionController::class)->only(['index', 'show', 'store']);
    Route::post('/production-orders/{id}/approve', [ProductionController::class, 'approve']);
    Route::post('/production-orders/{id}/complete', [ProductionController::class, 'complete']);
});
