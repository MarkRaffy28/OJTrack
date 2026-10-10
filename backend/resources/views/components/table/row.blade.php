<tr
  @if ($href)
    role="link"
    tabindex="0"
    data-href="{{ $href }}"
  @endif
  {{
    $attributes->merge([
      "class" => "transition-colors" . ($href ? " cursor-pointer hover:bg-primary-50" : ""),
    ])
  }}
>
  {{ $slot }}
</tr>
