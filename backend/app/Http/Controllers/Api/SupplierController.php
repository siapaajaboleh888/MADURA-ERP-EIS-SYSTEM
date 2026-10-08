<?php

namespace App\Http\Controllers\Api;

use App\Models\Supplier;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SupplierController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query();
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->paginate((int) $request->query('per_page', 15));
        return $this->successResponse($suppliers, 'Suppliers retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $supplier = Supplier::with('purchaseOrders')->find($id);
        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }
        return $this->successResponse($supplier, 'Supplier retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:suppliers,code|max:50',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $supplier = Supplier::create($request->all());
        AuditLog::record($request->user()?->id, 'CREATE', 'Supplier', (string)$supplier->id, null, $supplier->toArray());

        return $this->successResponse($supplier, 'Supplier created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|unique:suppliers,code,' . $id . '|max:50',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $before = $supplier->toArray();
        $supplier->update($request->all());
        AuditLog::record($request->user()?->id, 'UPDATE', 'Supplier', (string)$supplier->id, $before, $supplier->toArray());

        return $this->successResponse($supplier, 'Supplier updated successfully');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        $before = $supplier->toArray();
        $supplier->delete();
        AuditLog::record($request->user()?->id, 'DELETE', 'Supplier', (string)$id, $before, null);

        return $this->successResponse(null, 'Supplier deleted successfully');
    }
}
