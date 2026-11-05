<div class="border-border-muted bg-surface border-b">
  <div
    class="flex min-h-18 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2"
  >
    @if ($dashboard)
      <!-- Dashboard Layout: Greetings + Name on Left -->
      <div class="flex min-w-0 flex-1 basis-64 items-center gap-3">
        <button
          type="button"
          data-sidebar-toggle
          aria-label="Open menu"
          aria-controls="app-sidebar"
          aria-expanded="false"
          class="text-text-muted border-border bg-surface hover:bg-primary-50 hover:border-primary-100 hover:text-primary-700 focus-visible:ring-primary-500 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden print:hidden"
        >
          <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">
            menu
          </span>
        </button>

        <div class="min-w-0">
          <h1
            class="text-text text-xl leading-tight font-semibold tracking-tight sm:text-2xl"
          >
            @php
              $hour = now()->hour;
              $greeting =
                $hour < 12 ? "Good morning" : ($hour < 18 ? "Good afternoon" : "Good evening");
            @endphp

            {{ $greeting }}, {{ auth()->user()->full_name ?? "User" }}!
          </h1>
          <p class="text-text-muted mt-0.5 line-clamp-2 text-sm leading-snug">
            {{ $description }}
          </p>
        </div>
      </div>

      <!-- Cohort Selector & Live Date/Time on Right -->
      <div class="flex items-center gap-3 max-sm:w-full">
        @if ($showCohortSelector)
          <x-form.form
            method="POST"
            action="{{ route('cohort.select') }}"
            class="inline-block max-sm:flex-1 print:hidden"
          >
            <x-form.select
              name="cohort"
              :options="$cohortOptions"
              :value="$selectedCohortValue"
              placeholder="Select Cohort"
              :searchable="true"
              variant="filter"
              onchange="this.form.submit()"
            />
          </x-form.form>
        @endif

        <div
          id="live-datetime"
          class="text-primary-700 border-primary-100 bg-primary-50 hidden h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium md:flex"
        >
          <span class="material-symbols-outlined material-symbols-xs text-primary-600" aria-hidden="true">
            schedule
          </span>
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
      <div class="flex min-w-0 flex-1 basis-64 items-center gap-3">
        <button
          type="button"
          data-sidebar-toggle
          aria-label="Open menu"
          aria-controls="app-sidebar"
          aria-expanded="false"
          class="text-text-muted border-border bg-surface hover:bg-primary-50 hover:border-primary-100 hover:text-primary-700 focus-visible:ring-primary-500 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden print:hidden"
        >
          <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">
            menu
          </span>
        </button>

        @if ($goBack)
          <a
            href="{{ url()->previous() }}"
            aria-label="Go back"
            class="text-text-muted border-border bg-surface hover:bg-primary-50 hover:border-primary-100 hover:text-primary-700 focus-visible:ring-primary-500 inline-flex shrink-0 items-center justify-center rounded-full border p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none print:hidden"
          >
            <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">
              arrow_back
            </span>
          </a>
        @endif

        <div class="min-w-0">
          <h1
            class="text-text truncate text-xl leading-tight font-semibold tracking-tight sm:text-2xl"
          >
            {{ $title }}
          </h1>

          @if ($description)
            <p class="text-text-muted mt-0.5 line-clamp-2 text-sm leading-snug">
              {{ $description }}
            </p>
          @endif
        </div>
      </div>

      @if ($print || $createRoute || $editRoute || $showCohortSelector || isset($actions))
        <div class="flex flex-wrap items-center gap-2 max-sm:w-full">
          @if ($showCohortSelector)
            <form
              method="POST"
              action="{{ route('cohort.select') }}"
              class="inline-block max-sm:w-full print:hidden"
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
              class="text-text border-border bg-surface hover:bg-primary-50 hover:border-primary-100 focus-visible:ring-primary-500 inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true">
                print
              </span>
              Print
            </a>
          @endif

          @if ($createRoute)
            <a
              href="{{ $createRoute }}"
              class="bg-primary-600 border-primary-600 hover:bg-primary-700 hover:border-primary-700 focus-visible:ring-primary-500 inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true">
                add
              </span>
              {{ $createButtonText }}
            </a>
          @endif

          @if ($editRoute)
            <a
              href="{{ $editRoute }}"
              class="bg-warning-50 text-warning-700 border-warning-500/30 hover:bg-warning-500 hover:text-white focus-visible:ring-warning-500 inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none print:hidden"
            >
              <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true">
                edit
              </span>
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
    <div
      class="max-w-full min-w-0 px-3 pb-3 print:hidden [&_form]:flex-wrap [&_form]:gap-2"
    >
      {{ $filters }}
    </div>
  @endif
</div>
