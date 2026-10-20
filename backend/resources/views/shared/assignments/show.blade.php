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
@section ("header_edit_route", route("web.{$role}.assignments.edit", $studentOjt))
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
                $studentOjt->student
                  ->full_name
              }}
            </h2>
            <p class="text-text-muted truncate text-sm">
              {{
                $studentOjt->office
                  ->name
              }}
            </p>
          </div>
        </div>

        <span
          class="{{ $statusClasses }} inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
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

    {{-- TWO-COLUMN LAYOUT --}}
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {{-- LEFT COLUMN --}}
      <div class="space-y-6">
        {{-- STUDENT INFORMATION --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >person</span
            >
            <h3 class="text-text text-sm font-semibold">Student Information</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <x-fields.identity
                field="user_id"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.identity
                field="first_name"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.identity
                field="last_name"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-detail
                field="program"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-detail
                field="major"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-detail
                field="year"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-detail
                field="section"
                :user="$studentOjt->student"
                mode="view"
              />
            </div>
          </div>
        </section>

        {{-- OFFICE DETAILS --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >business</span
            >
            <h3 class="text-text text-sm font-semibold">Office Details</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <x-fields.office field="name" :office="$studentOjt->office" mode="view" />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <x-fields.office
                field="address"
                :office="$studentOjt->office"
                mode="view"
              />
            </div>
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- SUPERVISOR DETAILS --}}
        @if ($studentOjt->supervisor)
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >badge</span
              >
              <h3 class="text-text text-sm font-semibold">Supervisor Details</h3>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0 sm:col-span-2">
                <x-fields.identity
                  field="user_id"
                  :user="$studentOjt->supervisor"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.identity
                  field="first_name"
                  :user="$studentOjt->supervisor"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.identity
                  field="last_name"
                  :user="$studentOjt->supervisor"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.supervisor-detail
                  field="office_id"
                  :user="$studentOjt->supervisor"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.supervisor-detail
                  field="position"
                  :user="$studentOjt->supervisor"
                  mode="view"
                />
              </div>
            </div>
          </section>
        @endif

        {{-- ASSIGNMENT DETAILS --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >assignment</span
            >
            <h3 class="text-text text-sm font-semibold">Assignment Details</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <x-fields.student-ojt
                field="academic_year"
                :student-ojt="$studentOjt"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-ojt field="term" :student-ojt="$studentOjt" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.student-ojt
                field="required_hours"
                :student-ojt="$studentOjt"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-ojt
                field="status"
                :student-ojt="$studentOjt"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-ojt
                field="start_date"
                :student-ojt="$studentOjt"
                mode="view"
              />
            </div>
            <div class="min-w-0">
              <x-fields.student-ojt
                field="end_date"
                :student-ojt="$studentOjt"
                mode="view"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
@endsection
