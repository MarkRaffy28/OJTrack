<div class="flex h-18 items-center justify-between border-b border-border-muted px-3 py-1">
  <div>
    <h1 class="text-text text-2xl font-semibold">{{ $title }}</h1>

    @if ($description)
      <p class="text-text-muted mt-1 text-sm">{{ $description }}</p>
    @endif
  </div>

  @if (isset($actions))
    <div class="flex items-center gap-2">{{ $actions }}</div>
  @endif
</div>
