@extends ("layouts.developer-console")

@section ("title", "Developer Console")

@section ("content")
  @php
    $consoleResult = session("console_result");
    $resultSuccess = session("console_result.success");
    $resultOutput = session("console_result.output");
    $resultClasses = $resultSuccess
      ? "border-success-500/40 bg-success-50 text-success-700"
      : "border-danger-500/40 bg-danger-50 text-danger-700";
    $resultIcon = $resultSuccess ? "check_circle" : "error";
    $logsRoute = collect([
      $currentRole . ".developer-console.logs.index",
      $currentRole . ".developer-console.logs",
    ])->first(fn($name) => Route::has($name));
  @endphp

  <div class="mb-6">
    <h1 class="text-text font-mono text-2xl font-semibold">
      <span class="text-primary-400">&gt;</span> Developer Console
    </h1>
    <p class="text-text-muted mt-1 text-sm">Run approved maintenance commands.</p>
  </div>

  @if ($consoleResult)
    <div class="mb-6 rounded-md border px-4 py-3 text-sm {{ $resultClasses }}">
      <strong class="inline-flex items-center gap-2 font-semibold">
        <span
          class="material-symbols-outlined material-symbols-md"
          aria-hidden="true"
          >{{ $resultIcon }}</span
        >
        {{
          $resultSuccess
            ? "Completed"
            : "Command returned an error"
        }}
      </strong>

      <pre
        class="border-border-muted bg-background text-text mt-3 overflow-x-auto rounded-md border p-3 font-mono text-xs [overflow-wrap:anywhere] whitespace-pre-wrap"
        >{{ $resultOutput }}</pre
      >
    </div>
  @endif

  @error ("console")
    <div
      class="border-danger-500/40 bg-danger-50 text-danger-700 mb-6 inline-flex w-full items-center gap-2 rounded-md border px-4 py-3 text-sm"
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
        >error</span
      >
      {{ $message }}
    </div>
  @enderror

  @error ("command")
    <div
      class="border-danger-500/40 bg-danger-50 text-danger-700 mb-6 inline-flex w-full items-center gap-2 rounded-md border px-4 py-3 text-sm"
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
        >error</span
      >
      {{ $message }}
    </div>
  @enderror

  <form
    method="POST"
    action="{{ route($currentRole . '.developer-console.run') }}"
    class="border-border border-t-primary-400 bg-surface/80 rounded-lg border border-t-2 p-5"
  >
    @csrf

    <label for="command" class="text-text-muted mb-2 block text-sm font-medium"
      >Select command</label
    >

    <div class="relative">
      <select
        name="command"
        id="command"
        required
        class="border-border bg-background text-text focus:border-primary-400 focus:ring-primary-400/40 w-full appearance-none rounded-md border py-2.5 pr-10 pl-3 font-mono text-sm transition focus:ring-2 focus:outline-none"
      >
        @foreach ($commands as $key => $command)
          <option value="{{ $key }}" class="bg-surface">{{ $command["label"] }}</option>
        @endforeach
      </select>

      <span
        class="material-symbols-outlined material-symbols-md text-text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        aria-hidden="true"
        >expand_more</span
      >
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="submit"
        class="border-primary-400/50 bg-primary-400/10 text-primary-400 hover:bg-primary-400/20 focus:ring-primary-400 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary-400)_40%,transparent)] focus:ring-2 focus:outline-none"
      >
        <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true"
          >play_arrow</span
        >
        Run command
      </button>

      @if ($logsRoute)
        <a
          href="{{ route($logsRoute) }}"
          class="border-border text-text-muted hover:border-primary-400/50 hover:text-primary-400 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition"
        >
          <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true"
            >receipt_long</span
          >
          View logs
        </a>
      @endif
    </div>
  </form>
@endsection
