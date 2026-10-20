<tr
  @if ($href)
    role="link"
    tabindex="0"
    data-href="{{ $href }}"
    onclick="if (!event.target.closest('a, button, [data-dialog-open], [data-delete-trigger]')) window.location.href = this.dataset.href"
    onkeydown="if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a, button')) { event.preventDefault(); window.location.href = this.dataset.href }"
  @endif
  {{
    $attributes->merge([
      "class" => "transition-colors" . ($href ? " cursor-pointer hover:bg-primary-50" : ""),
    ])
  }}
>
  {{ $slot }}
</tr>
