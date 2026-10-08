<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['code', 'name', 'location', 'capacity_tons', 'is_active'];
    protected $casts = [
        'capacity_tons' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function stocks()
    {
        return $this->hasMany(InventoryStock::class);
    }
}
