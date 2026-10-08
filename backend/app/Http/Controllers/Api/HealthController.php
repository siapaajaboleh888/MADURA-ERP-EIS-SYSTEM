<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends BaseApiController
{
    public function check(): JsonResponse
    {
        $dbStatus = 'OK';
        $dbError = null;

        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            $dbStatus = 'ERROR';
            $dbError = $e->getMessage();
        }

        $isHealthy = ($dbStatus === 'OK');

        return response()->json([
            'success' => $isHealthy,
            'message' => $isHealthy ? 'Application is healthy' : 'Application has health issues',
            'data' => [
                'status' => $isHealthy ? 'UP' : 'DOWN',
                'application' => 'Madura ERP / EIS',
                'version' => '1.0.0',
                'timestamp' => now()->toIso8601String(),
                'environment' => config('app.env'),
                'database' => [
                    'status' => $dbStatus,
                    'error' => $dbError,
                ],
            ]
        ], $isHealthy ? 200 : 503);
    }
}
