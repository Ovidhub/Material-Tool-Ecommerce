<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class SiteContentController extends Controller {
    public function show() {
        $row = SiteContent::first();
        return response()->json(['data' => $row?->content ?? []]);
    }
    public function update(Request $request) {
        $content = $request->all();
        $row = SiteContent::first();
        if ($row) $row->update(['content' => $content]);
        else $row = SiteContent::create(['content' => $content]);
        return response()->json(['data' => $row->content]);
    }
}
