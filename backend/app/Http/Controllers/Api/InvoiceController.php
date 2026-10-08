<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends BaseApiController
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['salesOrder', 'customer', 'payments'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->query('customer_id'));
        }

        $invoices = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($invoices, 'Invoices retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['salesOrder.items.product', 'customer', 'payments.recorder'])->find($id);
        if (!$invoice) {
            return $this->errorResponse('Invoice not found', null, 404);
        }
        return $this->successResponse($invoice, 'Invoice retrieved successfully');
    }

    public function pay(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::find($id);
        if (!$invoice) {
            return $this->errorResponse('Invoice not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|gt:0',
            'payment_method' => 'required|in:BANK_TRANSFER,CASH,CHEQUE',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        try {
            $payment = $this->paymentService->recordPayment(
                $invoice,
                (float)$request->amount,
                $request->payment_method,
                $request->reference_number,
                $request->notes,
                $request->user()?->id
            );
            return $this->successResponse([
                'payment' => $payment,
                'invoice' => $invoice->fresh(['payments', 'salesOrder']),
            ], 'Payment applied successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }
}
