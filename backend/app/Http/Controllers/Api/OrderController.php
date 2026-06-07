<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller {
    public function __construct(private StripeService $stripe) {}

    public function store(Request $request) {
        $user = $request->user();
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'paymentMethod' => 'required|string',
            'stripePaymentIntentId' => 'nullable|string',
            'email' => 'nullable|email', 'phone' => 'nullable|string',
            'firstName' => 'nullable|string', 'lastName' => 'nullable|string',
            'address' => 'nullable|string', 'city' => 'nullable|string',
            'state' => 'nullable|string', 'zip' => 'nullable|string',
        ]);

        if (! empty($data['stripePaymentIntentId'])) {
            if (! $this->stripe->intentSucceeded($data['stripePaymentIntentId'])) {
                throw ValidationException::withMessages(['payment' => ['Payment was not completed.']]);
            }
        }

        $totals = PaymentController::totalsFor($data['items']);

        $order = DB::transaction(function () use ($data, $totals, $user) {
            // Lock the referenced products and validate availability before writing.
            $productIds = collect($data['items'])->pluck('productId')->all();
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');
            foreach ($data['items'] as $item) {
                $product = $products->get($item['productId']);
                if (! $product) {
                    throw ValidationException::withMessages(['items' => ['One or more products are no longer available.']]);
                }
                if ($item['qty'] > $product->stock) {
                    throw ValidationException::withMessages(['items' => ["Insufficient stock for {$product->name}."]]);
                }
            }

            $order = Order::create([
                'id' => $this->uniqueOrderId(),
                'user_id' => $user->id,
                'subtotal' => $totals['subtotal'],
                'shipping' => $totals['shipping'],
                'tax' => $totals['tax'],
                'total' => $totals['total'],
                'status' => 'Pending',
                'payment_method' => $data['paymentMethod'],
                'stripe_payment_intent_id' => $data['stripePaymentIntentId'] ?? null,
                'email' => $data['email'] ?? null, 'phone' => $data['phone'] ?? null,
                'first_name' => $data['firstName'] ?? null, 'last_name' => $data['lastName'] ?? null,
                'address' => $data['address'] ?? null, 'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null, 'zip' => $data['zip'] ?? null,
            ]);
            foreach ($data['items'] as $item) {
                $product = $products->get($item['productId']);
                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => $product->image,
                    'qty' => $item['qty'],
                ]);
                $product->decrement('stock', $item['qty']);
            }
            return $order;
        });

        return (new OrderResource($order->load('items')))->response()->setStatusCode(201);
    }

    public function index(Request $request) {
        $orders = $request->user()->orders()->with('items')->latest()->get();
        return OrderResource::collection($orders);
    }

    private function uniqueOrderId(): string {
        do { $id = 'TF-'.random_int(100000, 999999); } while (Order::whereKey($id)->exists());
        return $id;
    }
}
