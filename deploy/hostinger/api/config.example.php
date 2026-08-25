<?php
/**
 * Copie para `config.php` no servidor e preencha. O arquivo com a chave real
 * NÃO deve ser versionado nem enviado ao Git.
 *
 * Como obter cada valor:
 *
 * api_key  → console.cloud.google.com → crie um projeto → ative a
 *            "Places API (New)" → Credenciais → Criar chave de API.
 *            Restrinja a chave por API (só Places API New). Não restrinja por
 *            referrer HTTP: quem chama é o servidor, não o navegador.
 *
 * place_id → developers.google.com/maps/documentation/places/web-service/place-id
 *            Busque "MAV Emplacamento" e copie o Place ID (começa com "ChIJ").
 *
 * A Places API tem cota gratuita mensal; com cache de 6 horas o site faz
 * cerca de 4 chamadas por dia.
 */

return [
    'api_key'   => 'COLE_AQUI_A_CHAVE_DA_PLACES_API',
    'place_id'  => 'COLE_AQUI_O_PLACE_ID',
    'cache_ttl' => 21600, // segundos (6 horas)
];
