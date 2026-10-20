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
      {{-- Textarea Field --}}
      @case ('textarea')
      @php
        $dotName = rtrim(str_replace(["[", "]"], [".", ""], $config['name']), ".");
        $hasError = $errors->has($dotName);
        $textareaValue = $errors->any() ? old($dotName, $fieldValue) : ($fieldValue ?? "");
      @endphp
      <div>
        <label class="text-text-muted mb-2 block text-xs font-bold tracking-wider uppercase" for="{{ $config['id'] }}">
          {{ $config['label'] }}
          @if ($required)<span class="text-danger-500">*</span>@endif
        </label>
        <textarea
          id="{{ $config['id'] }}"
          name="{{ $config['name'] }}"
          rows="{{ $config['rows'] ?? 4 }}"
          @required ($required)
          @disabled ($isDisabled)
          @readonly ($isReadonly)
          class="border-border bg-background text-text focus:border-primary-500 w-full rounded-md border-2 px-3 py-2 text-sm"
        >{{ $textareaValue }}</textarea>
        @if ($hasError)
          <p class="text-danger-500 mt-1 text-sm">{{ $errors->first($dotName) }}</p>
        @endif
      </div>
      @break

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
