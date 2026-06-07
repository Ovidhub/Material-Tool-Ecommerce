<?php
namespace App\Services;
use Stripe\StripeClient;

class StripeService {
    private StripeClient $client;
    public function __construct(?StripeClient $client = null) {
        $this->client = $client ?: new StripeClient(config('services.stripe.secret'));
    }

    /** @return array{id:string, client_secret:string} */
    public function createIntent(int $amountCents, string $currency = 'usd'): array {
        $intent = $this->client->paymentIntents->create([
            'amount' => $amountCents,
            'currency' => $currency,
            'automatic_payment_methods' => ['enabled' => true],
        ]);
        return ['id' => $intent->id, 'client_secret' => $intent->client_secret];
    }

    public function intentSucceeded(string $intentId): bool {
        $intent = $this->client->paymentIntents->retrieve($intentId);
        return $intent->status === 'succeeded';
    }
}
