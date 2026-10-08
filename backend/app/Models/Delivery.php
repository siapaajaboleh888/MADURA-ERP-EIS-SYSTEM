<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_READY = 'READY';
    public const STATUS_SHIPPED = 'SHIPPED';
    public const STATUS_DELIVERED = 'DELIVERED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $fillable = [
        'do_number', 'sales_order_id', 'warehouse_id', 'delivery_date',
        'shipping_carrier', 'tracking_number', 'status', 'notes', 'shipped_by'
    ];

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items()
    {
        return $this->hasMany(DeliveryItem::class);
    }

    public function shipper()
    {
        return $this->belongsTo(User::class, 'shipped_by');
    }
}
