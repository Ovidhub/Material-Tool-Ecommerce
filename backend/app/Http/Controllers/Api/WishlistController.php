<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller {
    public function index(Request $request) {
        return response()->json(['data' => $request->user()->wishlistItems()->pluck('product_id')->map(fn($i)=>(int)$i)->values()->all()]);
    }
    public function store(Request $request) {
        $data = $request->validate(['product_id' => 'required|integer']);
        WishlistItem::firstOrCreate(['user_id' => $request->user()->id, 'product_id' => $data['product_id']]);
        return response()->json(['message' => 'Added'], 201);
    }
    public function destroy(Request $request, int $productId) {
        $request->user()->wishlistItems()->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Removed']);
    }
}
