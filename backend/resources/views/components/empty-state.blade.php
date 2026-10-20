<div
  class="border-border bg-surface flex h-full min-h-64 w-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center"
>
  <div
    class="bg-primary-50 text-primary-600 ring-primary-100 mb-4 flex size-14 items-center justify-center rounded-full ring-1"
  >
    <span
      class="material-symbols-outlined material-symbols-xl"
      aria-hidden="true"
      >{{ $icon }}</span
    >
  </div>

  <h3 class="text-text text-lg font-semibold">{{ $title }}</h3>

  @if ($description)
    <p class="text-text-muted mt-1 max-w-md text-sm">{{ $description }}</p>
  @endif

  @if ($slot->isNotEmpty())
    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">{{ $slot }}</div>
  @endif
</div>
