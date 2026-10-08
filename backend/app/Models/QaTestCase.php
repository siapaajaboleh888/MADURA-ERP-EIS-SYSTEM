<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QaTestCase extends Model
{
    protected $fillable = [
        'test_case_id', 'requirement_id', 'module', 'test_type', 'title',
        'description', 'preconditions', 'test_steps', 'test_data', 'expected_result', 'status'
    ];

    public function requirement()
    {
        return $this->belongsTo(QaRequirement::class, 'requirement_id');
    }
}
