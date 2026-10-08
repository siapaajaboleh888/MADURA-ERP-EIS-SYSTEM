<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesOrder;
use App\Models\PurchaseOrder;
use App\Models\InventoryStock;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\ProductionOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EisController extends BaseApiController
{
    public function dashboard(): JsonResponse
    {
        $totalRevenue = (float) Invoice::where('status', 'PAID')->sum('amount');
        $outstandingInvoices = (float) Invoice::whereIn('status', ['UNPAID', 'PARTIALLY_PAID'])->sum('outstanding_amount');

        $totalSalesOrders = SalesOrder::count();
        $totalDeliveries = DB::table('deliveries')->count();

        $inventoryValue = DB::table('inventory_stocks')
            ->join('products', 'inventory_stocks.product_id', '=', 'products.id')
            ->select(DB::raw('SUM(inventory_stocks.quantity_on_hand * products.selling_price) as total_val'))
            ->value('total_val') ?? 0;

        $lowStockProducts = Product::with('stocks')
            ->get()
            ->filter(function ($p) {
                return $p->total_stock <= $p->min_stock;
            })
            ->values();

        $topProducts = DB::table('sales_order_items')
            ->join('products', 'sales_order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(sales_order_items.quantity) as total_qty'), DB::raw('SUM(sales_order_items.total_price) as total_sales'))
            ->groupBy('products.name')
            ->orderBy('total_sales', 'desc')
            ->limit(5)
            ->get();

        $monthlySales = DB::table('sales_orders')
            ->select(DB::raw("strftime('%Y-%m', order_date) as month"), DB::raw('SUM(total_amount) as total_revenue'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(12)
            ->get();

        $orderStatusDist = DB::table('sales_orders')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return $this->successResponse([
            'metrics' => [
                'total_revenue' => (float)$totalRevenue,
                'outstanding_invoices' => (float)$outstandingInvoices,
                'total_sales_orders' => $totalSalesOrders,
                'total_deliveries' => $totalDeliveries,
                'total_inventory_value' => (float)$inventoryValue,
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'top_products' => $topProducts,
            'monthly_sales' => $monthlySales,
            'order_status_distribution' => $orderStatusDist,
            'low_stock_products' => $lowStockProducts,
        ], 'Executive Information System metrics retrieved');
    }
}
