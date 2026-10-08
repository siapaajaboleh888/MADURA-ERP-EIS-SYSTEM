<?php

namespace App\Http\Controllers\Api;

use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\AuditLog;
use App\Services\SalesOrderCalculator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class QuotationController extends BaseApiController
{
    protected SalesOrderCalculator $calculator;

    public function __construct(SalesOrderCalculator $calculator)
    {
        $this->calculator = $calculator;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Quotation::with(['customer', 'items.product', 'creator'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $quotations = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($quotations, 'Quotations retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $quotation = Quotation::with(['customer', 'items.product', 'creator'])->find($id);
        if (!$quotation) {
            return $this->errorResponse('Quotation not found', null, 404);
        }
        return $this->successResponse($quotation, 'Quotation retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'quotation_date' => 'required|date',
            'valid_until' => 'required|date|after_or_equal:quotation_date',
            'discount_rate' => 'nullable|numeric|between:0,100',
            'tax_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|gt:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_rate' => 'nullable|numeric|between:0,100',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        try {
            $summary = $this->calculator->calculateOrderSummary(
                $request->items,
                (float)($request->discount_rate ?? 0),
                (float)($request->tax_rate ?? 11.0)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }

        $quotation = DB::transaction(function () use ($request, $summary) {
            $q = Quotation::create([
                'quotation_number' => 'QUO-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
                'customer_id' => $request->customer_id,
                'quotation_date' => $request->quotation_date,
                'valid_until' => $request->valid_until,
                'subtotal' => $summary['subtotal'],
                'discount_rate' => $summary['discount_rate'],
                'discount_amount' => $summary['discount_amount'],
                'tax_rate' => $summary['tax_rate'],
                'tax_amount' => $summary['tax_amount'],
                'total_amount' => $summary['total_amount'],
                'status' => 'DRAFT',
                'notes' => $request->notes,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($request->items as $item) {
                $totalPrice = $this->calculator->calculateItemTotal(
                    (float)$item['quantity'],
                    (float)$item['unit_price'],
                    (float)($item['discount_rate'] ?? 0)
                );

                QuotationItem::create([
                    'quotation_id' => $q->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'total_price' => $totalPrice,
                ]);
            }

            AuditLog::record($request->user()?->id, 'CREATE', 'Quotation', (string)$q->id, null, $q->toArray());
            return $q;
        });

        return $this->successResponse($quotation->load('items'), 'Quotation created successfully', 201);
    }
}
