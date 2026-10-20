@if (count($items))
  <nav aria-label="Breadcrumb" class="m-3 mb-0">
    <ol class="flex flex-wrap items-center gap-1.5 text-sm">
      @foreach ($items as $item)
        @if (!$loop->first)
          <li class="flex items-center" aria-hidden="true">
            <span class="material-symbols-outlined material-symbols-xs text-text-subtle"
              >chevron_right</span
            >
          </li>
        @endif

        <li>
          @if (!$loop->last && isset($item["url"]))
            <a
              href="{{ $item['url'] }}"
              class="text-text-muted hover:text-primary-600 focus-visible:outline-primary-500 rounded transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >{{ $item["label"] }}</a
            >
          @else
            <span
              @if ($loop->last) aria-current="page" @endif
              class="font-semibold {{ $loop->last ? 'text-text' : 'text-text-muted' }}"
              >{{ $item["label"] }}</span
            >
          @endif
        </li>
      @endforeach
    </ol>
  </nav>
@endif
