<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\Delivery;
use App\Models\DeliveryItem;
use App\Models\AuditLog;
use App\Services\SalesOrderCalculator;
use App\Services\WorkflowService;
use App\Services\InventoryService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SalesOrderController extends BaseApiController
{
    protected SalesOrderCalculator $calculator;
    protected WorkflowService $workflow;
    protected InventoryService $inventory;
    protected PaymentService $paymentService;

    public function __construct(
        SalesOrderCalculator $calculator,
        WorkflowService $workflow,
        InventoryService $inventory,
        PaymentService $paymentService
    ) {
        $this->calculator = $calculator;
        $this->workflow = $workflow;
        $this->inventory = $inventory;
        $this->paymentService = $paymentService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = SalesOrder::with(['customer', 'warehouse', 'items.product', 'invoice', 'creator'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->query('customer_id'));
        }

        $orders = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($orders, 'Sales orders retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $order = SalesOrder::with(['customer', 'warehouse', 'items.product', 'deliveries.items.product', 'invoice.payments', 'creator', 'approver'])->find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }
        return $this->successResponse($order, 'Sales order retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'quotation_id' => 'nullable|exists:quotations,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'discount_rate' => 'nullable|numeric|between:0,100',
            'tax_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_rate' => 'nullable|numeric|between:0,100',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        try {
            $summary = $this->calculator->calculateOrderSummary(
                $request->items,
                (float)($request->discount_rate ?? 0),
                (float)($request->tax_rate ?? 11.0)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }

        $order = DB::transaction(function () use ($request, $summary) {
            $so = SalesOrder::create([
                'so_number' => 'SO-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'customer_id' => $request->customer_id,
                'warehouse_id' => $request->warehouse_id,
                'quotation_id' => $request->quotation_id,
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'subtotal' => $summary['subtotal'],
                'discount_rate' => $summary['discount_rate'],
                'discount_amount' => $summary['discount_amount'],
                'tax_rate' => $summary['tax_rate'],
                'tax_amount' => $summary['tax_amount'],
                'total_amount' => $summary['total_amount'],
                'status' => SalesOrder::STATUS_DRAFT,
                'notes' => $request->notes,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($request->items as $item) {
                $itemTotal = $this->calculator->calculateItemTotal(
                    (float)$item['quantity'],
                    (float)$item['unit_price'],
                    (float)($item['discount_rate'] ?? 0)
                );

                SalesOrderItem::create([
                    'sales_order_id' => $so->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'total_price' => $itemTotal,
                ]);
            }

            AuditLog::record($request->user()?->id, 'CREATE', 'SalesOrder', (string)$so->id, null, $so->toArray());
            return $so;
        });

        return $this->successResponse($order->load('items'), 'Sales order created successfully in DRAFT state', 201);
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $order = SalesOrder::find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }

        try {
            $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_SUBMITTED);
            AuditLog::record($request->user()?->id, 'SUBMIT', 'SalesOrder', (string)$order->id, ['status' => 'DRAFT'], ['status' => 'SUBMITTED']);
            return $this->successResponse($order, 'Sales order submitted for approval');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        // Business Rule 7: Unauthorized users cannot approve transactions
        if ($user && !$user->hasRole('ADMIN') && !$user->hasRole('MANAGER')) {
            return $this->errorResponse('Unauthorized: Only MANAGER or ADMIN can approve sales orders', null, 403);
        }

        $order = SalesOrder::find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }

        try {
            $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_APPROVED);
            $order->approved_by = $user?->id;
            $order->save();

            AuditLog::record($user?->id, 'APPROVE', 'SalesOrder', (string)$order->id, ['status' => 'SUBMITTED'], ['status' => 'APPROVED']);
            return $this->successResponse($order, 'Sales order approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function reserveStock(Request $request, int $id): JsonResponse
    {
        $order = SalesOrder::with('items')->find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }

        try {
            $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_STOCK_RESERVED);

            foreach ($order->items as $item) {
                $this->inventory->reserveStock($order->warehouse_id, $item->product_id, (float)$item->quantity, $request->user()?->id);
            }

            AuditLog::record($request->user()?->id, 'STOCK_RESERVED', 'SalesOrder', (string)$order->id);
            return $this->successResponse($order, 'Stock reserved for sales order');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function deliver(Request $request, int $id): JsonResponse
    {
        $order = SalesOrder::with('items')->find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }

        try {
            $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_DELIVERED);

            $delivery = DB::transaction(function () use ($order, $request) {
                $do = Delivery::create([
                    'do_number' => 'DO-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                    'sales_order_id' => $order->id,
                    'warehouse_id' => $order->warehouse_id,
                    'delivery_date' => now()->toDateString(),
                    'shipping_carrier' => $request->shipping_carrier ?? 'Madura Express Logistics',
                    'tracking_number' => 'TRK-' . strtoupper(Str::random(8)),
                    'status' => Delivery::STATUS_DELIVERED,
                    'notes' => $request->notes,
                    'shipped_by' => $request->user()?->id,
                ]);

                foreach ($order->items as $item) {
                    DeliveryItem::create([
                        'delivery_id' => $do->id,
                        'product_id' => $item->product_id,
                        'quantity_shipped' => $item->quantity,
                    ]);

                    // Deduct from stock
                    $this->inventory->deductStockOnDelivery(
                        $order->warehouse_id,
                        $item->product_id,
                        (float)$item->quantity,
                        $do->do_number,
                        $request->user()?->id
                    );
                }

                return $do;
            });

            AuditLog::record($request->user()?->id, 'DELIVER', 'SalesOrder', (string)$order->id, null, ['do_number' => $delivery->do_number]);
            return $this->successResponse(['order' => $order, 'delivery' => $delivery], 'Delivery order generated and goods shipped');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    public function invoice(Request $request, int $id): JsonResponse
    {
        $order = SalesOrder::find($id);
        if (!$order) {
            return $this->errorResponse('Sales order not found', null, 404);
        }

        try {
            $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_INVOICED);
            $inv = $this->paymentService->createInvoiceForSalesOrder($order);

            AuditLog::record($request->user()?->id, 'INVOICE', 'SalesOrder', (string)$order->id, null, ['invoice_id' => $inv->id]);
            return $this->successResponse(['order' => $order, 'invoice' => $inv], 'Invoice generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }
}
