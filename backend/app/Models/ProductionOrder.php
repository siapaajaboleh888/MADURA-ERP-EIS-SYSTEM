<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionOrder extends Model
{
    protected $fillable = [
        'prod_number', 'product_id', 'warehouse_id', 'target_quantity',
        'actual_quantity', 'start_date', 'end_date', 'status', 'notes',
        'created_by', 'approved_by'
    ];

    protected $casts = [
        'target_quantity' => 'decimal:2',
        'actual_quantity' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function materials()
    {
        return $this->hasMany(ProductionMaterial::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
