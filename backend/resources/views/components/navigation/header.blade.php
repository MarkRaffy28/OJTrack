<div class="border-border-muted border-b">
  <div class="flex h-18 items-center justify-between px-3 py-1">
    @if ($dashboard)
      <!-- Dashboard Layout: Greetings + Name on Left -->
      <div>
        <h1 class="text-text text-2xl font-semibold">
          @php
            $hour = now()->hour;
            $greeting =
              $hour < 12 ? "Good morning" : ($hour < 18 ? "Good afternoon" : "Good evening");
          @endphp

          {{ $greeting }}, {{ auth()->user()->full_name ?? "User" }}!
        </h1>
        <p class="text-text-muted mt-1 text-sm">{{ $description }}</p>
      </div>

      <!-- Cohort Selector & Live Date/Time on Right -->
      <div class="flex items-center gap-3">
        @if ($showCohortSelector)
          <form
            method="POST"
            action="{{ route('web.cohort.select') }}"
            class="inline-block print:hidden"
          >
            @csrf
            <x-form.select
              name="cohort"
              :options="$cohortOptions"
              :value="$selectedCohortValue"
              placeholder="Select Cohort"
              :searchable="true"
              variant="filter"
              onchange="this.form.submit()"
            />
          </form>
        @endif

        <div
          id="live-datetime"
          class="text-text-muted border-border bg-primary-50 hidden items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium md:flex"
        >
          <span class="material-symbols-outlined material-symbols-xs">schedule</span>
          <span></span>
        </div>
      </div>

      <!-- jQuery Script for Live Date & Time -->
      <script>
        $(document).ready(function () {
          function updateDateTime() {
            const now = new Date();
            const options = {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            };
            $("#live-datetime span:last").text(now.toLocaleString("en-US", options));
          }
          updateDateTime();
          setInterval(updateDateTime, 1000);
        });
      </script>
    @else
      <!-- Standard Header Layout -->
      <div class="flex items-center gap-3">
        @if ($goBack)
          <a
            href="{{ url()->previous() }}"
            aria-label="Go back"
            class="text-text-muted border-border bg-surface hover:bg-primary-50 inline-flex items-center justify-center rounded-full border p-2 transition-colors print:hidden"
          >
            <span
              class="material-symbols-outlined material-symbols-md"
              aria-hidden="true"
            >
              arrow_back
            </span>
          </a>
        @endif

        <div>
          <h1 class="text-text text-2xl font-semibold">{{ $title }}</h1>

          @if ($description)
            <p class="text-text-muted mt-1 text-sm">{{ $description }}</p>
          @endif
        </div>
      </div>

      @if ($print || $createRoute || $editRoute || $showCohortSelector || isset($actions))
        <div class="flex items-center gap-2">
          @if ($showCohortSelector)
            <form
              method="POST"
              action="{{ route('web.cohort.select') }}"
              class="inline-block print:hidden"
            >
              @csrf
              <x-form.select
                name="cohort"
                :options="$cohortOptions"
                :value="$selectedCohortValue"
                placeholder="Select Cohort"
                :searchable="true"
                variant="filter"
                onchange="this.form.submit()"
              />
            </form>
          @endif

          @if ($print)
            <a
              href="{{ $printUrl }}"
              @if ($openPrintInNewTab) target="_blank" rel="noopener noreferrer" @endif
              class="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-md">print</span>
              Print
            </a>
          @endif

          @if ($createRoute)
            <a
              href="{{ $createRoute }}"
              class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-md">add</span>
              {{ $createButtonText }}
            </a>
          @endif

          @if ($editRoute)
            <a
              href="{{ $editRoute }}"
              class="bg-warning-500 hover:bg-warning-600 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-md">edit</span>
              {{ $editButtonText }}
            </a>
          @endif

          @if (isset($actions))
            {{ $actions }}
          @endif
        </div>
      @endif
    @endif
  </div>

  @if (isset($filters))
    <div class="px-3 pb-3 print:hidden">{{ $filters }}</div>
  @endif
</div>
