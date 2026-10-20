<form
  method="{{ in_array(strtoupper($method), ['GET', 'POST']) ? strtolower($method) : 'POST' }}"
  action="{{ $action }}"
  data-loading-submit
  novalidate
  {{ $attributes }}
>
  @csrf

  @if (!in_array(strtoupper($method), ["GET", "POST"]))
    @method ($method)
  @endif

  {{ $slot }}
</form>
