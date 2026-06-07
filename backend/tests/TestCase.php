<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Auth;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The test harness reuses one application instance across multiple HTTP
        // requests within a single test method, and Sanctum's RequestGuard caches
        // the resolved user. Reset the guard cache after each request so requests
        // authenticated as different users don't leak into one another.
        // (Not needed in production: each real request runs in its own process.)
        $this->app->terminating(function () {
            Auth::forgetGuards();
        });
    }
}
