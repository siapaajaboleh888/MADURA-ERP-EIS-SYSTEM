<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseApiController
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $user = User::with('role.permissions')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuditLog::record(null, 'LOGIN_FAILED', 'User', null, null, ['email' => $request->email]);
            return $this->errorResponse('Invalid credentials', ['auth' => ['Invalid email or password']], 401);
        }

        if ($user->status !== 'ACTIVE') {
            return $this->errorResponse('User account is inactive or suspended', null, 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::record($user->id, 'LOGIN', 'User', (string)$user->id, null, ['name' => $user->name]);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : null,
                'role_display' => $user->role ? $user->role->display_name : null,
                'permissions' => $user->role ? $user->role->permissions->pluck('name') : [],
            ],
            'token' => $token,
        ], 'Login successful');
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('role.permissions');
        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'role' => $user->role ? $user->role->name : null,
            'role_display' => $user->role ? $user->role->display_name : null,
            'permissions' => $user->role ? $user->role->permissions->pluck('name') : [],
        ], 'Profile retrieved successfully');
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        AuditLog::record($user->id, 'LOGOUT', 'User', (string)$user->id);

        return $this->successResponse(null, 'Logged out successfully');
    }
}
