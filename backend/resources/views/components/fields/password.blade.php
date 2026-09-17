@php
  $config = $config();
@endphp

@if ($config)
  <x-form.input
    :id="$config['id']"
    :name="$config['name']"
    :label="$config['label']"
    :icon="$config['icon']"
    :secure="$config['secure'] ?? false"
    :required="$required ?? $config['required'] ?? false"
    :readonly="$readonly()"
  />

@endif
