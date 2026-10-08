<?php

namespace App\Http\Controllers\Api;

use App\Models\Customer;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CustomerController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $customers = $query->paginate((int) $request->query('per_page', 15));
        return $this->successResponse($customers, 'Customers retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $customer = Customer::with(['salesOrders', 'invoices'])->find($id);
        if (!$customer) {
            return $this->errorResponse('Customer not found', null, 404);
        }
        return $this->successResponse($customer, 'Customer retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:customers,code|max:50',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'max_discount_rate' => 'nullable|numeric|between:0,100',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $customer = Customer::create($request->all());
        AuditLog::record($request->user()?->id, 'CREATE', 'Customer', (string)$customer->id, null, $customer->toArray());

        return $this->successResponse($customer, 'Customer created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return $this->errorResponse('Customer not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|unique:customers,code,' . $id . '|max:50',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'max_discount_rate' => 'nullable|numeric|between:0,100',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $before = $customer->toArray();
        $customer->update($request->all());
        AuditLog::record($request->user()?->id, 'UPDATE', 'Customer', (string)$customer->id, $before, $customer->toArray());

        return $this->successResponse($customer, 'Customer updated successfully');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $customer = Customer::find($id);
        if (!$customer) {
            return $this->errorResponse('Customer not found', null, 404);
        }

        $before = $customer->toArray();
        $customer->delete();
        AuditLog::record($request->user()?->id, 'DELETE', 'Customer', (string)$id, $before, null);

        return $this->successResponse(null, 'Customer deleted successfully');
    }
}
