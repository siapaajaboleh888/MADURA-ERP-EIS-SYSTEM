<?php

namespace App\Services;

use App\Models\CourseWeekConfig;

class DefectToggleService
{
    /**
     * Check if a defect is active based on LAB_MODE and active_defects configuration
     */
    public static function isDefectActive(string $defectCode): bool
    {
        $config = CourseWeekConfig::first();
        if (!$config) {
            return false;
        }

        if (!$config->lab_mode) {
            return false;
        }

        $activeDefects = $config->active_defects ?? [];
        return in_array($defectCode, $activeDefects, true);
    }
}
