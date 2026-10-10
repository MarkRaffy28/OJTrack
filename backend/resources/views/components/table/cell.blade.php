<td
  {{
    $attributes->class([
      "whitespace-nowrap px-4 py-3 text-text",
    ])
  }}
>
  <div class="flex {{ $alignmentClass }}">
    @if ($href)
      <a
        href="{{ $href }}"
        class="text-primary decoration-text-muted hover:decoration-primary hover:decoration-text focus-visible:decoration-text focus-visible:decoration-primary underline underline-offset-4 transition-colors duration-150"
      >
        {{ $slot }}
      </a>
    @else
      {{ $slot }}
    @endif
  </div>
</td>
