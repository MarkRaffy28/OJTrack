@php
  $config = $component->config();
  $fieldValue = $component->value();
  $fieldOptions = $component->fieldOptions();
  $isDisabled = $component->disabled();
  $isReadonly = $component->readonly();
  $fieldType = $config["type"] ?? "text";
  $required = $component->required ?? ($config["required"] ?? false);
@endphp

@if ($config)
  @switch ($fieldType)
    {{-- Select Field --}}
    @case ('select')
      <x-form.select
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :icon="$config['icon']"
        :options="$fieldOptions"
        :required="$required"
        :value="$fieldValue"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
        :searchable="$config['searchable'] ?? false"
      />
      @break
      {{-- File Field --}}
    @case ('file')
      <x-form.file
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :icon="$config['icon']"
        :value="is_array($fieldValue) ? $fieldValue : (is_null($fieldValue) ? [] : [$fieldValue])"
        :accept="$config['accept'] ?? null"
        :multiple="$config['multiple'] ?? false"
        :max-files="$config['max_files'] ?? 1"
        :required="$required"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
      />
      @break
      {{-- TODO: Textarea Field --}}
      {{-- @case('textarea')
      <x-form.textarea
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :icon="$config['icon']"
        :required="$required"
        :value="$fieldValue"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
        :rows="$config['rows'] ?? 4"
      >
        {{ $fieldValue }}
      </x-form.textarea>
      @break --}}

      {{-- TODO: Boolean Field --}}
      {{-- @case('boolean')
      <x-form.checkbox
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :checked="(bool) $fieldValue"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
      />
      @break --}}

      {{-- Password Field --}}
    @case ('password')
      <x-form.input
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :icon="$config['icon']"
        type="password"
        :required="$required"
        :value="$fieldValue"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
      />
      @break
      {{-- Default: Text Input (includes text, email, tel, number, date, datetime-local, time, etc) --}}
    @default
      <x-form.input
        :id="$config['id']"
        :name="$config['name']"
        :label="$config['label']"
        :icon="$config['icon']"
        :type="$fieldType"
        :required="$required"
        :value="$fieldValue"
        :disabled="$isDisabled"
        :readonly="$isReadonly"
        :max="$config['max'] ?? null"
        :min="$config['min'] ?? null"
        :step="$config['step'] ?? null"
        :placeholder="$config['placeholder'] ?? null"
      />
  @endswitch
@endif
