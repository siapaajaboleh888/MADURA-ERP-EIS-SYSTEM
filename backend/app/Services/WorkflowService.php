<?php

namespace App\Services;

use App\Models\SalesOrder;
use App\Models\PurchaseOrder;
use App\Models\Delivery;
use App\Models\ProductionOrder;
use InvalidArgumentException;

class WorkflowService
{
    /**
     * Allowed State Transitions for Sales Order
     * DRAFT -> SUBMITTED -> APPROVED -> STOCK_RESERVED -> DELIVERED -> INVOICED -> PAID
     */
    protected array $salesOrderTransitions = [
        SalesOrder::STATUS_DRAFT => [SalesOrder::STATUS_SUBMITTED, SalesOrder::STATUS_CANCELLED],
        SalesOrder::STATUS_SUBMITTED => [SalesOrder::STATUS_APPROVED, SalesOrder::STATUS_CANCELLED],
        SalesOrder::STATUS_APPROVED => [SalesOrder::STATUS_STOCK_RESERVED, SalesOrder::STATUS_CANCELLED],
        SalesOrder::STATUS_STOCK_RESERVED => [SalesOrder::STATUS_DELIVERED, SalesOrder::STATUS_CANCELLED],
        SalesOrder::STATUS_DELIVERED => [SalesOrder::STATUS_INVOICED],
        SalesOrder::STATUS_INVOICED => [SalesOrder::STATUS_PAID],
        SalesOrder::STATUS_PAID => [],
        SalesOrder::STATUS_CANCELLED => [],
    ];

    /**
     * Allowed transitions for Delivery
     * DRAFT -> READY -> SHIPPED -> DELIVERED (or CANCELLED)
     */
    protected array $deliveryTransitions = [
        Delivery::STATUS_DRAFT => [Delivery::STATUS_READY, Delivery::STATUS_CANCELLED],
        Delivery::STATUS_READY => [Delivery::STATUS_SHIPPED, Delivery::STATUS_CANCELLED],
        Delivery::STATUS_SHIPPED => [Delivery::STATUS_DELIVERED, Delivery::STATUS_CANCELLED],
        Delivery::STATUS_DELIVERED => [],
        Delivery::STATUS_CANCELLED => [],
    ];

    /**
     * Validate and apply state transition for Sales Order
     */
    public function transitionSalesOrder(SalesOrder $order, string $targetState): SalesOrder
    {
        $currentState = $order->status;

        // Controlled Defect for Week 4: Allow arbitrary invalid transitions
        if (DefectToggleService::isDefectActive('DEFECT_STATE_TRANSITION')) {
            $order->status = $targetState;
            $order->save();
            return $order;
        }

        $allowedNextStates = $this->salesOrderTransitions[$currentState] ?? [];
        if (!in_array($targetState, $allowedNextStates, true)) {
            throw new InvalidArgumentException("Invalid state transition from [{$currentState}] to [{$targetState}] for Sales Order.");
        }

        $order->status = $targetState;
        if ($order->exists) {
            $order->save();
        }
        return $order;
    }

    /**
     * Validate and apply state transition for Delivery
     */
    public function transitionDelivery(Delivery $delivery, string $targetState): Delivery
    {
        $currentState = $delivery->status;
        $allowedNextStates = $this->deliveryTransitions[$currentState] ?? [];
        if (!in_array($targetState, $allowedNextStates, true)) {
            throw new InvalidArgumentException("Invalid state transition from [{$currentState}] to [{$targetState}] for Delivery.");
        }

        $delivery->status = $targetState;
        $delivery->save();
        return $delivery;
    }
}
