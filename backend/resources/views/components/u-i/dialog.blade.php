<div
  id="{{ $id }}"
  {{
    $attributes->class([
      "fixed inset-0 z-50 hidden items-center justify-center p-4",
    ])
  }}
  data-dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="{{ $id }}-title"
  @if ($description) aria-describedby="{{ $id }}-description" @endif
>
  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" data-dialog-dismiss></div>

  <div
    class="bg-surface border-border relative flex max-h-full w-full max-w-md flex-col rounded-2xl border shadow-xl"
  >
    <button
      type="button"
      class="text-text-muted hover:bg-border-muted hover:text-text focus:ring-primary-500 absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-1.5 transition-colors focus:ring-2 focus:outline-none"
      aria-label="Close"
      data-dialog-dismiss
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
        >close</span
      >
    </button>

    <div class="shrink-0 px-6 pt-6 pr-14">
      <h2 id="{{ $id }}-title" class="text-text text-lg font-semibold">{{ $title }}</h2>
    </div>

    @if ($description || $slot->isNotEmpty())
      <div class="overflow-y-auto px-6 py-4">
        @if ($description)
          <p
            id="{{ $id }}-description"
            class="text-text-muted text-sm"
          >{{ $description }}</p>
        @endif

        {{ $slot }}
      </div>
    @endif

    @isset ($actions)
      <div
        class="border-border-muted bg-background flex shrink-0 flex-col-reverse gap-2 rounded-b-2xl border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-end"
      >
        {{ $actions }}
      </div>
    @endisset
  </div>
</div>
