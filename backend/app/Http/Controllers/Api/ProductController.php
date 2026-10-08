<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'unit', 'stocks.warehouse']);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        $perPage = (int) $request->query('per_page', 15);
        $products = $query->paginate($perPage);

        return $this->successResponse($products, 'Products retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'unit', 'stocks.warehouse'])->find($id);
        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }
        return $this->successResponse($product, 'Product retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|unique:products,sku|max:50',
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit_id' => 'required|exists:units,id',
            'type' => 'required|in:RAW_MATERIAL,FINISHED_GOOD,PACKAGING',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $product = Product::create($request->all());

        AuditLog::record($request->user()?->id, 'CREATE', 'Product', (string)$product->id, null, $product->toArray());

        return $this->successResponse($product, 'Product created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'sku' => 'sometimes|required|string|unique:products,sku,' . $id . '|max:50',
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'unit_id' => 'sometimes|required|exists:units,id',
            'type' => 'sometimes|required|in:RAW_MATERIAL,FINISHED_GOOD,PACKAGING',
            'purchase_price' => 'sometimes|required|numeric|min:0',
            'selling_price' => 'sometimes|required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $before = $product->toArray();
        $product->update($request->all());

        AuditLog::record($request->user()?->id, 'UPDATE', 'Product', (string)$product->id, $before, $product->toArray());

        return $this->successResponse($product, 'Product updated successfully');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }

        $before = $product->toArray();
        $product->delete();

        AuditLog::record($request->user()?->id, 'DELETE', 'Product', (string)$id, $before, null);

        return $this->successResponse(null, 'Product deleted successfully');
    }
}
