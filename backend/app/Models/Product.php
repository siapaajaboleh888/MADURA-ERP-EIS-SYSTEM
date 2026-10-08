<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sku', 'name', 'category_id', 'unit_id', 'type',
        'purchase_price', 'selling_price', 'min_stock', 'max_stock', 'is_active'
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'min_stock' => 'decimal:2',
        'max_stock' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function stocks()
    {
        return $this->hasMany(InventoryStock::class);
    }

    public function getTotalStockAttribute()
    {
        return $this->stocks()->sum('quantity_on_hand');
    }

    public function getAvailableStockAttribute()
    {
        return $this->stocks()->sum('quantity_on_hand') - $this->stocks()->sum('quantity_reserved');
    }
}
