<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}" />

  <title>
    @yield ("title", "Developer Console")
    | {{ config("app.name") }}
  </title>

  <link rel="shortcut icon" href="{{ asset('images/logo.png') }}" type="image/png" />
  
  <link rel="preconnect" href="https://fonts.bunny.net" />
  <link
    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200&display=swap"
    rel="stylesheet"
  />

  @vite (["resources/css/app.css"])
</head>

@php
  // Dark theme scoped to this layout: remaps existing tokens on <body>, so app.css stays untouched.
  $themeScope = implode(" ", [
    "[--color-surface:var(--color-slate-900)]",
    "[--color-background:var(--color-slate-950)]",
    "[--color-border:var(--color-slate-700)]",
    "[--color-border-muted:var(--color-slate-800)]",
    "[--color-text:var(--color-slate-100)]",
    "[--color-text-muted:var(--color-slate-400)]",
    "[--color-text-subtle:var(--color-slate-500)]",
    "[--color-primary-400:var(--color-cyan-400)]",
    "[--color-success-50:color-mix(in_srgb,var(--color-success-500)_12%,transparent)]",
    "[--color-success-700:var(--color-green-300)]",
    "[--color-warning-50:color-mix(in_srgb,var(--color-warning-500)_12%,transparent)]",
    "[--color-warning-700:var(--color-amber-300)]",
    "[--color-danger-50:color-mix(in_srgb,var(--color-danger-500)_12%,transparent)]",
    "[--color-danger-700:var(--color-red-300)]",
    "[--color-info-50:color-mix(in_srgb,var(--color-info-500)_12%,transparent)]",
    "[--color-info-600:var(--color-sky-300)]",
  ]);

  $role = request()->user()->role->value;
  $navItems = [
    [
      "label" => "Console",
      "icon" => "terminal",
      "routes" => [$role . ".developer-console.index", $role . ".developer-console"],
    ],
    [
      "label" => "Logs",
      "icon" => "receipt_long",
      "routes" => [
        $role . ".developer-console.logs.index",
        $role . ".developer-console.logs",
      ],
    ],
  ];
  $navItems = collect($navItems)
    ->map(
      fn($item) => $item + [
        "route" => collect($item["routes"])->first(fn($name) => Route::has($name)),
      ],
    )
    ->filter(fn($item) => $item["route"])
    ->all();
@endphp

<body
  class="{{ $themeScope }} min-h-screen bg-background font-sans text-text antialiased"
>
  <div
    class="bg-primary-400/10 pointer-events-none fixed -top-32 -left-32 size-96 rounded-full blur-3xl"
    aria-hidden="true"
  ></div>
  <div
    class="bg-primary-600/20 pointer-events-none fixed -right-32 -bottom-32 size-96 rounded-full blur-3xl"
    aria-hidden="true"
  ></div>

  <header class="border-border bg-surface/80 relative border-b backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <div
        class="text-primary-400 inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-wide"
      >
        <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
          >terminal</span
        >
        <span>dev<span class="text-text-subtle">/</span>console</span>
      </div>

      <nav class="flex items-center gap-1">
        @foreach ($navItems as $item)
          @if (Route::has($item["route"]))
            <a
              href="{{ route($item['route']) }}"
              class="{{ request()->routeIs($item['route']) ? 'border-primary-400/40 bg-primary-400/10 text-primary-400' : 'border-transparent text-text-muted hover:text-text' }} inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition"
            >
              <span
                class="material-symbols-outlined material-symbols-xs"
                aria-hidden="true"
                >{{ $item["icon"] }}</span
              >
              {{ $item["label"] }}
            </a>
          @endif
        @endforeach
      </nav>
    </div>
  </header>

  <main class="relative mx-auto max-w-5xl px-4 py-8">
    @yield ("content")
  </main>
</body>
</html>
