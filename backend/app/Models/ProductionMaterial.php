<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionMaterial extends Model
{
    protected $fillable = [
        'production_order_id', 'product_id', 'required_quantity', 'consumed_quantity'
    ];

    protected $casts = [
        'required_quantity' => 'decimal:2',
        'consumed_quantity' => 'decimal:2',
    ];

    public function productionOrder()
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
