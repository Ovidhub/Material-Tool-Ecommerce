<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;

class CustomerController extends Controller {
    public function index() {
        $users = User::withCount('orders')->get()->map(fn ($u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
            'role' => $u->role, 'orders' => $u->orders_count,
            'joined' => $u->created_at?->toDateString(),
        ]);
        return response()->json(['data' => $users]);
    }
}
