<?php

namespace App\Http\Controllers\Api;

use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeliveryController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Delivery::with(['salesOrder.customer', 'warehouse', 'items.product', 'shipper'])->orderBy('id', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $deliveries = $query->paginate((int)$request->query('per_page', 15));
        return $this->successResponse($deliveries, 'Deliveries retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $delivery = Delivery::with(['salesOrder.customer', 'warehouse', 'items.product', 'shipper'])->find($id);
        if (!$delivery) {
            return $this->errorResponse('Delivery not found', null, 404);
        }
        return $this->successResponse($delivery, 'Delivery retrieved successfully');
    }
}
