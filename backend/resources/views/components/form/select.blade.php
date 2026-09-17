@php
  $hasError = $errors->has($name);
  $selectValue = $errors->any() ? old($name, $value) : $value ?? "";
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

    <div @class(["relative flex-1", "has-icon" => $icon && !$readonly])>
      @if (!$readonly)
        <select
          id="{{ $id }}"
          name="{{ $name }}"
          data-placeholder="Select an option"
          {{ $attributes }}
          @required ($required)
          @disabled ($disabled)
          @class ([
            "js-searchable-select" => $searchable,
            "w-full px-3 py-2 text-base text-text transition-colors duration-200 appearance-none cursor-pointer",
            "pl-10" => $icon,
            "pr-10" => true,
            "rounded-md border-2 bg-background focus:outline-none",
            "border-danger-500 focus:border-danger-500" => $hasError,
            "border-border focus:border-primary-500" => !$hasError
          ])
        >
          <option value="">Select an option</option>

          @foreach ($options as $option)
            <option
              value="{{ $option['value'] }}"
              @selected ($option["value"] == $selectValue)
            >
              {{ $option["label"] }}
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