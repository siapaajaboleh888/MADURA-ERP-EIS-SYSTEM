<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QaDefect extends Model
{
    protected $fillable = [
        'defect_id', 'title', 'description', 'expected_result', 'actual_result',
        'reproduction_steps', 'severity', 'priority', 'module', 'requirement_code',
        'test_case_code', 'introduced_week', 'detected_week', 'fixed_week',
        'status', 'root_cause', 'corrective_action', 'evidence', 'reported_by'
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
