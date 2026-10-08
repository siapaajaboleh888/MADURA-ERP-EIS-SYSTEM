<?php

namespace App\Services;

use App\Models\Customer;
use InvalidArgumentException;

class DiscountService
{
    /**
     * Calculate discount amount and validate maximum discount rate per customer
     *
     * @param float $subtotal
     * @param float $discountRate Percentage between 0 and 100
     * @param Customer|null $customer
     * @return float
     */
    public function calculateDiscount(float $subtotal, float $discountRate, ?Customer $customer = null): float
    {
        if ($subtotal < 0) {
            throw new InvalidArgumentException("Subtotal cannot be negative");
        }

        // Controlled Defect for Week 3/5: Allow discountRate > 100 or fail limit check
        if (DefectToggleService::isDefectActive('DEFECT_DISCOUNT_CALCULATION')) {
            // Buggy calculation: discount is subtracted as direct addition or over 100% allowed
            return round($subtotal * ($discountRate / 10), 2);
        }

        if ($discountRate < 0) {
            throw new InvalidArgumentException("Discount rate cannot be negative");
        }

        if ($discountRate > 100) {
            throw new InvalidArgumentException("Discount rate cannot exceed 100%");
        }

        if ($customer && $discountRate > (float)$customer->max_discount_rate) {
            throw new InvalidArgumentException("Discount rate {$discountRate}% exceeds customer maximum allowed rate of {$customer->max_discount_rate}%");
        }

        return round($subtotal * ($discountRate / 100), 2);
    }
}
