@php
  $config = $config();
  $fieldValue = $fieldValue();
  $fieldOptions = $fieldOptions();
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
      :options="$fieldOptions"
      :required="$required ?? ($config['required'] ?? false)"
      :value="$fieldValue"
      :disabled="$isDisabled"
      :readonly="$isReadonly"
      :searchable="$config['searchable'] ?? false"
    />
  @elseif (($config["type"] ?? "text") === "file")
    <x-form.file
      :id="$config['id']"
      :name="$config['name']"
      :label="$config['label']"
      :icon="$config['icon']"
      :value="$fieldValue"
      :accept="$config['accept'] ?? null"
      :max-files="$config['max_files'] ?? 1"
      :required="$required ?? ($config['required'] ?? false)"
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
