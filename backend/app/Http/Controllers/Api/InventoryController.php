<?php

namespace App\Http\Controllers\Api;

use App\Models\InventoryStock;
use App\Models\StockMovement;
use App\Models\StockAdjustment;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InventoryController extends BaseApiController
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = InventoryStock::with(['warehouse', 'product.category', 'product.unit']);

        if ($request->has('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        $stocks = $query->paginate((int) $request->query('per_page', 20));
        return $this->successResponse($stocks, 'Inventory stock balances retrieved successfully');
    }

    public function movements(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product', 'warehouse', 'creator'])->orderBy('id', 'desc');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        if ($request->has('warehouse_id')) {
            $query->where('warehouse_id', $request->query('warehouse_id'));
        }

        $movements = $query->paginate((int) $request->query('per_page', 20));
        return $this->successResponse($movements, 'Stock movement card records retrieved');
    }

    public function adjust(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'actual_quantity' => 'required|numeric|min:0',
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $stock = $this->inventoryService->getStock((int)$request->warehouse_id, (int)$request->product_id);
        $systemQty = (float)$stock->quantity_on_hand;
        $actualQty = (float)$request->actual_quantity;
        $diff = $actualQty - $systemQty;

        $stock->quantity_on_hand = $actualQty;
        $stock->save();

        $adj = StockAdjustment::create([
            'adjustment_number' => 'ADJ-' . strtoupper(Str::random(8)),
            'warehouse_id' => $request->warehouse_id,
            'product_id' => $request->product_id,
            'system_quantity' => $systemQty,
            'actual_quantity' => $actualQty,
            'difference_quantity' => $diff,
            'reason' => $request->reason,
            'created_by' => $request->user()?->id,
        ]);

        return $this->successResponse($adj, 'Stock adjusted successfully');
    }

    public function transfer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'from_warehouse_id' => 'required|exists:warehouses,id|different:to_warehouse_id',
            'to_warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|gt:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $qty = (float)$request->quantity;
        $sourceStock = $this->inventoryService->getStock((int)$request->from_warehouse_id, (int)$request->product_id);

        if ($sourceStock->quantity_on_hand < $qty) {
            return $this->errorResponse("Insufficient stock in source warehouse. Available: {$sourceStock->quantity_on_hand}", null, 422);
        }

        $sourceStock->quantity_on_hand -= $qty;
        $sourceStock->save();

        $destStock = $this->inventoryService->getStock((int)$request->to_warehouse_id, (int)$request->product_id);
        $destStock->quantity_on_hand += $qty;
        $destStock->save();

        $transfer = StockTransfer::create([
            'transfer_number' => 'TRF-' . strtoupper(Str::random(8)),
            'from_warehouse_id' => $request->from_warehouse_id,
            'to_warehouse_id' => $request->to_warehouse_id,
            'product_id' => $request->product_id,
            'quantity' => $qty,
            'status' => 'COMPLETED',
            'notes' => $request->notes,
            'created_by' => $request->user()?->id,
        ]);

        return $this->successResponse($transfer, 'Stock transferred successfully');
    }
}
