@extends ("layouts.developer-console")

@section ("title", "Application Logs")

@section ("content")
  @php
    $role = request()->user()->role->value;
    $statusMessage = session("status");

    $levelStyles = [
      "emergency" => [
        "badge" => "border-danger-500/40 bg-danger-50 text-danger-700",
        "accent" => "border-l-danger-500",
      ],
      "alert" => [
        "badge" => "border-danger-500/40 bg-danger-50 text-danger-700",
        "accent" => "border-l-danger-500",
      ],
      "critical" => [
        "badge" => "border-danger-500/40 bg-danger-50 text-danger-700",
        "accent" => "border-l-danger-500",
      ],
      "error" => [
        "badge" => "border-danger-500/40 bg-danger-50 text-danger-700",
        "accent" => "border-l-danger-500",
      ],
      "warning" => [
        "badge" => "border-warning-500/40 bg-warning-50 text-warning-700",
        "accent" => "border-l-warning-500",
      ],
      "notice" => [
        "badge" => "border-warning-500/40 bg-warning-50 text-warning-700",
        "accent" => "border-l-warning-500",
      ],
      "info" => [
        "badge" => "border-info-500/40 bg-info-50 text-info-600",
        "accent" => "border-l-info-500",
      ],
    ];
    $defaultLevelStyle = [
      "badge" => "border-border bg-background text-text-muted",
      "accent" => "border-l-border",
    ];
  @endphp

  <div class="mb-6">
    <h1 class="text-text font-mono text-2xl font-semibold">
      <span class="text-primary-400">&gt;</span> Application Logs
    </h1>
    <p class="text-text-muted mt-1 text-sm">Latest entries from the Laravel log file.</p>
  </div>

  @if ($statusMessage)
    <div
      class="border-success-500/40 bg-success-50 text-success-700 mb-6 inline-flex w-full items-center gap-2 rounded-md border px-4 py-3 text-sm"
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
        >check_circle</span
      >
      {{ $statusMessage }}
    </div>
  @endif

  <form
    method="POST"
    action="{{ route($role . '.developer-console.logs.delete') }}"
    onsubmit="return confirm('Permanently clear the Laravel log file?');"
    class="border-border bg-surface/80 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
  >
    @csrf
    @method ("DELETE")

    <label class="text-text-muted inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name="confirm"
        value="1"
        required
        class="border-border bg-background accent-primary-400 size-4 rounded"
      />
      I confirm that I want to clear the log file.
    </label>

    <button
      type="submit"
      class="border-danger-500/50 bg-danger-50 text-danger-700 hover:border-danger-500 focus:ring-danger-500 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:shadow-[0_0_16px_color-mix(in_srgb,var(--color-danger-500)_40%,transparent)] focus:ring-2 focus:outline-none"
    >
      <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true"
        >delete_sweep</span
      >
      Clear Logs
    </button>
  </form>

  <div class="space-y-3">
    @forelse ($entries as $entry)
      @php
        $style = $levelStyles[strtolower($entry["level"])] ?? $defaultLevelStyle;
      @endphp

      <article
        class="rounded-lg border border-l-2 border-border bg-surface p-4 {{ $style['accent'] }}"
      >
        <div class="mb-2 flex flex-wrap items-center gap-3">
          <span
            class="rounded border px-2 py-0.5 font-mono text-xs font-semibold tracking-wide uppercase {{ $style['badge'] }}"
            >{{ $entry["level"] }}</span
          >
          <time class="text-text-subtle font-mono text-xs">{{ $entry["date"] }}</time>
        </div>

        <p class="text-text font-mono text-sm [overflow-wrap:anywhere] whitespace-pre-wrap">{{ $entry["message"] }}</p>

        @if (!empty($entry["stack_trace"]))
          <details class="mt-3">
            <summary
              class="text-primary-400 inline-flex cursor-pointer items-center gap-2 text-sm hover:underline"
            >
              <span
                class="material-symbols-outlined material-symbols-xs"
                aria-hidden="true"
                >data_object</span
              >
              View stack trace
            </summary>

            <pre
              class="border-border-muted bg-background text-text-muted mt-2 overflow-x-auto rounded-md border p-3 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap"
              >{{ $entry["stack_trace"] }}</pre
            >
          </details>
        @endif
      </article>
    @empty
      <div
        class="border-border text-text-subtle flex flex-col items-center gap-2 rounded-lg border border-dashed py-12"
      >
        <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
          >inbox</span
        >
        <p class="text-sm">No log entries found.</p>
      </div>
    @endforelse
  </div>
@endsection
