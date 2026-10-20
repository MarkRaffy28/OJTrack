@php
  $role = auth()->user()->role->value;
  $renderedHours = $studentOjt->rendered_hours;
  $requiredHours = (float) $studentOjt->required_hours;
  $remainingHours = max($requiredHours - $renderedHours, 0);

  $statusClasses = match ($studentOjt->status?->value) {
    "active" => "bg-success-50 text-success-700",
    "pending" => "bg-warning-50 text-warning-700",
    "completed" => "bg-info-50 text-info-600",
    "terminated", "cancelled" => "bg-danger-50 text-danger-700",
    default => "bg-background text-text-muted",
  };

  $statusDot = match ($studentOjt->status?->value) {
    "active" => "bg-success-500",
    "pending" => "bg-warning-500",
    "completed" => "bg-info-500",
    "terminated", "cancelled" => "bg-danger-500",
    default => "bg-text-subtle",
  };
@endphp

@extends ("layouts.app")

@section ("title", "Student OJT Details")
@section ("header_title", "Student OJT Details")
@section ("header_description",
  "Placement details and attendance progress for " .
    ($studentOjt->student?->full_name ?? "the trainee") .
    ".")
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- HERO HEADER --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <x-avatar mode="view" size="md" :user="$studentOjt->student" />
          <div class="min-w-0">
            <h2 class="text-text truncate text-lg font-semibold">
              {{
                $studentOjt->student?->full_name ??
                  "Unknown student"
              }}
            </h2>
            <p class="text-text-muted truncate text-sm">
              {{
                $studentOjt->office?->name ??
                  "Unassigned office"
              }} · {{ $studentOjt->academic_year }} / {{ $studentOjt->term?->value }}
            </p>
          </div>
        </div>

        <span
          class="{{ $statusClasses }} inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        >
          <span class="{{ $statusDot }} h-1.5 w-1.5 rounded-full"></span>
          {{
            ucfirst(
              $studentOjt->status?->value ?? "unknown",
            )
          }}
        </span>
      </div>
    </div>

    {{-- STATS GRID --}}
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      @foreach ([
          [
            "Required Hours",
            number_format($requiredHours, 2) . " hrs",
            "Assigned OJT requirement",
            "schedule"
          ],
          [
            "Rendered Hours",
            number_format($renderedHours, 2) . " hrs",
            "Approved attendance",
            "history"
          ],
          [
            "Remaining Hours",
            number_format($remainingHours, 2) . " hrs",
            "To complete requirement",
            "hourglass_empty"
          ],
          [
            "Progress",
            number_format($studentOjt->progress_percent, 1) . "%",
            "Based on approved hours",
            "pie_chart"
          ]
        ]
        as [$label, $value, $description, $icon])
        <div class="border-border bg-surface rounded-2xl border p-5 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <p class="text-text-muted text-xs font-medium tracking-wider uppercase">{{ $label }}</p>
            <span
              class="material-symbols-outlined text-primary-600 text-lg"
              aria-hidden="true"
              >{{ $icon }}</span
            >
          </div>
          <p class="text-text mt-3 text-2xl font-bold tracking-tight">{{ $value }}</p>
          <p class="text-text-muted mt-1 text-xs">{{ $description }}</p>
        </div>
      @endforeach
    </div>

    {{-- DETAILS & PROGRESS --}}
    <div class="grid gap-6 lg:grid-cols-2">
      {{-- UNCHANGED SECTION --}}
      <div class="border-border bg-surface rounded-xl border p-6 shadow-sm">
        <h3 class="text-text-muted text-sm font-semibold tracking-wide uppercase">
          Placement Information
        </h3>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <x-fields.identity
            field="user_id"
            :user="$studentOjt->supervisor"
            mode="view"
          />
          <x-fields.office field="name" :office="$studentOjt->office" mode="view" />
          <x-fields.student-ojt
            field="start_date"
            :student-ojt="$studentOjt"
            mode="view"
          />
          <x-fields.student-ojt field="end_date" :student-ojt="$studentOjt" mode="view" />
        </dl>
      </div>

      {{-- COMPLETION PROGRESS CARD --}}
      <div class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
        <div
          class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
        >
          <span
            class="material-symbols-outlined material-symbols-md text-primary-600"
            aria-hidden="true"
            >donut_large</span
          >
          <h3 class="text-text text-sm font-semibold">Completion Progress</h3>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between text-sm">
            <span class="text-text-muted text-xs font-medium tracking-wider uppercase"
              >Overall Completion</span
            >
            <span class="text-primary-700 font-bold"
              >{{
                number_format(
                  $studentOjt->progress_percent,
                  1,
                )
              }}%</span
            >
          </div>
          <div class="bg-border mt-3 h-3 overflow-hidden rounded-full">
            <div
              class="bg-primary-600 h-full rounded-full transition-all duration-500"
              style="width: {{ $studentOjt->progress_percent }}%"
            ></div>
          </div>
          <p class="text-text-muted mt-4 text-sm">
            <strong class="text-text font-semibold">{{
              number_format(
                $renderedHours,
                2,
              )
            }}</strong>
            of {{ number_format($requiredHours, 2) }} required hours approved.
          </p>
          <p class="text-text-subtle mt-1 text-xs">
            {{ $studentOjt->attendances->count() }} attendance record(s) logged.
          </p>
        </div>
      </div>
    </div>
  </div>
@endsection
