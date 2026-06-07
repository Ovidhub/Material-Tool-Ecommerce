<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'date' => $this->created_at?->toISOString(),
            'status' => $this->status,
            'paymentMethod' => $this->payment_method,
            'subtotal' => (float) $this->subtotal,
            'shipping' => (float) $this->shipping,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'items' => $this->items->map(fn ($i) => [
                'productId' => (int) $i->product_id,
                'name' => $i->name,
                'price' => (float) $i->price,
                'emoji' => $i->image,
                'qty' => (int) $i->qty,
            ]),
        ];
    }
}
