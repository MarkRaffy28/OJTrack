@php
  $dotName = str_replace(["[", "]"], [".", ""], $name);
  $dotName = rtrim($dotName, ".");
  $hasError = $errors->has($dotName);
  $inputValue = $errors->any() ? old($dotName, $value) : $value ?? "";
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
      <span data-required-marker @class (["text-danger-500", "hidden" => !$required])>
        *
      </span>
    </label>
  @endif

  <div @class (["flex items-center gap-2" => $icon && $readonly])>
    @if ($icon && $readonly)
      <span class="material-symbols-outlined text-text-subtle"> {{ $icon }} </span>
    @endif

    <div class="relative flex-1">
      <input
        id="{{ $id }}"
        name="{{ $name }}"
        type="{{ $secure ? 'password' : $type }}"
        value="{{ $inputValue }}"
        {{ $attributes }}
        @required ($required)
        @disabled ($disabled)
        @readonly ($readonly)
        @class ([
          "w-full px-3 py-2 text-base text-text transition-colors duration-200",
          "pl-10" => $icon && !$readonly,
          "pr-10" => $secure && !$readonly,
          "rounded-md border-2 bg-background focus:outline-none" => !$readonly,
          "border-danger-500 focus:border-danger-500" => $hasError && !$readonly,
          "border-border focus:border-primary-500" => !$hasError && !$readonly,
          "bg-background text-text-muted" => $readonly
        ])
      />

      @if ($icon && !$readonly)
        <span
          class="material-symbols-outlined text-text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        >
          {{ $icon }}
        </span>
      @endif

      @if ($secure && !$readonly)
        <button
          type="button"
          tabindex="-1"
          data-password-toggle
          class="text-text-subtle hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          <span class="material-symbols-outlined"> visibility </span>
        </button>
      @endif
    </div>
  </div>

  @error ($dotName)
    <p class="text-danger-500 mt-1 text-sm">{{ $message }}</p>
  @enderror
</div>
