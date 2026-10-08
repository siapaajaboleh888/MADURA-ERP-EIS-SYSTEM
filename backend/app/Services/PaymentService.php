<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\SalesOrder;
use App\Models\AuditLog;
use InvalidArgumentException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Generate Invoice from Sales Order (once delivered or agreed)
     */
    public function createInvoiceForSalesOrder(SalesOrder $order): Invoice
    {
        // Business Rule 9: Invoice total must correspond to the source sales transaction
        if ($order->invoice) {
            return $order->invoice;
        }

        return Invoice::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
            'sales_order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'amount' => $order->total_amount,
            'paid_amount' => 0,
            'outstanding_amount' => $order->total_amount,
            'status' => Invoice::STATUS_UNPAID,
            'notes' => 'Generated automatically for Sales Order ' . $order->so_number,
        ]);
    }

    /**
     * Record payment against an invoice
     */
    public function recordPayment(Invoice $invoice, float $amount, string $paymentMethod, ?string $referenceNumber = null, ?string $notes = null, ?int $userId = null): Payment
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Payment amount must be greater than zero");
        }

        // Business Rule 10: Payment cannot exceed outstanding invoice amount
        if ($amount > (float)$invoice->outstanding_amount) {
            throw new InvalidArgumentException("Payment amount ({$amount}) exceeds outstanding invoice amount ({$invoice->outstanding_amount})");
        }

        return DB::transaction(function () use ($invoice, $amount, $paymentMethod, $referenceNumber, $notes, $userId) {
            $payment = Payment::create([
                'payment_number' => 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'invoice_id' => $invoice->id,
                'payment_date' => now()->toDateString(),
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'reference_number' => $referenceNumber,
                'notes' => $notes,
                'recorded_by' => $userId,
            ]);

            $invoice->paid_amount += $amount;
            $invoice->outstanding_amount -= $amount;

            if ($invoice->outstanding_amount <= 0) {
                $invoice->status = Invoice::STATUS_PAID;
                if ($invoice->salesOrder && $invoice->salesOrder->status === SalesOrder::STATUS_INVOICED) {
                    $invoice->salesOrder->status = SalesOrder::STATUS_PAID;
                    $invoice->salesOrder->save();
                }
            } else {
                $invoice->status = Invoice::STATUS_PARTIALLY_PAID;
            }
            $invoice->save();

            AuditLog::record($userId, 'PAYMENT_RECORDED', 'Payment', (string)$payment->id, null, ['amount' => $amount, 'invoice_id' => $invoice->id]);

            return $payment;
        });
    }
}
