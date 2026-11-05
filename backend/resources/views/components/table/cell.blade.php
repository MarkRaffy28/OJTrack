@php
  $isEmpty = trim((string) $slot) === '';
@endphp

<td
  {{
    $attributes->class([
      "whitespace-nowrap px-4 py-3 text-text",
    ])
  }}
>
  <div class="flex {{ $alignmentClass }}">
    <span class="{{ $class }}">
      @if ($isEmpty)
        <span class="text-text-muted italic">
          &mdash;
        </span>
      @elseif ($href)
        <a
          href="{{ $href }}"
          class="text-primary decoration-text-muted hover:decoration-primary hover:decoration-text focus-visible:decoration-text focus-visible:decoration-primary underline underline-offset-4 transition-colors duration-150"
        >
          {{ $slot }}
        </a>
      @else
        {{ $slot }}
      @endif
    </span>
  </div>
</td>
