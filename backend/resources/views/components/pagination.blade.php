@if ($paginator->hasPages())
  <nav
    class="flex flex-col gap-4 rounded-b-xl border border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Pagination Navigation"
  >
    {{-- Results Summary --}}
    <div class="flex items-center justify-between text-xs text-slate-500 sm:text-sm">
      <p>Showing
      <span class="font-semibold text-slate-900">{{
        $paginator->firstItem() ??
          0
      }}</span>
      to
      <span class="font-semibold text-slate-900">{{
        $paginator->lastItem() ??
          0
      }}</span>
      of
      <span class="font-semibold text-slate-900">{{ $paginator->total() }}</span>
      results</p>
      <span class="font-medium text-slate-500 sm:hidden">
        Page {{ $paginator->currentPage() }} of {{ $paginator->lastPage() }}
      </span>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
      {{-- Prev / Page Range / Next Controls --}}
      <div class="flex items-center gap-1">
        {{-- Previous Link --}}
        @if ($paginator->onFirstPage())
          <span
            class="inline-flex cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 opacity-60 sm:text-sm"
          >
            Previous
          </span>
        @else
          <a
            href="{{ $paginator->previousPageUrl() }}"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-600 focus:ring-2 focus:ring-violet-500/20 focus:outline-none sm:text-sm"
          >
            Previous
          </a>
        @endif

        {{-- Numeric Pages (Desktop) --}}
        <div class="hidden items-center gap-1 sm:flex">
          @php
            $start = max(1, $paginator->currentPage() - 2);
            $end = min($paginator->lastPage(), $paginator->currentPage() + 2);
          @endphp

          @if ($start > 1)
            <a
              href="{{ $paginator->url(1) }}"
              class="inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >1</a
            >
            @if ($start > 2)
              <span
                class="inline-flex size-9 items-center justify-center text-sm text-slate-400"
                >…</span
              >
            @endif
          @endif

          @for ($page = $start; $page <= $end; $page++)
            @if ($page == $paginator->currentPage())
              <span
                class="inline-flex size-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-xs"
              >
                {{ $page }}
              </span>
            @else
              <a
                href="{{ $paginator->url($page) }}"
                class="inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              >
                {{ $page }}
              </a>
            @endif
          @endfor

          @if ($end < $paginator->lastPage())
            @if ($end < $paginator->lastPage() - 1)
              <span
                class="inline-flex size-9 items-center justify-center text-sm text-slate-400"
                >…</span
              >
            @endif
            <a
              href="{{ $paginator->url($paginator->lastPage()) }}"
              class="inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >{{ $paginator->lastPage() }}</a
            >
          @endif
        </div>

        {{-- Next Link --}}
        @if ($paginator->hasMorePages())
          <a
            href="{{ $paginator->nextPageUrl() }}"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-600 focus:ring-2 focus:ring-violet-500/20 focus:outline-none sm:text-sm"
          >
            Next
          </a>
        @else
          <span
            class="inline-flex cursor-not-allowed items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 opacity-60 sm:text-sm"
          >
            Next
          </span>
        @endif
      </div>

      {{-- Go To Page Input Form --}}
      <form
        action="{{ request()->url() }}"
        method="GET"
        class="flex items-center gap-1.5 pl-0 sm:border-l sm:border-slate-200 sm:pl-3"
      >
        {{-- Preserve active URL filters/search params --}}
        @foreach (request()->except($paginator->getPageName()) as $key => $value)
          @if (is_array($value))
            @foreach ($value as $item)
              <input type="hidden" name="{{ $key }}[]" value="{{ $item }}" />
            @endforeach
          @else
            <input type="hidden" name="{{ $key }}" value="{{ $value }}" />
          @endif
        @endforeach

        <label for="page-jump-input" class="text-xs text-slate-500"> Go to </label>
        <input
          type="number"
          id="page-jump-input"
          name="{{ $paginator->getPageName() }}"
          min="1"
          max="{{ $paginator->lastPage() }}"
          value="{{ $paginator->currentPage() }}"
          class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none h-8 w-14 [appearance:textfield] rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-medium text-slate-900 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
          aria-label="Target Page"
        />
        <button
          type="submit"
          class="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 transition hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
        >
          Go
        </button>
      </form>
    </div>
  </nav>
@endif
