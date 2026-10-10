<a
  href="{{ request()->fullUrlWithQuery([$param => $id]) }}"
  class="group border-border bg-surface hover:border-primary-500 focus-visible:outline-primary-500 relative flex h-full flex-col overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
>
  <span
    class="bg-primary-600 absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
    aria-hidden="true"
  ></span>

  <div
    class="bg-primary-50 text-primary-600 ring-primary-100 group-hover:bg-primary-600 group-hover:ring-primary-600 flex size-12 items-center justify-center rounded-xl ring-1 transition-colors group-hover:text-white"
  >
    <span
      class="material-symbols-outlined material-symbols-lg"
      aria-hidden="true"
      >{{ $icon }}</span
    >
  </div>

  <div class="mt-4 min-w-0">
    <h3 class="text-text truncate text-base font-semibold">{{ $title }}</h3>

    @if ($subtitle)
      <p class="text-text-muted mt-1 line-clamp-2 text-sm">{{ $subtitle }}</p>
    @endif
  </div>

  <div class="mt-auto flex items-end justify-between gap-3 pt-5">
    @if ($count !== null)
      <div class="flex items-baseline gap-1.5 tabular-nums">
        <span
          class="text-text text-2xl leading-none font-semibold"
          >{{ number_format($count) }}</span
        >
        <span class="text-text-muted text-sm">{{
          \Illuminate\Support\Str::plural(
            $countLabel,
            $count,
          )
        }}</span>
      </div>
    @else
      <span></span>
    @endif

    <span
      class="text-text-muted group-hover:text-primary-600 inline-flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
    >
      View
      <span
        class="material-symbols-outlined material-symbols-xs transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
        >arrow_forward</span
      >
    </span>
  </div>
</a>
