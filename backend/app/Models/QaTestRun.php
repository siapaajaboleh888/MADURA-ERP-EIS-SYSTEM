<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QaTestRun extends Model
{
    protected $fillable = [
        'run_identifier', 'academic_week', 'name', 'executed_by',
        'executed_at', 'passed_count', 'failed_count', 'blocked_count', 'status', 'notes'
    ];

    public function executor()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }
}
