@php
  $config = $config();
  $fieldValue = $value();
  $isDisabled = $disabled();
  $isReadonly = $readonly();
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
      :disabled="$isDisabled"
      :readonly="$isReadonly"
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
      :disabled="$isDisabled"
      :readonly="$isReadonly"
    />
  @endif
@endif
