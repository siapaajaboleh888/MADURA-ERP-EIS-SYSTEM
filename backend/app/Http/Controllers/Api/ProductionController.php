<?php

namespace App\Http\Controllers\Api;

use App\Models\ProductionOrder;
use App\Models\ProductionMaterial;
use App\Models\Product;
use App\Models\AuditLog;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductionController extends BaseApiController
{
    protected InventoryService $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function index(Request $request): JsonResponse
    {
        $query = ProductionOrder::with(['product', 'warehouse', 'materials.product', 'creator'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $orders = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($orders, 'Production orders retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $order = ProductionOrder::with(['product', 'warehouse', 'materials.product', 'creator', 'approver'])->find($id);
        if (!$order) {
            return $this->errorResponse('Production order not found', null, 404);
        }
        return $this->successResponse($order, 'Production order retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'target_quantity' => 'required|numeric|gt:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
            'materials' => 'required|array|min:1',
            'materials.*.product_id' => 'required|exists:products,id',
            'materials.*.required_quantity' => 'required|numeric|gt:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $order = DB::transaction(function () use ($request) {
            $prod = ProductionOrder::create([
                'prod_number' => 'PRD-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'product_id' => $request->product_id,
                'warehouse_id' => $request->warehouse_id,
                'target_quantity' => $request->target_quantity,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => 'DRAFT',
                'notes' => $request->notes,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($request->materials as $mat) {
                ProductionMaterial::create([
                    'production_order_id' => $prod->id,
                    'product_id' => $mat['product_id'],
                    'required_quantity' => $mat['required_quantity'],
                    'consumed_quantity' => 0,
                ]);
            }

            AuditLog::record($request->user()?->id, 'CREATE', 'ProductionOrder', (string)$prod->id, null, $prod->toArray());
            return $prod;
        });

        return $this->successResponse($order->load('materials'), 'Production order created in DRAFT state', 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $order = ProductionOrder::find($id);
        if (!$order) {
            return $this->errorResponse('Production order not found', null, 404);
        }

        $order->status = 'APPROVED';
        $order->approved_by = $request->user()?->id;
        $order->save();

        AuditLog::record($request->user()?->id, 'APPROVE', 'ProductionOrder', (string)$order->id);
        return $this->successResponse($order, 'Production order approved');
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $order = ProductionOrder::with('materials')->find($id);
        if (!$order) {
            return $this->errorResponse('Production order not found', null, 404);
        }

        $actualQty = $request->has('actual_quantity') ? (float)$request->actual_quantity : (float)$order->target_quantity;

        // Business Rule 8: Production cannot consume unavailable raw materials
        foreach ($order->materials as $mat) {
            $stock = $this->inventory->getStock($order->warehouse_id, $mat->product_id);
            if ($stock->quantity_on_hand < $mat->required_quantity) {
                return $this->errorResponse("Insufficient raw material (Product #{$mat->product_id}). Needed: {$mat->required_quantity}, Available: {$stock->quantity_on_hand}", null, 422);
            }
        }

        DB::transaction(function () use ($order, $actualQty, $request) {
            // Consume materials
            foreach ($order->materials as $mat) {
                $stock = $this->inventory->getStock($order->warehouse_id, $mat->product_id);
                $stock->quantity_on_hand -= $mat->required_quantity;
                $stock->save();

                $mat->consumed_quantity = $mat->required_quantity;
                $mat->save();
            }

            // Produce finished good
            $this->inventory->addStock(
                $order->warehouse_id,
                $order->product_id,
                $actualQty,
                $order->prod_number,
                'Production Output completed',
                $request->user()?->id
            );

            $order->actual_quantity = $actualQty;
            $order->status = 'COMPLETED';
            $order->save();

            AuditLog::record($request->user()?->id, 'COMPLETE', 'ProductionOrder', (string)$order->id, null, ['actual_quantity' => $actualQty]);
        });

        return $this->successResponse($order->fresh(['materials']), 'Production completed and finished goods stock updated');
    }
}
