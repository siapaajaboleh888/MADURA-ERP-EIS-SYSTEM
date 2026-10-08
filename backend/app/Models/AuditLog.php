<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'entity', 'entity_id', 'before', 'after', 'ip_address'
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?int $userId, string $action, string $entity, ?string $entityId = null, ?array $before = null, ?array $after = null, ?string $ip = null): self
    {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'before' => $before,
            'after' => $after,
            'ip_address' => $ip ?? request()->ip(),
        ]);
    }
}
