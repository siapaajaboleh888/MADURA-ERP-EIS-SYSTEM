<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\DiscountService;
use App\Services\SalesOrderCalculator;
use App\Services\WorkflowService;
use App\Models\Customer;
use App\Models\SalesOrder;
use InvalidArgumentException;

class BusinessRulesAndCalculationsTest extends TestCase
{
    protected DiscountService $discountService;
    protected SalesOrderCalculator $calculator;
    protected WorkflowService $workflow;

    protected function setUp(): void
    {
        parent::setUp();
        $this->discountService = new DiscountService();
        $this->calculator = new SalesOrderCalculator($this->discountService);
        $this->workflow = new WorkflowService();
    }

    /**
     * Week 3 / Rule 1: Quantity must be greater than zero (EP & BVA)
     */
    public function test_quantity_must_be_greater_than_zero(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->calculator->calculateItemTotal(0, 10000);
    }

    public function test_negative_quantity_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->calculator->calculateItemTotal(-5, 10000);
    }

    public function test_valid_quantity_calculates_correctly(): void
    {
        $total = $this->calculator->calculateItemTotal(10, 5000, 10);
        // 10 * 5000 = 50,000; 10% discount = 5,000; total = 45,000
        $this->assertEquals(45000.0, $total);
    }

    /**
     * Week 3 / Rule 6: Discount cannot exceed customer configured maximum
     */
    public function test_discount_cannot_exceed_customer_max_rate(): void
    {
        $customer = new Customer(['max_discount_rate' => 10.0]);
        $this->expectException(InvalidArgumentException::class);
        $this->discountService->calculateDiscount(100000, 15.0, $customer);
    }

    /**
     * Week 4: State Machine Valid Transitions
     */
    public function test_sales_order_valid_state_transitions(): void
    {
        $order = new SalesOrder(['status' => SalesOrder::STATUS_DRAFT]);
        $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_SUBMITTED);
        $this->assertEquals(SalesOrder::STATUS_SUBMITTED, $order->status);

        $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_APPROVED);
        $this->assertEquals(SalesOrder::STATUS_APPROVED, $order->status);

        $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_STOCK_RESERVED);
        $this->assertEquals(SalesOrder::STATUS_STOCK_RESERVED, $order->status);

        $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_DELIVERED);
        $this->assertEquals(SalesOrder::STATUS_DELIVERED, $order->status);
    }

    /**
     * Week 4: State Machine Invalid Transitions (Rejection)
     */
    public function test_sales_order_invalid_skip_transition_is_rejected(): void
    {
        $order = new SalesOrder(['status' => SalesOrder::STATUS_DRAFT]);
        $this->expectException(InvalidArgumentException::class);
        // Illegal skip from DRAFT directly to DELIVERED
        $this->workflow->transitionSalesOrder($order, SalesOrder::STATUS_DELIVERED);
    }

    /**
     * Rule 2: Sales order requires at least one item
     */
    public function test_order_requires_at_least_one_item(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->calculator->calculateOrderSummary([]);
    }
}
