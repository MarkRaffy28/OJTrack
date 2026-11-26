<?php

return [
  App\Providers\AppServiceProvider::class,

  // Register Telescope only in local development.
  ...(app()->environment('local')
    ? [App\Providers\TelescopeServiceProvider::class]
    : []),
];
