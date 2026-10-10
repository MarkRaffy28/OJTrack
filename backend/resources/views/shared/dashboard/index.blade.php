@extends ("layouts.app")

@section ("title", "Dashboard")

@section ("content")
  @php
    $colorMap = [
      "primary" => ["bg" => "bg-primary-50", "border" => "border-primary-500/10", "icon" => "bg-primary-500", "text" => "text-primary-600"],
      "success" => ["bg" => "bg-success-50", "border" => "border-success-500/10", "icon" => "bg-success-500", "text" => "text-success-600"],
      "danger" => ["bg" => "bg-danger-50", "border" => "border-danger-500/10", "icon" => "bg-danger-500", "text" => "text-danger-600"],
      "warning" => ["bg" => "bg-warning-50", "border" => "border-warning-500/10", "icon" => "bg-warning-500", "text" => "text-warning-600"],
      "info" => ["bg" => "bg-info-50", "border" => "border-info-500/10", "icon" => "bg-info-500", "text" => "text-info-600"],
    ];
  @endphp

  <div class="space-y-4">
    {{-- Greeting header --}}
    <div class="flex flex-col justify-between gap-2 rounded-lg border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
      <div>
        <h1 class="text-lg font-bold text-text">
          Good {{ now()->hour < 12 ? "Morning" : (now()->hour < 18 ? "Afternoon" : "Evening") }},
          {{ auth()->user()->full_name ?: 'there' }}!
        </h1>
      </div>

      <div class="flex items-center gap-2 text-xs text-text-muted">
        <span class="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
          <span class="material-symbols-outlined text-sm text-primary-600">calendar_month</span>
          {{ now()->format("D, M j, Y") }}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
          <span class="material-symbols-outlined text-sm text-primary-600">schedule</span>
          {{ now()->format("g:i A") }}
        </span>
      </div>
    </div>

    {{-- Stat cards --}}
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      @foreach ($stats as $stat)
        @php $c = $colorMap[$stat["color"]] ?? $colorMap["primary"]; @endphp
        <a href="{{ route("web." . auth()->user()->role->value . "." . $stat['route']) }}" class="rounded-lg border {{ $c["border"] }} {{ $c["bg"] }} p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex h-8 w-8 items-center justify-center rounded-full {{ $c["icon"] }}">
            <span class="material-symbols-outlined text-base text-white">{{ $stat["icon"] }}</span>
          </div>

          <div class="mt-2 text-xs font-medium text-text-muted">{{ $stat["label"] }}</div>
          <div class="text-xl font-bold text-text">{{ $stat["value"] }}</div>

          <div class="mt-1 flex items-center gap-1 text-[11px]">
            <span
              @class ([
                "inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 font-semibold",
                "bg-success-100 text-success-700" => $stat["change"]["trend"] === "up",
                "bg-danger-100 text-danger-700" => $stat["change"]["trend"] === "down",
              ])
            >
              <span class="material-symbols-outlined text-xs">
                {{ $stat["change"]["trend"] === "up" ? "arrow_upward" : "arrow_downward" }}
              </span>
              {{ $stat["change"]["value"] }}
            </span>
            <span class="text-text-subtle">{{ $stat["note"] }}</span>
          </div>
        </a>
      @endforeach
    </div>

    {{-- Highlight cards --}}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <a href="{{ route("web." . auth()->user()->role->value . ".student-ojts.completed") }}" class="relative overflow-hidden rounded-lg border border-info-500/20 bg-info-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-info-500">
          <span class="material-symbols-outlined text-base text-white">schedule</span>
        </div>
        <div class="mt-2 text-xs font-medium text-text-muted">Student Completed OJT Hours</div>
        <div class="text-2xl font-bold text-text">{{ number_format($completedHours) }}</div>
        <span class="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-info-500/10">schedule</span>
      </a>

      <a href="{{ route("web." . auth()->user()->role->value . ".student-ojts.students-at-risk") }}" class="relative overflow-hidden rounded-lg border border-danger-500/20 bg-danger-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-danger-500">
          <span class="material-symbols-outlined text-base text-white">warning</span>
        </div>
        <div class="mt-2 text-xs font-medium text-text-muted">Student At Risk</div>
        <div class="text-2xl font-bold text-text">{{ $atRiskCount }}</div>
        <span class="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl text-danger-500/10">warning</span>
      </a>
    </div>

    {{-- Quick links + recent reports --}}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <a href="{{ route("web." . auth()->user()->role->value . ".offices.index") }}" class="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
          <span class="material-symbols-outlined text-base text-primary-700">business</span>
        </div>
        <div class="mt-2 text-sm font-semibold text-text">Offices</div>
        <div class="text-xl font-bold text-text">{{ $officesCount }}</div>
        <div class="text-[11px] text-text-subtle">Total number of offices</div>

        
          <span class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-1.5 group-hover:text-primary-700">
          View offices
          <span class="material-symbols-outlined text-sm transition-all">arrow_forward</span>
          </span>
      </a>

      <a href="{{ route("web." . auth()->user()->role->value . ".users.index", ['role' => 'supervisor']) }}" class="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
          <span class="material-symbols-outlined text-base text-primary-700">shield_person</span>
        </div>
        <div class="mt-2 text-sm font-semibold text-text">Supervisors</div>
        <div class="text-xl font-bold text-text">{{ $supervisorsCount }}</div>
        <div class="text-[11px] text-text-subtle">Total supervisors</div>
      </a>

      <a href="{{ route("web." . auth()->user()->role->value . ".users.index", ['role' => 'instructor']) }}" class="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-info-50">
          <span class="material-symbols-outlined text-base text-info-600">school</span>
        </div>
        <div class="mt-2 text-sm font-semibold text-text">Instructors</div>
        <div class="text-xl font-bold text-text">{{ $instructorsCount }}</div>
        <div class="text-[11px] text-text-subtle">Total instructors</div>
      </a>

      {{-- Recent reports --}}
      <a href="{{ route("web." . auth()->user()->role->value . ".reports.index") }}" class="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-text">Recent Reports</h3>
          <span class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:text-primary-700">
            View all
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>

        @if ($recentReports->isEmpty())
          <div class="flex flex-col items-center justify-center py-4 text-center">
            <span class="material-symbols-outlined text-xl text-text-subtle">description</span>
            <p class="mt-1 text-xs text-text-muted">No reports yet.</p>
          </div>
        @else
          <div class="divide-y divide-border-muted">
            @foreach ($recentReports as $report)
              <div class="flex items-center gap-2 py-1.5 first:pt-0 last:pb-0">
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-info-50">
                  <span class="material-symbols-outlined text-xs text-info-600">description</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-xs font-medium text-text">
                    {{ ucfirst($report->type->value) }} &mdash; {{ $report->student->name ?? "Unknown" }}
                  </div>
                </div>
                <div class="shrink-0 text-right text-[11px] text-text-subtle">
                  {{ $report->report_date->format("M j") }}
                </div>
                <span class="material-symbols-outlined text-sm text-primary-500" title="{{ count($report->document_paths ?? []) }} file(s)">
                  attach_file
                </span>
              </div>
            @endforeach
          </div>
        @endif
      </a>
    </div>
  </div>
@endsection
