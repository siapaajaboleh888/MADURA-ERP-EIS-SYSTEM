<?php

namespace App\Http\Controllers\Api;

use App\Models\QaRequirement;
use App\Models\QaTestCase;
use App\Models\QaTestRun;
use App\Models\QaDefect;
use App\Models\CourseWeekConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class QaController extends BaseApiController
{
    // Course Control Center: Week config & Lab mode
    public function getCourseConfig(): JsonResponse
    {
        $config = CourseWeekConfig::firstOrCreate(
            ['id' => 1],
            ['current_week' => 1, 'lab_mode' => false, 'active_defects' => []]
        );
        return $this->successResponse($config, 'Course week configuration retrieved');
    }

    public function updateCourseConfig(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_week' => 'required|integer|between:1,16',
            'lab_mode' => 'required|boolean',
            'active_defects' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $config = CourseWeekConfig::firstOrCreate(['id' => 1]);
        $config->update($request->all());

        return $this->successResponse($config, 'Course week configuration updated successfully');
    }

    // Requirements Traceability
    public function requirements(Request $request): JsonResponse
    {
        $reqs = QaRequirement::with('testCases')->get();
        return $this->successResponse($reqs, 'QA requirements retrieved');
    }

    // Test Cases
    public function testCases(Request $request): JsonResponse
    {
        $query = QaTestCase::with('requirement');
        if ($request->has('test_type')) {
            $query->where('test_type', $request->query('test_type'));
        }
        if ($request->has('module')) {
            $query->where('module', $request->query('module'));
        }
        return $this->successResponse($query->get(), 'QA test cases retrieved');
    }

    // Defects
    public function defects(Request $request): JsonResponse
    {
        $query = QaDefect::with('reporter')->orderBy('id', 'desc');
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        return $this->successResponse($query->get(), 'QA defect log records retrieved');
    }

    public function storeDefect(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'expected_result' => 'required|string',
            'actual_result' => 'required|string',
            'reproduction_steps' => 'required|string',
            'severity' => 'required|in:CRITICAL,MAJOR,MEDIUM,MINOR',
            'priority' => 'required|in:HIGH,MEDIUM,LOW',
            'module' => 'required|string',
            'introduced_week' => 'required|integer|between:1,16',
            'detected_week' => 'required|integer|between:1,16',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $count = QaDefect::count() + 1;
        $defectId = 'DEF-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);

        $defect = QaDefect::create(array_merge($request->all(), [
            'defect_id' => $defectId,
            'status' => 'OPEN',
            'reported_by' => $request->user()?->id,
        ]));

        return $this->successResponse($defect, 'Defect logged successfully', 201);
    }

    // Traceability Matrix API
    public function traceabilityMatrix(): JsonResponse
    {
        $requirements = QaRequirement::with(['testCases'])->get();

        $matrix = $requirements->map(function ($req) {
            $defects = QaDefect::where('requirement_code', $req->requirement_id)->get();
            return [
                'requirement_id' => $req->requirement_id,
                'title' => $req->title,
                'module' => $req->module,
                'priority' => $req->priority,
                'test_cases' => $req->testCases->map(function ($tc) {
                    return [
                        'test_case_id' => $tc->test_case_id,
                        'title' => $tc->title,
                        'test_type' => $tc->test_type,
                        'status' => $tc->status,
                    ];
                }),
                'defects' => $defects->map(function ($df) {
                    return [
                        'defect_id' => $df->defect_id,
                        'title' => $df->title,
                        'severity' => $df->severity,
                        'status' => $df->status,
                    ];
                }),
            ];
        });

        return $this->successResponse($matrix, 'Traceability matrix retrieved');
    }
}
