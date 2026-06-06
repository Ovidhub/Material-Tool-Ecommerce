<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller {
    public function index(Request $request) {
        $q = Product::query();
        if ($s = $request->query('search')) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")
                ->orWhere('brand', 'like', "%$s%")->orWhere('sku', 'like', "%$s%"));
        }
        if ($c = $request->query('category')) $q->where('category', $c);
        if ($b = $request->query('brand')) $q->where('brand', $b);
        if ($badge = $request->query('badge')) $q->where('badge', $badge);
        if ($min = $request->query('min_price')) $q->where('price', '>=', $min);
        if ($max = $request->query('max_price')) $q->where('price', '<=', $max);
        match ($request->query('sort')) {
            'price_asc' => $q->orderBy('price'),
            'price_desc' => $q->orderByDesc('price'),
            'rating' => $q->orderByDesc('rating'),
            'newest' => $q->orderByDesc('id'),
            default => $q->orderByDesc('id'),
        };
        return ProductResource::collection($q->paginate((int) $request->query('per_page', 24)));
    }

    public function show(string $slug) {
        $product = Product::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        return new ProductResource($product);
    }

    public function store(ProductRequest $request) {
        $data = $request->dbData();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['features'] = $data['features'] ?? [];
        $data['specs'] = $data['specs'] ?? [];
        $product = Product::create($data);
        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    public function update(ProductRequest $request, Product $product) {
        $product->update($request->dbData());
        return new ProductResource($product->fresh());
    }

    public function destroy(Product $product) {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    private function uniqueSlug(string $name): string {
        $base = Str::slug($name);
        $slug = $base; $i = 1;
        while (Product::where('slug', $slug)->exists()) { $slug = "$base-".(++$i); }
        return $slug;
    }
}
