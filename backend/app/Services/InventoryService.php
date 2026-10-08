<?php

namespace App\Services;

use App\Models\InventoryStock;
use App\Models\StockMovement;
use App\Models\AuditLog;
use InvalidArgumentException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Get or create stock record for a product in a warehouse
     */
    public function getStock(int $warehouseId, int $productId): InventoryStock
    {
        return InventoryStock::firstOrCreate(
            ['warehouse_id' => $warehouseId, 'product_id' => $productId],
            ['quantity_on_hand' => 0, 'quantity_reserved' => 0]
        );
    }

    /**
     * Add stock (IN movement, e.g. from Goods Receipt or Production)
     */
    public function addStock(int $warehouseId, int $productId, float $quantity, string $sourceDoc, ?string $notes = null, ?int $userId = null): InventoryStock
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException("Quantity to add must be greater than zero");
        }

        return DB::transaction(function () use ($warehouseId, $productId, $quantity, $sourceDoc, $notes, $userId) {
            $stock = $this->getStock($warehouseId, $productId);
            $beforeQty = $stock->quantity_on_hand;
            $stock->quantity_on_hand += $quantity;
            $stock->save();

            StockMovement::create([
                'reference_number' => 'MOV-' . strtoupper(Str::random(10)),
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'type' => 'IN',
                'quantity' => $quantity,
                'balance_after' => $stock->quantity_on_hand,
                'source_document' => $sourceDoc,
                'notes' => $notes,
                'created_by' => $userId,
            ]);

            AuditLog::record($userId, 'STOCK_MOVEMENT', 'InventoryStock', (string)$stock->id, ['on_hand' => $beforeQty], ['on_hand' => $stock->quantity_on_hand]);

            return $stock;
        });
    }

    /**
     * Reserve stock for an approved sales order
     */
    public function reserveStock(int $warehouseId, int $productId, float $quantity, ?int $userId = null): InventoryStock
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException("Quantity to reserve must be greater than zero");
        }

        return DB::transaction(function () use ($warehouseId, $productId, $quantity, $userId) {
            $stock = $this->getStock($warehouseId, $productId);
            $available = $stock->quantity_on_hand - $stock->quantity_reserved;

            // Business Rule 4: Stock cannot become negative
            if (!DefectToggleService::isDefectActive('DEFECT_STOCK_CALCULATION')) {
                if ($available < $quantity) {
                    throw new InvalidArgumentException("Insufficient available stock. Available: {$available}, Requested: {$quantity}");
                }
            }

            $before = ['reserved' => $stock->quantity_reserved];
            $stock->quantity_reserved += $quantity;
            $stock->save();

            AuditLog::record($userId, 'RESERVE_STOCK', 'InventoryStock', (string)$stock->id, $before, ['reserved' => $stock->quantity_reserved]);

            return $stock;
        });
    }

    /**
     * Release / deduct stock upon delivery (OUT movement)
     */
    public function deductStockOnDelivery(int $warehouseId, int $productId, float $quantity, string $sourceDoc, ?int $userId = null): InventoryStock
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException("Quantity must be greater than zero");
        }

        return DB::transaction(function () use ($warehouseId, $productId, $quantity, $sourceDoc, $userId) {
            $stock = $this->getStock($warehouseId, $productId);

            // Business Rule 5: Delivery cannot exceed available/reserved stock
            if ($stock->quantity_on_hand < $quantity) {
                throw new InvalidArgumentException("Cannot deliver {$quantity}. Physical stock is only {$stock->quantity_on_hand}");
            }

            $before = ['on_hand' => $stock->quantity_on_hand, 'reserved' => $stock->quantity_reserved];
            $stock->quantity_on_hand -= $quantity;
            $stock->quantity_reserved = max(0.0, $stock->quantity_reserved - $quantity);
            $stock->save();

            StockMovement::create([
                'reference_number' => 'MOV-' . strtoupper(Str::random(10)),
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'type' => 'OUT',
                'quantity' => $quantity,
                'balance_after' => $stock->quantity_on_hand,
                'source_document' => $sourceDoc,
                'notes' => 'Shipped for delivery ' . $sourceDoc,
                'created_by' => $userId,
            ]);

            AuditLog::record($userId, 'STOCK_MOVEMENT', 'InventoryStock', (string)$stock->id, $before, ['on_hand' => $stock->quantity_on_hand, 'reserved' => $stock->quantity_reserved]);

            return $stock;
        });
    }
}
