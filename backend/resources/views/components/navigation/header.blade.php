<div class="border-border-muted border-b">
  <div class="flex h-18 items-center justify-between px-3 py-1">
    <div>
      <h1 class="text-text text-2xl font-semibold">{{ $title }}</h1>

      @if ($description)
        <p class="text-text-muted mt-1 text-sm">{{ $description }}</p>
      @endif
    </div>

    @if ($print || $createRoute || isset($actions))
      <div class="flex items-center gap-2">
        @if ($print)
          <a
            href="{{ $printUrl }}"
            @if ($openPrintInNewTab) target="_blank" rel="noopener noreferrer" @endif
            class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 print:hidden"
          >
            <span class="material-symbols-outlined material-symbols-md">print</span>
            Print
          </a>
        @endif

        @if ($createRoute)
          <a
            href="{{ $createRoute }}"
            class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors print:hidden"
          >
            <span class="material-symbols-outlined material-symbols-md">add</span>
            {{ $createButtonText }}
          </a>
        @endif

        @if (isset($actions))
          {{ $actions }}
        @endif
      </div>
    @endif
  </div>

  @if (isset($filters))
    <div class="px-3 pb-3 print:hidden">{{ $filters }}</div>
  @endif
</div>
