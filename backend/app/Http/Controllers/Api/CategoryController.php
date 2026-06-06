<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller {
    public function index() {
        return response()->json(['data' => Category::orderBy('name')->get()]);
    }

    public function store(Request $request) {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $base = Str::slug($data['name']) ?: 'category-'.time();
        $id = $base; $i = 1;
        while (Category::find($id)) { $id = "$base-".(++$i); }
        $category = Category::create(['id' => $id, 'name' => $data['name'], 'count' => 0]);
        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, Category $category) {
        $data = $request->validate(['name' => 'sometimes|string|max:255', 'count' => 'sometimes|integer']);
        $category->update($data);
        return response()->json(['data' => $category]);
    }

    public function destroy(Category $category) {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
