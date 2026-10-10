@php
  $clearParams = request()->except([
    $searchName,
    ...array_column($filters, "name"),
    $dateRangeName,
    "page",
    "print",
  ]);

  $clearUrl = url()->current();

  if (!empty($clearParams)) {
    $clearUrl .= "?" . http_build_query($clearParams);
  }
@endphp

<form
  method="GET"
  action="{{ url()->current() }}"
  data-filter-form
  class="flex w-full items-end gap-4"
>
  @foreach (request()->query() as $key => $value)
    @if (
      $key !== $searchName &&
      !in_array($key, array_column($filters, "name")) &&
      $key !== $dateRangeName &&
      !in_array($key, ["page", "print"])
    )
      @if (is_scalar($value))
        <input type="hidden" name="{{ $key }}" value="{{ $value }}" />
      @endif
    @endif
  @endforeach

  <!-- Search Section -->
  @if ($showSearch)
    <div class="flex-1">
      <input
        type="search"
        id="{{ $searchName }}"
        name="{{ $searchName }}"
        value="{{ $searchValue() }}"
        placeholder="{{ $searchPlaceholder }}"
        class="text-text border-border bg-background focus:border-primary-500 w-full rounded-md border-2 px-3 py-1.5 text-base transition-colors duration-200 focus:outline-none"
      />
    </div>
  @endif

  <!-- Filters Section -->
  @foreach ($filters as $filter)
    <div class="min-w-45">
      <x-form.select
        :id="$filter['name']"
        :name="$filter['name']"
        :options="$filter['options']"
        :value="$filterValue($filter['name'])"
        :searchable="array_key_exists('searchable', $filter)"
        :placeholder="'All ' . $filter['label']"
      />
    </div>
  @endforeach

  <!-- Date Range Picker Input -->
  @if ($showDateRange)
    <div wire:ignore class="relative">
      <input
        type="text"
        id="flatpickr-date-range-input"
        name="{{ $dateRangeName }}"
        value="{{ request($dateRangeName) }}"
        wire:model.live="{{ $dateRangeName }}"
        placeholder="Filter by date range..."
        class="text-text border-border bg-background focus:border-primary-500 w-72 cursor-pointer rounded-md border-2 px-3 py-1.5 text-base transition-colors duration-200 focus:outline-none"
        readonly
      />
    </div>

    <script>
      $(document).ready(function () {
        const inputEl = document.getElementById("flatpickr-date-range-input");

        if (inputEl && !inputEl._flatpickr) {
          flatpickr(inputEl, {
            mode: "range",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "F j, Y",
            delimiter: " to ",
            onOpen: function (selectedDates, dateStr, instance) {
              $(inputEl).addClass("border-primary-500");
            },
            onClose: function (selectedDates, dateStr, instance) {
              inputEl.dispatchEvent(new Event("input"));
              $(inputEl).removeClass("border-primary-500");
            },
          });
        }
      });
    </script>
  @endif

  <!-- Actions Section -->
  <div class="ml-auto flex shrink-0 items-center gap-2">
    <button
      type="submit"
      class="bg-primary-600 border-primary-600 hover:bg-primary-700 hover:border-primary-700 focus:ring-primary-500 inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95"
    >
      <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true"
        >filter_alt</span
      >
      {{ __("Apply") }}
    </button>
    <a
      href="{{ $clearUrl }}"
      class="text-text-muted border-border hover:text-text focus:ring-primary-500 inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-transparent px-4 text-sm font-medium transition-all duration-200 hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true"
        >close</span
      >
      {{ __("Clear") }}
    </a>
  </div>
</form>
