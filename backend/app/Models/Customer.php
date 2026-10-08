<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'code', 'name', 'email', 'phone', 'address',
        'credit_limit', 'max_discount_rate', 'is_active'
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'max_discount_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function salesOrders()
    {
        return $this->hasMany(SalesOrder::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
