<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentMethodPublicResource;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller {
    public function public() {
        return PaymentMethodPublicResource::collection(PaymentMethod::where('enabled', true)->get());
    }
    public function index() {
        return PaymentMethodResource::collection(PaymentMethod::all());
    }

    private function rules(bool $create): array {
        $req = $create ? 'required' : 'sometimes';
        return [
            'type' => "$req|in:stripe,paypal,crypto,bank,custom",
            'name' => "$req|string",
            'enabled' => 'boolean', 'mode' => 'in:test,live',
            'publicKey' => 'nullable|string', 'secretKey' => 'nullable|string',
            'clientId' => 'nullable|string', 'clientSecret' => 'nullable|string',
            'walletAddress' => 'nullable|string', 'network' => 'nullable|string',
            'instructions' => 'nullable|string',
        ];
    }
    private function dbData(array $v): array {
        $map = ['publicKey'=>'public_key','secretKey'=>'secret_key','clientId'=>'client_id',
                'clientSecret'=>'client_secret','walletAddress'=>'wallet_address'];
        $out = []; foreach ($v as $k=>$val) { $out[$map[$k] ?? $k] = $val; } return $out;
    }

    public function store(Request $request) {
        $v = $request->validate($this->rules(true));
        $data = $this->dbData($v);
        $data['id'] = ($v['type']).'-'.time();
        $method = PaymentMethod::create($data);
        return (new PaymentMethodResource($method))->response()->setStatusCode(201);
    }
    public function update(Request $request, PaymentMethod $paymentMethod) {
        $v = $request->validate($this->rules(false));
        $paymentMethod->update($this->dbData($v));
        return new PaymentMethodResource($paymentMethod->fresh());
    }
    public function destroy(PaymentMethod $paymentMethod) {
        $paymentMethod->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
