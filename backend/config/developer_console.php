<?php

return [
  'enabled' => env('DEVELOPER_CONSOLE_ENABLED', false),

  'commands' => [
    'about' => [
      'label' => 'Application Information',
      'command' => 'about',
    ],

    'route:list' => [
      'label' => 'List Routes',
      'command' => 'route:list',
    ],

    'migrate:status' => [
      'label' => 'Migration Status',
      'command' => 'migrate:status',
    ],

    'optimize:clear' => [
      'label' => 'Clear Optimization Caches',
      'command' => 'optimize:clear',
    ],

    'config:clear' => [
      'label' => 'Clear Configuration Cache',
      'command' => 'config:clear',
    ],

    'route:clear' => [
      'label' => 'Clear Route Cache',
      'command' => 'route:clear',
    ],

    'view:clear' => [
      'label' => 'Clear Compiled Views',
      'command' => 'view:clear',
    ],

    'cache:clear' => [
      'label' => 'Clear Application Cache',
      'command' => 'cache:clear',
    ],

    'config:cache' => [
      'label' => 'Rebuild Configuration Cache',
      'command' => 'config:cache',
    ],

    'route:cache' => [
      'label' => 'Rebuild Route Cache',
      'command' => 'route:cache',
    ],

    'view:cache' => [
      'label' => 'Precompile Blade Views',
      'command' => 'view:cache',
    ],
  ],
];