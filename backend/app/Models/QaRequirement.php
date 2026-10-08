<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QaRequirement extends Model
{
    protected $fillable = [
        'requirement_id', 'title', 'description', 'module', 'priority', 'acceptance_criteria', 'status'
    ];

    public function testCases()
    {
        return $this->hasMany(QaTestCase::class, 'requirement_id');
    }
}
