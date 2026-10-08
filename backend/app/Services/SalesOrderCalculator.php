<?php

namespace App\Services;

use InvalidArgumentException;

class SalesOrderCalculator
{
    protected DiscountService $discountService;

    public function __construct(DiscountService $discountService)
    {
        $this->discountService = $discountService;
    }

    /**
     * Calculate order item total
     */
    public function calculateItemTotal(float $quantity, float $unitPrice, float $discountRate = 0.0): float
    {
        // Business Rule 1: Quantity must be > 0
        if (!DefectToggleService::isDefectActive('DEFECT_BOUNDARY_QUANTITY')) {
            if ($quantity <= 0) {
                throw new InvalidArgumentException("Quantity must be greater than zero");
            }
        }

        if ($unitPrice < 0) {
            throw new InvalidArgumentException("Unit price cannot be negative");
        }

        $gross = $quantity * $unitPrice;
        $discount = $this->discountService->calculateDiscount($gross, $discountRate);
        return round($gross - $discount, 2);
    }

    /**
     * Calculate overall order summary: subtotal, discount, tax, total
     */
    public function calculateOrderSummary(array $items, float $orderDiscountRate = 0.0, float $taxRate = 11.0): array
    {
        // Business Rule 2: Sales order requires at least one item
        if (empty($items)) {
            throw new InvalidArgumentException("Order requires at least one item");
        }

        $subtotal = 0.0;
        foreach ($items as $item) {
            $qty = (float)($item['quantity'] ?? 0);
            $price = (float)($item['unit_price'] ?? 0);
            $itemDiscount = (float)($item['discount_rate'] ?? 0);
            $subtotal += $this->calculateItemTotal($qty, $price, $itemDiscount);
        }

        $discountAmount = $this->discountService->calculateDiscount($subtotal, $orderDiscountRate);
        $taxable = max(0.0, $subtotal - $discountAmount);
        $taxAmount = round($taxable * ($taxRate / 100), 2);
        $totalAmount = round($taxable + $taxAmount, 2);

        return [
            'subtotal' => round($subtotal, 2),
            'discount_rate' => $orderDiscountRate,
            'discount_amount' => $discountAmount,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ];
    }
}
