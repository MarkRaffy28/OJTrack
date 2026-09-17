@php
  $config = $config();
  $fieldValue = $value();
@endphp

@if ($config)
  @if (($config["type"] ?? "text") === "select")
    <x-form.select
      :id="$config['id']"
      :name="$config['name']"
      :label="$config['label']"
      :icon="$config['icon']"
      :options="$config['options']"
      :required="$required ?? ($config['required'] ?? false)"
      :value="$fieldValue"
      :readonly="$readonly()"
    />

  @else
    <x-form.input
      :id="$config['id']"
      :name="$config['name']"
      :label="$config['label']"
      :icon="$config['icon']"
      :type="$config['type'] ?? 'text'"
      :required="$required ?? ($config['required'] ?? false)"
      :value="$fieldValue"
      :readonly="$readonly()"
    />

  @endif

@endif
