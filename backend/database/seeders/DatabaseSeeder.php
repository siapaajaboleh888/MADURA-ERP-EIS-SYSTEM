<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Models\Category;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\InventoryStock;
use App\Models\StockMovement;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\ProductionOrder;
use App\Models\ProductionMaterial;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\CourseWeekConfig;
use App\Models\QaRequirement;
use App\Models\QaTestCase;
use App\Models\QaDefect;
use App\Models\QaTestRun;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions
        $roles = [
            'ADMIN' => 'System Administrator',
            'MANAGER' => 'General Manager',
            'SALES' => 'Sales Representative',
            'WAREHOUSE' => 'Warehouse & Inventory Officer',
            'PRODUCTION' => 'Production Supervisor',
            'FINANCE' => 'Finance & Accounting Specialist',
            'CUSTOMER' => 'Customer Portal User',
        ];

        $roleModels = [];
        foreach ($roles as $name => $displayName) {
            $roleModels[$name] = Role::firstOrCreate(
                ['name' => $name],
                ['display_name' => $displayName, 'description' => "Role for {$displayName}"]
            );
        }

        $permissions = [
            ['name' => 'view_dashboard', 'display_name' => 'View Dashboard', 'module' => 'EIS'],
            ['name' => 'manage_master_data', 'display_name' => 'Manage Master Data', 'module' => 'MasterData'],
            ['name' => 'manage_sales', 'display_name' => 'Manage Sales', 'module' => 'Sales'],
            ['name' => 'approve_sales', 'display_name' => 'Approve Sales', 'module' => 'Sales'],
            ['name' => 'manage_inventory', 'display_name' => 'Manage Inventory', 'module' => 'Inventory'],
            ['name' => 'manage_purchasing', 'display_name' => 'Manage Purchasing', 'module' => 'Purchasing'],
            ['name' => 'manage_production', 'display_name' => 'Manage Production', 'module' => 'Production'],
            ['name' => 'manage_finance', 'display_name' => 'Manage Finance', 'module' => 'Finance'],
            ['name' => 'manage_qa', 'display_name' => 'Course QA & Control Center', 'module' => 'QA'],
        ];

        foreach ($permissions as $p) {
            $perm = Permission::firstOrCreate(['name' => $p['name']], $p);
            $roleModels['ADMIN']->permissions()->syncWithoutDetaching([$perm->id]);
            if (in_array($p['name'], ['view_dashboard', 'approve_sales'])) {
                $roleModels['MANAGER']->permissions()->syncWithoutDetaching([$perm->id]);
            }
        }

        // 2. Users for every role
        $users = [
            ['name' => 'Admin Madura', 'email' => 'admin@madura-erp.local', 'role' => 'ADMIN'],
            ['name' => 'Manager Budi', 'email' => 'manager@madura-erp.local', 'role' => 'MANAGER'],
            ['name' => 'Sales Siti', 'email' => 'sales@madura-erp.local', 'role' => 'SALES'],
            ['name' => 'Warehouse Agus', 'email' => 'warehouse@madura-erp.local', 'role' => 'WAREHOUSE'],
            ['name' => 'Production Joko', 'email' => 'production@madura-erp.local', 'role' => 'PRODUCTION'],
            ['name' => 'Finance Dewi', 'email' => 'finance@madura-erp.local', 'role' => 'FINANCE'],
            ['name' => 'Client PT Garamindo', 'email' => 'customer@madura-erp.local', 'role' => 'CUSTOMER'],
        ];

        $userModels = [];
        foreach ($users as $u) {
            $userModels[$u['role']] = User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('password123'),
                    'role_id' => $roleModels[$u['role']]->id,
                    'phone' => '08123456789',
                    'status' => 'ACTIVE',
                ]
            );
        }

        // 3. Master Data: Categories, Units, Warehouses
        $catKonsumsi = Category::firstOrCreate(['code' => 'KONSUMSI'], ['name' => 'Garam Konsumsi', 'description' => 'Garam beryodium konsumsi rumah tangga']);
        $catIndustri = Category::firstOrCreate(['code' => 'INDUSTRI'], ['name' => 'Garam Industri', 'description' => 'Garam kemurnian tinggi pabrik & industri']);
        $catBahanBaku = Category::firstOrCreate(['code' => 'BAHAN_BAKU'], ['name' => 'Bahan Baku & Tambak', 'description' => 'Garam krosok mentah hasil petambak']);

        $uKg = Unit::firstOrCreate(['code' => 'KG'], ['name' => 'Kilogram']);
        $uTon = Unit::firstOrCreate(['code' => 'TON'], ['name' => 'Ton']);
        $uSak = Unit::firstOrCreate(['code' => 'SAK'], ['name' => 'Sak (50kg)']);

        $whSumenep = Warehouse::firstOrCreate(['code' => 'WH-SMP'], ['name' => 'Gudang Pusat Kalianget Sumenep', 'location' => 'Sumenep, Madura', 'capacity_tons' => 5000]);
        $whSampang = Warehouse::firstOrCreate(['code' => 'WH-SPG'], ['name' => 'Gudang Pengolahan Sampang', 'location' => 'Sampang, Madura', 'capacity_tons' => 3000]);
        $whPamekasan = Warehouse::firstOrCreate(['code' => 'WH-PMK'], ['name' => 'Gudang Distribusi Pamekasan', 'location' => 'Pamekasan, Madura', 'capacity_tons' => 2000]);
        $warehouses = [$whSumenep, $whSampang, $whPamekasan];

        // 4. Master Data: 20 Products (Garam Madura)
        $saltProducts = [
            ['sku' => 'GRM-KNS-01', 'name' => 'Garam Halus Beryodium Kemasan 250g', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 2500, 'sell' => 4500, 'min' => 100],
            ['sku' => 'GRM-KNS-02', 'name' => 'Garam Halus Beryodium Kemasan 500g', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 4500, 'sell' => 8000, 'min' => 100],
            ['sku' => 'GRM-KNS-03', 'name' => 'Garam Dapur Premium Meja 1kg', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 7000, 'sell' => 12000, 'min' => 100],
            ['sku' => 'GRM-KNS-04', 'name' => 'Garam Briket Konsumsi Cap Karapan', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 3000, 'sell' => 5500, 'min' => 50],
            ['sku' => 'GRM-IND-01', 'name' => 'Garam Industri Kimia NaCl 98% Sak 50kg', 'cat' => $catIndustri, 'unit' => $uSak, 'type' => 'FINISHED_GOOD', 'buy' => 80000, 'sell' => 135000, 'min' => 50],
            ['sku' => 'GRM-IND-02', 'name' => 'Garam Industri Tekstil NaCl 96% Sak 50kg', 'cat' => $catIndustri, 'unit' => $uSak, 'type' => 'FINISHED_GOOD', 'buy' => 75000, 'sell' => 120000, 'min' => 50],
            ['sku' => 'GRM-IND-03', 'name' => 'Garam Water Treatment Pure Grade Ton', 'cat' => $catIndustri, 'unit' => $uTon, 'type' => 'FINISHED_GOOD', 'buy' => 1400000, 'sell' => 2400000, 'min' => 10],
            ['sku' => 'GRM-IND-04', 'name' => 'Garam Farmasi Ultra High Purity 25kg', 'cat' => $catIndustri, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 150000, 'sell' => 320000, 'min' => 20],
            ['sku' => 'GRM-RAW-01', 'name' => 'Garam Krosok Kualitas 1 (Grade K1)', 'cat' => $catBahanBaku, 'unit' => $uTon, 'type' => 'RAW_MATERIAL', 'buy' => 850000, 'sell' => 1100000, 'min' => 50],
            ['sku' => 'GRM-RAW-02', 'name' => 'Garam Krosok Kualitas 2 (Grade K2)', 'cat' => $catBahanBaku, 'unit' => $uTon, 'type' => 'RAW_MATERIAL', 'buy' => 700000, 'sell' => 950000, 'min' => 50],
            ['sku' => 'GRM-RAW-03', 'name' => 'Garam Krosok Tambak Pinggiran (Grade K3)', 'cat' => $catBahanBaku, 'unit' => $uTon, 'type' => 'RAW_MATERIAL', 'buy' => 550000, 'sell' => 750000, 'min' => 30],
            ['sku' => 'GRM-RAW-04', 'name' => 'Garam Kristal Putih Jemuran Kalianget', 'cat' => $catBahanBaku, 'unit' => $uTon, 'type' => 'RAW_MATERIAL', 'buy' => 900000, 'sell' => 1250000, 'min' => 40],
            ['sku' => 'GRM-NON-01', 'name' => 'Garam Pengawetan Ikan & Nelayan Sak 50kg', 'cat' => $catIndustri, 'unit' => $uSak, 'type' => 'FINISHED_GOOD', 'buy' => 45000, 'sell' => 70000, 'min' => 100],
            ['sku' => 'GRM-NON-02', 'name' => 'Garam Peternakan & Pakan Ternak Sak 50kg', 'cat' => $catIndustri, 'unit' => $uSak, 'type' => 'FINISHED_GOOD', 'buy' => 40000, 'sell' => 65000, 'min' => 80],
            ['sku' => 'GRM-NON-03', 'name' => 'Garam Penyamakan Kulit Sak 50kg', 'cat' => $catIndustri, 'unit' => $uSak, 'type' => 'FINISHED_GOOD', 'buy' => 50000, 'sell' => 80000, 'min' => 40],
            ['sku' => 'GRM-SPA-01', 'name' => 'Garam Mandi Bath Salt Madura Herbal 500g', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 15000, 'sell' => 35000, 'min' => 20],
            ['sku' => 'GRM-SPA-02', 'name' => 'Garam Terapi Rendam Kaki Eucalyptus 1kg', 'cat' => $catKonsumsi, 'unit' => $uKg, 'type' => 'FINISHED_GOOD', 'buy' => 20000, 'sell' => 45000, 'min' => 20],
            ['sku' => 'GRM-MAT-01', 'name' => 'Iodium Tambahan KIO3 Kemasan 1kg', 'cat' => $catBahanBaku, 'unit' => $uKg, 'type' => 'RAW_MATERIAL', 'buy' => 300000, 'sell' => 350000, 'min' => 5],
            ['sku' => 'GRM-PKG-01', 'name' => 'Karung Sak Sablon Madura Salt 50kg (Pack 100)', 'cat' => $catBahanBaku, 'unit' => $uSak, 'type' => 'PACKAGING', 'buy' => 180000, 'sell' => 200000, 'min' => 20],
            ['sku' => 'GRM-PKG-02', 'name' => 'Plastik Standing Pouch Foil 1kg (Pack 100)', 'cat' => $catBahanBaku, 'unit' => $uSak, 'type' => 'PACKAGING', 'buy' => 75000, 'sell' => 90000, 'min' => 30],
        ];

        $products = [];
        foreach ($saltProducts as $pData) {
            $prod = Product::firstOrCreate(
                ['sku' => $pData['sku']],
                [
                    'name' => $pData['name'],
                    'category_id' => $pData['cat']->id,
                    'unit_id' => $pData['unit']->id,
                    'type' => $pData['type'],
                    'purchase_price' => $pData['buy'],
                    'selling_price' => $pData['sell'],
                    'min_stock' => $pData['min'],
                    'max_stock' => $pData['min'] * 20,
                    'is_active' => true,
                ]
            );
            $products[] = $prod;

            // Seed inventory stock in each warehouse
            foreach ($warehouses as $wh) {
                InventoryStock::firstOrCreate(
                    ['warehouse_id' => $wh->id, 'product_id' => $prod->id],
                    ['quantity_on_hand' => rand(200, 1500), 'quantity_reserved' => 0]
                );
            }
        }

        // 5. 10 Customers
        $customerList = [
            ['code' => 'CUST-001', 'name' => 'PT Indofood Sukses Makmur Tbk', 'email' => 'procurement@indofood.example.com', 'credit' => 500000000, 'disc' => 15.0],
            ['code' => 'CUST-002', 'name' => 'PT Unilever Indonesia Tbk', 'email' => 'supply@unilever.example.com', 'credit' => 750000000, 'disc' => 15.0],
            ['code' => 'CUST-003', 'name' => 'PT Garam Nusantara Sejahtera', 'email' => 'sales@garamnusantara.example.com', 'credit' => 200000000, 'disc' => 10.0],
            ['code' => 'CUST-004', 'name' => 'CV Sumber Rejeki Madura', 'email' => 'sumberrejeki@example.com', 'credit' => 100000000, 'disc' => 10.0],
            ['code' => 'CUST-005', 'name' => 'UD Berkah Nelayan Branta Pamekasan', 'email' => 'berkahnelayan@example.com', 'credit' => 50000000, 'disc' => 8.0],
            ['code' => 'CUST-006', 'name' => 'Koperasi Unit Desa Mina Sampang', 'email' => 'kud.sampang@example.com', 'credit' => 80000000, 'disc' => 10.0],
            ['code' => 'CUST-007', 'name' => 'PT Asahi Chemical Surabaya', 'email' => 'order@asahichem.example.com', 'credit' => 350000000, 'disc' => 12.0],
            ['code' => 'CUST-008', 'name' => 'Toko Sembako Barokah Sumenep', 'email' => 'barokah@example.com', 'credit' => 30000000, 'disc' => 5.0],
            ['code' => 'CUST-009', 'name' => 'PT Pangan Sehat Tradisional', 'email' => 'pangansehat@example.com', 'credit' => 150000000, 'disc' => 10.0],
            ['code' => 'CUST-010', 'name' => 'CV Garam Laut Lestari', 'email' => 'lautlestari@example.com', 'credit' => 90000000, 'disc' => 7.0],
        ];

        $customers = [];
        foreach ($customerList as $c) {
            $customers[] = Customer::firstOrCreate(
                ['code' => $c['code']],
                [
                    'name' => $c['name'],
                    'email' => $c['email'],
                    'phone' => '0813998877' . rand(10, 99),
                    'address' => 'Jl. Industri Madura No. ' . rand(1, 100),
                    'credit_limit' => $c['credit'],
                    'max_discount_rate' => $c['disc'],
                    'is_active' => true,
                ]
            );
        }

        // 6. 10 Suppliers (Petambak Garam & Kimia)
        $supplierList = [
            ['code' => 'SUP-001', 'name' => 'Kelompok Tani Garam Kalimook Kalianget', 'email' => 'kalimook@petambak.example.com'],
            ['code' => 'SUP-002', 'name' => 'Koperasi Garam Rakyat Pinggirpapas', 'email' => 'pinggirpapas@petambak.example.com'],
            ['code' => 'SUP-003', 'name' => 'Petambak Garam Karanganyar Sumenep', 'email' => 'karanganyar@petambak.example.com'],
            ['code' => 'SUP-004', 'name' => 'Koperasi Petambak Garam Bunder Pamekasan', 'email' => 'bunder@petambak.example.com'],
            ['code' => 'SUP-005', 'name' => 'Kelompok Tani Tambak Sreseh Sampang', 'email' => 'sreseh@petambak.example.com'],
            ['code' => 'SUP-006', 'name' => 'PT Iodium Kimia Farma Nusantara', 'email' => 'iodium@kimia.example.com'],
            ['code' => 'SUP-007', 'name' => 'CV Pabrik Karung Plastik Prima Gresik', 'email' => 'karung@kemasan.example.com'],
            ['code' => 'SUP-008', 'name' => 'UD Supplier Kemasan Pouch Sidoarjo', 'email' => 'pouch@kemasan.example.com'],
            ['code' => 'SUP-009', 'name' => 'Kelompok Garam Tambak Camplong Sampang', 'email' => 'camplong@petambak.example.com'],
            ['code' => 'SUP-010', 'name' => 'Koperasi Garam Rakyat Pademawu Pamekasan', 'email' => 'pademawu@petambak.example.com'],
        ];

        $suppliers = [];
        foreach ($supplierList as $s) {
            $suppliers[] = Supplier::firstOrCreate(
                ['code' => $s['code']],
                [
                    'name' => $s['name'],
                    'email' => $s['email'],
                    'phone' => '0852112233' . rand(10, 99),
                    'address' => 'Kawasan Tambak Garam Madura RT 0' . rand(1, 9),
                    'is_active' => true,
                ]
            );
        }

        // 7. Seed Course Week Config & Lab Defect
        CourseWeekConfig::firstOrCreate(
            ['id' => 1],
            ['current_week' => 1, 'lab_mode' => false, 'active_defects' => []]
        );

        // 8. QA Requirements (16-week academic traceability)
        $reqs = [
            ['requirement_id' => 'REQ-AUTH-001', 'title' => 'Role-Based Authentication', 'description' => 'System must enforce role-based access control and Sanctum token auth.', 'module' => 'Authentication', 'priority' => 'CRITICAL', 'acceptance_criteria' => 'Users authenticate via JWT token and only access authorized actions based on role.'],
            ['requirement_id' => 'REQ-MST-001', 'title' => 'Master Data Management', 'description' => 'Comprehensive management of salt products, customers, suppliers, and warehouses.', 'module' => 'MasterData', 'priority' => 'HIGH', 'acceptance_criteria' => 'CRUD operations for Salt products, categories, customers, suppliers with unique codes.'],
            ['requirement_id' => 'REQ-INV-001', 'title' => 'Stock Non-Negativity Rule', 'description' => 'Inventory stocks must never drop below zero under any operation.', 'module' => 'Inventory', 'priority' => 'CRITICAL', 'acceptance_criteria' => 'Stock balance can never become negative under any outbound movement.'],
            ['requirement_id' => 'REQ-SALES-001', 'title' => 'Sales Order State Machine', 'description' => 'Strict lifecycle transition validation for customer orders.', 'module' => 'Sales', 'priority' => 'CRITICAL', 'acceptance_criteria' => 'Transitions follow DRAFT -> SUBMITTED -> APPROVED -> STOCK_RESERVED -> DELIVERED -> INVOICED -> PAID strictly.'],
            ['requirement_id' => 'REQ-SALES-002', 'title' => 'Sales Order Calculations & Discount Limits', 'description' => 'Order pricing math and customer max discount rate enforcement.', 'module' => 'Sales', 'priority' => 'HIGH', 'acceptance_criteria' => 'Discounts cannot exceed customer configured maximum, order requires at least 1 item.'],
            ['requirement_id' => 'REQ-PUR-001', 'title' => 'Procurement & Goods Receipt', 'description' => 'Raw salt purchasing from local farmers and stock replenishment.', 'module' => 'Purchasing', 'priority' => 'HIGH', 'acceptance_criteria' => 'Goods receipt updates inventory quantity_on_hand and creates audit trail.'],
            ['requirement_id' => 'REQ-PROD-001', 'title' => 'Production Material Consumption', 'description' => 'Processing raw salt krosok into refined iodized salt.', 'module' => 'Production', 'priority' => 'HIGH', 'acceptance_criteria' => 'Production cannot complete if raw materials are insufficient.'],
            ['requirement_id' => 'REQ-FIN-001', 'title' => 'Invoice & Payment Reconciliation', 'description' => 'Billing and payment settlement for delivered sales orders.', 'module' => 'Finance', 'priority' => 'CRITICAL', 'acceptance_criteria' => 'Payment cannot exceed outstanding balance, invoice amount mirrors sales order.'],
        ];

        $reqModels = [];
        foreach ($reqs as $r) {
            $reqModels[$r['requirement_id']] = QaRequirement::firstOrCreate(['requirement_id' => $r['requirement_id']], $r);
        }

        // 9. QA Test Cases for Week 1-16
        $testCases = [
            ['test_case_id' => 'TC-EP-001', 'req' => 'REQ-SALES-002', 'module' => 'Sales', 'type' => 'EP_BVA', 'title' => 'BVA on Item Quantity (Min Boundary = 1)', 'steps' => 'Enter quantity = 0, expect error. Enter quantity = 1, expect success.', 'expected' => 'Quantity <= 0 rejected with HTTP 422 / InvalidArgumentException.'],
            ['req' => 'REQ-SALES-002', 'test_case_id' => 'TC-EP-002', 'module' => 'Sales', 'type' => 'EP_BVA', 'title' => 'BVA on Discount Rate (Max Boundary = customer limit)', 'steps' => 'Enter discount above customer maximum, expect rejection.', 'expected' => 'Discount > max rejected.'],
            ['test_case_id' => 'TC-DT-001', 'req' => 'REQ-SALES-001', 'module' => 'Sales', 'type' => 'DECISION_TABLE', 'title' => 'Decision Table for Sales Order Approval', 'steps' => 'Test combinations of (User Role, Current State, Stock Availability).', 'expected' => 'Only MANAGER/ADMIN can approve SUBMITTED order.'],
            ['test_case_id' => 'TC-ST-001', 'req' => 'REQ-SALES-001', 'module' => 'Sales', 'type' => 'STATE_TRANSITION', 'title' => 'State Transition from DRAFT directly to DELIVERED', 'steps' => 'Attempt illegal skip transition from DRAFT to DELIVERED.', 'expected' => 'Transition rejected with InvalidArgumentException.'],
            ['test_case_id' => 'TC-WB-001', 'req' => 'REQ-INV-001', 'module' => 'Inventory', 'type' => 'WHITE_BOX', 'title' => 'Branch Coverage for InventoryService reserveStock', 'steps' => 'Execute paths: insufficient stock branch vs sufficient stock branch.', 'expected' => '100% branch coverage achieved.'],
            ['test_case_id' => 'TC-API-001', 'req' => 'REQ-AUTH-001', 'module' => 'Authentication', 'type' => 'API', 'title' => 'API POST /api/auth/login standard envelope', 'steps' => 'Send valid and invalid credentials via Postman/Newman.', 'expected' => 'Standard envelope {success, message, data/errors}.'],
            ['test_case_id' => 'TC-E2E-001', 'req' => 'REQ-SALES-001', 'module' => 'Sales', 'type' => 'E2E', 'title' => 'End-to-End Order-to-Cash Cycle Playwright', 'steps' => 'Login -> Quotation -> SO -> Approve -> Reserve -> Deliver -> Invoice -> Pay.', 'expected' => 'Complete lifecycle completes without errors.'],
        ];

        foreach ($testCases as $tc) {
            QaTestCase::firstOrCreate(
                ['test_case_id' => $tc['test_case_id']],
                [
                    'requirement_id' => $reqModels[$tc['req']]->id,
                    'module' => $tc['module'],
                    'test_type' => $tc['type'],
                    'title' => $tc['title'],
                    'test_steps' => $tc['steps'],
                    'expected_result' => $tc['expected'],
                    'status' => 'READY',
                ]
            );
        }

        // 10. Seed 100 realistic Sales Transactions across workflow states
        $statuses = [
            SalesOrder::STATUS_DRAFT,
            SalesOrder::STATUS_SUBMITTED,
            SalesOrder::STATUS_APPROVED,
            SalesOrder::STATUS_STOCK_RESERVED,
            SalesOrder::STATUS_DELIVERED,
            SalesOrder::STATUS_INVOICED,
            SalesOrder::STATUS_PAID,
        ];

        for ($i = 1; $i <= 100; $i++) {
            $customer = $customers[array_rand($customers)];
            $warehouse = $warehouses[array_rand($warehouses)];
            $status = $statuses[array_rand($statuses)];
            $orderDate = now()->subDays(rand(1, 90))->toDateString();

            $prod1 = $products[array_rand($products)];
            $qty1 = rand(10, 50);
            $subtotal = $qty1 * (float)$prod1->selling_price;
            $tax = round($subtotal * 0.11, 2);
            $total = $subtotal + $tax;

            $so = SalesOrder::firstOrCreate(
                ['so_number' => 'SO-SEED-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT)],
                [
                    'customer_id' => $customer->id,
                    'warehouse_id' => $warehouse->id,
                    'order_date' => $orderDate,
                    'subtotal' => $subtotal,
                    'discount_rate' => 0,
                    'discount_amount' => 0,
                    'tax_rate' => 11,
                    'tax_amount' => $tax,
                    'total_amount' => $total,
                    'status' => $status,
                    'notes' => "Deterministic academic seed transaction #{$i}",
                    'created_by' => $userModels['SALES']->id,
                    'approved_by' => in_array($status, [SalesOrder::STATUS_APPROVED, SalesOrder::STATUS_STOCK_RESERVED, SalesOrder::STATUS_DELIVERED, SalesOrder::STATUS_INVOICED, SalesOrder::STATUS_PAID]) ? $userModels['MANAGER']->id : null,
                ]
            );

            SalesOrderItem::firstOrCreate(
                ['sales_order_id' => $so->id, 'product_id' => $prod1->id],
                [
                    'quantity' => $qty1,
                    'unit_price' => $prod1->selling_price,
                    'discount_rate' => 0,
                    'total_price' => $subtotal,
                ]
            );

            // If DELIVERED, INVOICED, or PAID, seed Delivery
            if (in_array($status, [SalesOrder::STATUS_DELIVERED, SalesOrder::STATUS_INVOICED, SalesOrder::STATUS_PAID])) {
                $del = Delivery::firstOrCreate(
                    ['do_number' => 'DO-SEED-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT)],
                    [
                        'sales_order_id' => $so->id,
                        'warehouse_id' => $warehouse->id,
                        'delivery_date' => $orderDate,
                        'shipping_carrier' => 'Madura Salt Logistics',
                        'tracking_number' => 'MSL-' . rand(100000, 999999),
                        'status' => Delivery::STATUS_DELIVERED,
                        'shipped_by' => $userModels['WAREHOUSE']->id,
                    ]
                );

                DeliveryItem::firstOrCreate(
                    ['delivery_id' => $del->id, 'product_id' => $prod1->id],
                    ['quantity_shipped' => $qty1]
                );
            }

            // If INVOICED or PAID, seed Invoice
            if (in_array($status, [SalesOrder::STATUS_INVOICED, SalesOrder::STATUS_PAID])) {
                $isPaid = ($status === SalesOrder::STATUS_PAID);
                $inv = Invoice::firstOrCreate(
                    ['invoice_number' => 'INV-SEED-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT)],
                    [
                        'sales_order_id' => $so->id,
                        'customer_id' => $customer->id,
                        'invoice_date' => $orderDate,
                        'due_date' => now()->addDays(30)->toDateString(),
                        'amount' => $total,
                        'paid_amount' => $isPaid ? $total : 0,
                        'outstanding_amount' => $isPaid ? 0 : $total,
                        'status' => $isPaid ? Invoice::STATUS_PAID : Invoice::STATUS_UNPAID,
                    ]
                );

                if ($isPaid) {
                    Payment::firstOrCreate(
                        ['payment_number' => 'PAY-SEED-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT)],
                        [
                            'invoice_id' => $inv->id,
                            'payment_date' => $orderDate,
                            'amount' => $total,
                            'payment_method' => 'BANK_TRANSFER',
                            'reference_number' => 'BCA-TRF-' . rand(100000, 999999),
                            'recorded_by' => $userModels['FINANCE']->id,
                        ]
                    );
                }
            }
        }

        // 11. Seed 50 Purchase Transactions
        for ($j = 1; $j <= 50; $j++) {
            $supplier = $suppliers[array_rand($suppliers)];
            $warehouse = $warehouses[array_rand($warehouses)];
            $rawProduct = $products[8]; // Raw material
            $qty = rand(10, 30);
            $subtotal = $qty * (float)$rawProduct->purchase_price;
            $tax = round($subtotal * 0.11, 2);

            $po = PurchaseOrder::firstOrCreate(
                ['po_number' => 'PO-SEED-' . str_pad((string)$j, 4, '0', STR_PAD_LEFT)],
                [
                    'supplier_id' => $supplier->id,
                    'warehouse_id' => $warehouse->id,
                    'order_date' => now()->subDays(rand(5, 60))->toDateString(),
                    'subtotal' => $subtotal,
                    'tax_amount' => $tax,
                    'total_amount' => $subtotal + $tax,
                    'status' => 'RECEIVED',
                    'created_by' => $userModels['WAREHOUSE']->id,
                    'approved_by' => $userModels['MANAGER']->id,
                ]
            );

            PurchaseOrderItem::firstOrCreate(
                ['purchase_order_id' => $po->id, 'product_id' => $rawProduct->id],
                [
                    'quantity' => $qty,
                    'unit_price' => $rawProduct->purchase_price,
                    'total_price' => $subtotal,
                    'received_quantity' => $qty,
                ]
            );
        }

        // 12. Seed 20 Production Orders
        for ($k = 1; $k <= 20; $k++) {
            $targetProd = $products[0]; // Finished Good
            $rawProd = $products[8];    // Raw K1
            $wh = $warehouses[1];       // Sampang processing facility

            $prodOrder = ProductionOrder::firstOrCreate(
                ['prod_number' => 'PRD-SEED-' . str_pad((string)$k, 4, '0', STR_PAD_LEFT)],
                [
                    'product_id' => $targetProd->id,
                    'warehouse_id' => $wh->id,
                    'target_quantity' => 500,
                    'actual_quantity' => 500,
                    'start_date' => now()->subDays(rand(10, 40))->toDateString(),
                    'end_date' => now()->subDays(rand(1, 9))->toDateString(),
                    'status' => 'COMPLETED',
                    'created_by' => $userModels['PRODUCTION']->id,
                    'approved_by' => $userModels['MANAGER']->id,
                ]
            );

            ProductionMaterial::firstOrCreate(
                ['production_order_id' => $prodOrder->id, 'product_id' => $rawProd->id],
                [
                    'required_quantity' => 10,
                    'consumed_quantity' => 10,
                ]
            );
        }

        // 13. Seed Defect Log for Academic Learning
        QaDefect::firstOrCreate(
            ['defect_id' => 'DEF-001'],
            [
                'title' => 'Discount exceeds customer configured maximum allowed rate',
                'description' => 'When lab defect DEFECT_DISCOUNT_CALCULATION is enabled, discounts above customer limit are permitted without rejection.',
                'expected_result' => 'System returns HTTP 422 with validation error.',
                'actual_result' => 'Order submitted with excessive discount rate.',
                'reproduction_steps' => '1. Enable LAB_MODE=true and DEFECT_DISCOUNT_CALCULATION. 2. Post SO with 25% discount to customer with 10% limit.',
                'severity' => 'MAJOR',
                'priority' => 'HIGH',
                'module' => 'Sales',
                'requirement_code' => 'REQ-SALES-002',
                'test_case_code' => 'TC-EP-002',
                'introduced_week' => 3,
                'detected_week' => 3,
                'fixed_week' => null,
                'status' => 'OPEN',
                'root_cause' => 'Defect Toggle simulation in DiscountService.',
                'corrective_action' => 'Turn off LAB_MODE or disable DEFECT_DISCOUNT_CALCULATION toggle.',
                'evidence' => 'docs/defect-log.md',
                'reported_by' => $userModels['ADMIN']->id,
            ]
        );
    }
}
