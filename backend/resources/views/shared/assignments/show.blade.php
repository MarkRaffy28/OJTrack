@php
  $role = auth()->user()->role->value;

  $statusClasses = match ($studentOjt->status->value) {
    "active" => "bg-success-50 text-success-700",
    "pending" => "bg-warning-50 text-warning-700",
    "completed" => "bg-info-50 text-info-600",
    "terminated", "cancelled" => "bg-danger-50 text-danger-700",
    default => "bg-background text-text-muted",
  };

  $statusDot = match ($studentOjt->status->value) {
    "active" => "bg-success-500",
    "pending" => "bg-warning-500",
    "completed" => "bg-info-500",
    "terminated", "cancelled" => "bg-danger-500",
    default => "bg-text-subtle",
  };
@endphp

@extends ("layouts.app")

@section ("title", "View Assignment")
@section ("header_title", "View Assignment")

@section ("header_actions")
  <a
    href="{{ route("web.{$role}.assignments.edit", $studentOjt) }}"
    class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-white"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
    Edit
  </a>

  <a
    href="{{ route("web.{$role}.assignments.index") }}"
    class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
    Back
  </a>
@endsection
@section ("content")
  <div class="mx-auto max-w-6xl space-y-6">
    {{-- Hero --}}
    <div class="bg-surface border-border rounded-xl border p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <x-avatar mode="view" size="md" :user="$studentOjt->student" />
          <div>
            <h2 class="text-text text-lg font-semibold">
              {{
                $studentOjt->student
                  ->full_name
              }}
            </h2>
            <p class="text-text-muted text-sm">
              {{
                $studentOjt->office
                  ->name
              }}
            </p>
          </div>
        </div>

        <span
          class="{{ $statusClasses }} inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        >
          <span class="{{ $statusDot }} h-1.5 w-1.5 rounded-full"></span>
          {{
            ucfirst(
              $studentOjt->status->value,
            )
          }}
        </span>
      </div>
    </div>

    {{-- Two-column layout --}}
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {{-- Left column --}}
      <div class="space-y-6">
        {{-- Student --}}
        <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
          <div
            class="border-border bg-background/60 flex items-center gap-2 border-b px-6 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="text-text-subtle h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
            <h3 class="text-text-muted text-xs font-semibold tracking-wide uppercase">
              Student
            </h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
            <x-fields.identity field="user_id" :user="$studentOjt->student" mode="view" />
            <x-fields.identity
              field="first_name"
              :user="$studentOjt->student"
              mode="view"
            />
            <x-fields.identity
              field="last_name"
              :user="$studentOjt->student"
              mode="view"
            />
            <x-fields.student-detail
              field="year"
              :user="$studentOjt->student"
              mode="view"
            />
            <x-fields.student-detail
              field="program"
              :user="$studentOjt->student"
              mode="view"
            />
            <x-fields.student-detail
              field="major"
              :user="$studentOjt->student"
              mode="view"
            />
            <x-fields.student-detail
              field="section"
              :user="$studentOjt->student"
              mode="view"
            />
          </div>
        </div>

        {{-- Office --}}
        <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
          <div
            class="border-border bg-background/60 flex items-center gap-2 border-b px-6 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="text-text-subtle h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="1" />
              <line x1="9" y1="8" x2="9" y2="8" />
              <line x1="15" y1="8" x2="15" y2="8" />
              <line x1="9" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="15" y2="16" />
            </svg>
            <h3 class="text-text-muted text-xs font-semibold tracking-wide uppercase">
              Office
            </h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
            <x-fields.office field="name" :office="$studentOjt->office" mode="view" />
            <x-fields.office field="address" :office="$studentOjt->office" mode="view" />
          </div>
        </div>
      </div>

      {{-- Right column --}}
      <div class="space-y-6">
        {{-- Supervisor --}}
        @if ($studentOjt->supervisor)
          <div
            class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm"
          >
            <div
              class="border-border bg-background/60 flex items-center gap-2 border-b px-6 py-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="text-text-subtle h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h3 class="text-text-muted text-xs font-semibold tracking-wide uppercase">
                Supervisor
              </h3>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
              <x-fields.identity
                field="user_id"
                :user="$studentOjt->supervisor"
                mode="view"
              />
              <x-fields.identity
                field="first_name"
                :user="$studentOjt->supervisor"
                mode="view"
              />
              <x-fields.identity
                field="last_name"
                :user="$studentOjt->supervisor"
                mode="view"
              />
              <x-fields.supervisor-detail
                field="office_id"
                :user="$studentOjt->supervisor"
                mode="view"
              />
              <x-fields.supervisor-detail
                field="position"
                :user="$studentOjt->supervisor"
                mode="view"
              />
            </div>
          </div>
        @endif

        {{-- Assignment --}}
        <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
          <div
            class="border-border bg-background/60 flex items-center gap-2 border-b px-6 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="text-text-subtle h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="15" y2="16" />
            </svg>
            <h3 class="text-text-muted text-xs font-semibold tracking-wide uppercase">
              Assignment
            </h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
            <x-fields.student-ojt
              field="academic_year"
              :student-ojt="$studentOjt"
              mode="view"
            />
            <x-fields.student-ojt field="term" :student-ojt="$studentOjt" mode="view" />
            <x-fields.student-ojt
              field="required_hours"
              :student-ojt="$studentOjt"
              mode="view"
            />
            <x-fields.student-ojt field="status" :student-ojt="$studentOjt" mode="view" />
            <x-fields.student-ojt
              field="start_date"
              :student-ojt="$studentOjt"
              mode="view"
            />
            <x-fields.student-ojt
              field="end_date"
              :student-ojt="$studentOjt"
              mode="view"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection
