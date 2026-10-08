<?php

namespace App\Http\Controllers\Api;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\AuditLog;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PurchasingController extends BaseApiController
{
    protected InventoryService $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function index(Request $request): JsonResponse
    {
        $query = PurchaseOrder::with(['supplier', 'warehouse', 'items.product', 'creator'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $pos = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($pos, 'Purchase orders retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $po = PurchaseOrder::with(['supplier', 'warehouse', 'items.product', 'goodsReceipts.items', 'creator', 'approver'])->find($id);
        if (!$po) {
            return $this->errorResponse('Purchase order not found', null, 404);
        }
        return $this->successResponse($po, 'Purchase order details retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'order_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $subtotal = 0;
        foreach ($request->items as $item) {
            $subtotal += ($item['quantity'] * $item['unit_price']);
        }
        $tax = round($subtotal * 0.11, 2);
        $total = $subtotal + $tax;

        $po = DB::transaction(function () use ($request, $subtotal, $tax, $total) {
            $order = PurchaseOrder::create([
                'po_number' => 'PO-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'supplier_id' => $request->supplier_id,
                'warehouse_id' => $request->warehouse_id,
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'total_amount' => $total,
                'status' => 'DRAFT',
                'notes' => $request->notes,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($request->items as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            AuditLog::record($request->user()?->id, 'CREATE', 'PurchaseOrder', (string)$order->id, null, $order->toArray());
            return $order;
        });

        return $this->successResponse($po->load('items'), 'Purchase order created successfully in DRAFT state', 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $po = PurchaseOrder::find($id);
        if (!$po) {
            return $this->errorResponse('Purchase order not found', null, 404);
        }

        $po->status = 'APPROVED';
        $po->approved_by = $request->user()?->id;
        $po->save();

        AuditLog::record($request->user()?->id, 'APPROVE', 'PurchaseOrder', (string)$po->id);
        return $this->successResponse($po, 'Purchase order approved');
    }

    public function receiveGoods(Request $request, int $id): JsonResponse
    {
        $po = PurchaseOrder::with('items')->find($id);
        if (!$po) {
            return $this->errorResponse('Purchase order not found', null, 404);
        }

        if ($po->status !== 'APPROVED' && $po->status !== 'PARTIALLY_RECEIVED') {
            return $this->errorResponse('Goods can only be received for APPROVED or PARTIALLY_RECEIVED purchase orders', null, 422);
        }

        $receipt = DB::transaction(function () use ($po, $request) {
            $gr = GoodsReceipt::create([
                'receipt_number' => 'GR-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'purchase_order_id' => $po->id,
                'warehouse_id' => $po->warehouse_id,
                'receipt_date' => now()->toDateString(),
                'notes' => $request->notes,
                'received_by' => $request->user()?->id,
            ]);

            foreach ($po->items as $item) {
                GoodsReceiptItem::create([
                    'goods_receipt_id' => $gr->id,
                    'product_id' => $item->product_id,
                    'quantity_received' => $item->quantity,
                ]);

                $item->received_quantity = $item->quantity;
                $item->save();

                // Add to inventory stock
                $this->inventory->addStock(
                    $po->warehouse_id,
                    $item->product_id,
                    (float)$item->quantity,
                    $gr->receipt_number,
                    'Received from PO ' . $po->po_number,
                    $request->user()?->id
                );
            }

            $po->status = 'RECEIVED';
            $po->save();

            AuditLog::record($request->user()?->id, 'GOODS_RECEIVED', 'PurchaseOrder', (string)$po->id, null, ['gr_number' => $gr->receipt_number]);
            return $gr;
        });

        return $this->successResponse($receipt, 'Goods receipt recorded and inventory stock updated');
    }
}
