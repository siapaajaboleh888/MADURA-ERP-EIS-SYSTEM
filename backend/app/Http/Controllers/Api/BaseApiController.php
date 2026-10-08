<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class BaseApiController extends Controller
{
    /**
     * Standardized Success Response:
     * {
     *   "success": true,
     *   "message": "...",
     *   "data": {}
     * }
     */
    protected function successResponse($data = null, string $message = 'Operation successful', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Standardized Error Response:
     * {
     *   "success": false,
     *   "message": "...",
     *   "errors": {}
     * }
     */
    protected function errorResponse(string $message = 'Operation failed', $errors = null, int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors ?? new \stdClass(),
        ], $code);
    }
}
