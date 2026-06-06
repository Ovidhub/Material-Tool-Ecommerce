<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        return [
            'name' => "$required|string|max:255",
            'category' => "$required|string",
            'price' => "$required|numeric|min:0",
            'subcategory' => 'nullable|string',
            'oldPrice' => 'nullable|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string',
            'brand' => 'nullable|string',
            'badge' => 'nullable|in:New,Sale,Hot,Top',
            'shortDesc' => 'nullable|string',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'specs' => 'nullable|array',
            'image' => 'nullable|string',
        ];
    }
    public function dbData(): array {
        $v = $this->validated();
        $map = ['oldPrice' => 'old_price', 'shortDesc' => 'short_desc'];
        $out = [];
        foreach ($v as $k => $val) { $out[$map[$k] ?? $k] = $val; }
        return $out;
    }
}
