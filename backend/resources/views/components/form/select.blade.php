@php
  $hasError = $errors->has($name);
  $defaultSelected =
    collect($options)->first(
      fn($opt) => in_array("selected", $opt, true) || !empty($opt["selected"]),
    )["value"] ?? "";
  $selectValue = $errors->any()
    ? old($name, $value ?? $defaultSelected)
    : $value ?? $defaultSelected;
@endphp

<div>
  @if ($label)
    <label
      @class ([
        "mb-2 block text-xs font-bold uppercase tracking-wider",
        "text-danger-500" => $hasError,
        "text-text-muted" => !$hasError
      ])
      for="{{ $id }}"
    >
      {{ $label }}
      <span data-required-marker class="text-danger-500" @class (["hidden" => !$required])
        >*</span
      >
    </label>
  @endif

  <div @class (["flex items-center gap-2" => $icon && $readonly])>
    @if ($icon && $readonly)
      <span class="material-symbols-outlined text-text-subtle">{{ $icon }}</span>
    @endif

    <div @class (["relative flex-1", "has-icon" => $icon && !$readonly])>
      @if (!$readonly)
        <select
          id="{{ $id }}"
          name="{{ $name }}"
          data-placeholder="{{ $placeholder }}"
          data-searchable="{{ $searchable ? 'true' : 'false' }}"
          {{ $attributes }}
          @required ($required)
          @disabled ($disabled)
          @class ([
            "js-select2",
            "w-full px-3 py-2 text-base text-text transition-colors duration-200 appearance-none cursor-pointer",
            "pl-10" => $icon,
            "pr-10" => true,
            "rounded-md border-2 bg-background focus:outline-none",
            "border-danger-500 focus:border-danger-500" => $hasError,
            "border-border focus:border-primary-500" => !$hasError
          ])
        >
          <option value="">{{ $placeholder }}</option>

          @foreach ($options as $option)
            @php
              $optValue = is_array($option) ? $option["value"] : $option;
              $optLabel = is_array($option) ? $option["label"] : ucfirst($option);
            @endphp

            <option value="{{ $optValue }}" @selected ($optValue == $selectValue)>
              {{ $optLabel }}
            </option>
          @endforeach
        </select>

        @if ($icon)
          <span
            class="material-symbols-outlined text-text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          >
            {{ $icon }}
          </span>
        @endif
      @else
        <div class="text-text w-full px-3 py-2 text-base">
          @php
            $selectedLabel = collect($options)->firstWhere("value", $selectValue)["label"] ?? "-";
          @endphp

          {{ $selectedLabel }}
        </div>

        <input type="hidden" name="{{ $name }}" value="{{ $selectValue }}" />
      @endif
    </div>
  </div>

  @error ($name)
    <p class="text-danger-500 mt-1 text-sm">{{ $message }}</p>
  @enderror
</div>
