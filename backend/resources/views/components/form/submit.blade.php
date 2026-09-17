<button
  type="submit"
  {{
    $attributes->merge([
      "class" =>
        "inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60",
    ])
  }}
  data-submit-button
  data-loading-text="{{ $loadingText }}"
>
  <span data-submit-spinner class="material-symbols-outlined !hidden animate-spin">
    progress_activity
  </span>

  <span data-submit-text> {{ $text }} </span>
</button>
