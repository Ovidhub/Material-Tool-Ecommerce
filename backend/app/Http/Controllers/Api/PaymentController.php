<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\Request;

class PaymentController extends Controller {
    public function __construct(private StripeService $stripe) {}

    public function intent(Request $request) {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
        ]);
        $total = self::totalsFor($data['items'])['total'];
        $intent = $this->stripe->createIntent((int) round($total * 100), 'usd');
        return response()->json(['clientSecret' => $intent['client_secret'], 'intentId' => $intent['id'], 'amount' => $total]);
    }

    /** Shared total computation: subtotal from DB prices, shipping, 8% tax. */
    public static function totalsFor(array $items): array {
        $subtotal = 0;
        foreach ($items as $item) {
            $product = Product::find($item['productId']);
            if (! $product) continue;
            $subtotal += $product->price * $item['qty'];
        }
        $shipping = $subtotal >= 199 ? 0 : 14.99;
        $tax = round($subtotal * 0.08, 2);
        $total = round($subtotal + $shipping + $tax, 2);
        return compact('subtotal', 'shipping', 'tax', 'total');
    }
}
