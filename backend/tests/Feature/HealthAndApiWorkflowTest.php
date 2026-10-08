<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class HealthAndApiWorkflowTest extends TestCase
{
    /**
     * Test Health Endpoint (Section 33)
     */
    public function test_health_check_returns_up_status(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'UP',
                    'application' => 'Madura ERP / EIS',
                ],
            ]);
    }

    /**
     * Test Authentication Endpoint Standard Envelope (Section 14)
     */
    public function test_login_returns_token_and_standard_envelope(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@madura-erp.local',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ]);
    }

    /**
     * Test Invalid Login Credentials Envelope
     */
    public function test_login_with_invalid_credentials_returns_structured_error(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@madura-erp.local',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    /**
     * Test QA Course Control Center config
     */
    public function test_qa_course_config_accessible(): void
    {
        $response = $this->getJson('/api/qa/course-config');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['current_week', 'lab_mode'],
            ]);
    }

    /**
     * Test Products listing with Sanctum Auth
     */
    public function test_products_accessible_with_token(): void
    {
        $user = User::where('email', 'admin@madura-erp.local')->first();
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
