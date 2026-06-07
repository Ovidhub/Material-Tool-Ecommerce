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
        /** @var \App\Models\User $user */
        $user = $request->user('sanctum');
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
            $order = Order::create([
                'id' => 'TF-'.random_int(100000, 999999),
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
                $product = Product::find($item['productId']);
                if (! $product) continue;
                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => $product->image,
                    'qty' => $item['qty'],
                ]);
                $product->decrement('stock', min($item['qty'], $product->stock));
            }
            return $order;
        });

        return (new OrderResource($order->load('items')))->response()->setStatusCode(201);
    }

    public function index(Request $request) {
        /** @var \App\Models\User $user */
        $user = $request->user('sanctum');
        $orders = $user->orders()->with('items')->latest()->get();
        return OrderResource::collection($orders);
    }
}
