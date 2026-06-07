<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodPublicResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id, 'type' => $this->type, 'name' => $this->name,
            'enabled' => (bool) $this->enabled, 'mode' => $this->mode,
            'publicKey' => $this->public_key,
            'walletAddress' => $this->wallet_address, 'network' => $this->network,
            'instructions' => $this->instructions,
        ];
    }
}
