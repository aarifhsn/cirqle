<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    // Explicitly whitelist the frontend subdomain
    'allowed_origins' => [
        'https://app.cirqle.arifhassan.com',
        'https://cirqle.arifhassan.com',
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
