<?php
/**
 * Avaliações do Google para o site da MAV — versão para hospedagem
 * compartilhada (Hostinger), equivalente à rota /api/google-reviews do
 * server.js.
 *
 * Por que existe: a chave da Places API não pode ir para o navegador. Este
 * arquivo fica no servidor, guarda a chave fora da pasta pública sempre que
 * possível e devolve ao front apenas o resultado já normalizado.
 *
 * Instalação:
 *   1. copie esta pasta para public_html/api/
 *   2. crie public_html/api/config.php a partir de config.example.php
 *   3. confira o acesso em https://seudominio.com.br/api/google-reviews.php
 *
 * Sem configuração a resposta é 204 e a seção de avaliações não aparece no
 * site — nunca um bloco vazio nem depoimento de exemplo.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=1800');

$configPath = __DIR__ . '/config.php';
$config = is_readable($configPath) ? require $configPath : [];

$apiKey  = $config['api_key']  ?? getenv('GOOGLE_PLACES_API_KEY') ?: '';
$placeId = $config['place_id'] ?? getenv('GOOGLE_PLACE_ID') ?: '';
$ttl     = (int) ($config['cache_ttl'] ?? 21600); // 6 horas

if ($apiKey === '' || $placeId === '') {
    http_response_code(204);
    exit;
}

$cacheFile = sys_get_temp_dir() . '/mav-google-reviews-' . md5($placeId) . '.json';

/** Cache em arquivo: a Places API é cobrada por chamada. */
function readCache(string $file, int $ttl): ?string
{
    if (!is_readable($file)) {
        return null;
    }
    if (time() - (int) filemtime($file) > $ttl) {
        return null;
    }
    $contents = file_get_contents($file);

    return $contents === false ? null : $contents;
}

$cached = readCache($cacheFile, $ttl);
if ($cached !== null) {
    echo $cached;
    exit;
}

$url = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId) . '?languageCode=pt-BR';

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_HTTPHEADER     => [
        'X-Goog-Api-Key: ' . $apiKey,
        'X-Goog-FieldMask: rating,userRatingCount,googleMapsUri,reviews',
    ],
]);

$response = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($response === false || $status !== 200) {
    // Cache vencido ainda serve: melhor avaliação de ontem que seção sumindo.
    $stale = is_readable($cacheFile) ? file_get_contents($cacheFile) : false;
    if ($stale !== false) {
        echo $stale;
        exit;
    }
    http_response_code(204);
    exit;
}

$place = json_decode($response, true);

$reviews = [];
foreach ($place['reviews'] ?? [] as $review) {
    $text = $review['originalText']['text'] ?? $review['text']['text'] ?? '';
    if (trim($text) === '') {
        // Nota sem comentário não rende card — vira ruído visual.
        continue;
    }

    $reviews[] = [
        'author'       => $review['authorAttribution']['displayName'] ?? 'Cliente',
        'photo'        => $review['authorAttribution']['photoUri'] ?? null,
        'authorUrl'    => $review['authorAttribution']['uri'] ?? null,
        'rating'       => (float) ($review['rating'] ?? 0),
        'relativeTime' => $review['relativePublishTimeDescription'] ?? '',
        'text'         => $text,
    ];
}

$payload = json_encode([
    'rating'  => isset($place['rating']) ? (float) $place['rating'] : null,
    'total'   => isset($place['userRatingCount']) ? (int) $place['userRatingCount'] : null,
    'url'     => $place['googleMapsUri'] ?? null,
    'reviews' => $reviews,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

@file_put_contents($cacheFile, $payload, LOCK_EX);

echo $payload;
