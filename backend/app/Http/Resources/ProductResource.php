<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'price' => (float) $this->price,
            'oldPrice' => $this->old_price !== null ? (float) $this->old_price : null,
            'rating' => (float) $this->rating,
            'reviews' => (int) $this->reviews,
            'stock' => (int) $this->stock,
            'sku' => $this->sku,
            'brand' => $this->brand,
            'badge' => $this->badge,
            'shortDesc' => $this->short_desc,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'specs' => $this->specs ?? [],
            'image' => $this->image,
        ];
    }
}
