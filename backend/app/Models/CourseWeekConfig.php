<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseWeekConfig extends Model
{
    protected $fillable = ['current_week', 'lab_mode', 'active_defects'];

    protected $casts = [
        'lab_mode' => 'boolean',
        'active_defects' => 'array',
    ];
}
