@php
  $role = auth()->user()->role->value;
  $identityField = \App\Enums\Fields\IdentityField::class;
  $dateValue = $attendance->date?->format('Y-m-d');
  $isApproved = $attendance->is_fully_approved;
@endphp

@extends ("layouts.app")

@section ("title", "Attendance Details")
@section ("header_title", "Attendance Details")
@section ("header_description", "Detailed view of student attendance record.")
@section ("header_edit_route", route("web.{$role}.attendance.edit", $attendance))
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <div class="space-y-6">
      {{-- HERO HEADER --}}
      <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <div class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">event_available</span>
            </div>
            <div class="min-w-0">
              <h2 class="text-text truncate text-lg font-semibold">Attendance Details</h2>
              <p class="text-text-muted truncate text-sm">{{ $attendance->student?->full_name ?? "Unknown Student" }} · {{ $attendance->date?->format("F j, Y") ?? "No date set" }}</p>
            </div>
          </div>

          <form method="POST" action="{{ route("web.{$role}.attendance.toggle", $attendance) }}">
            @csrf
            @method ("PATCH")
            <button type="submit" @class([
              "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "bg-success-100 text-success-800 hover:bg-success-200" => $isApproved,
              "bg-warning-100 text-warning-800 hover:bg-warning-200" => !$isApproved,
            ])>
              <span class="material-symbols-outlined text-base">{{ $isApproved ? "task_alt" : "motion_photos_paused" }}</span>
              {{ $isApproved ? "All Approved" : "Approve All" }}
            </button>
          </form>
        </div>
      </div>

      {{-- TWO-COLUMN LAYOUT --}}
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {{-- LEFT COLUMN --}}
        <div class="space-y-6">
          {{-- RECORD DETAILS --}}
          <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
            <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
              <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">event</span>
              <h2 class="text-text text-sm font-semibold">Student & Assignment</h2>
            </div>
            <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <x-fields.identity :field="$identityField::FULL_NAME" :user="$attendance->student" label="Student" mode="view" />
              <x-fields.office field="name" :office="$attendance->ojt?->office" label="Office" mode="view" />
              <x-fields.identity :field="$identityField::FULL_NAME" :user="$attendance->ojt?->supervisor" label="Supervisor" field-id="attendance_supervisor" mode="view" />
              <x-fields.identity :field="$identityField::FULL_NAME" :user="$attendance->ojt?->instructor" label="Instructor" field-id="attendance_instructor" mode="view" />
              <x-fields.attendance field="date" :value="$dateValue" mode="view" />
            </div>
          </section>

          {{-- ATTENDANCE SUMMARY --}}
          <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
            <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
              <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">summarize</span>
              <h2 class="text-text text-sm font-semibold">Attendance Summary</h2>
            </div>
            <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <div><span class="text-text-muted block text-xs font-medium tracking-wider uppercase">Rendered Hours (Approved)</span><p class="text-success-700 mt-1 text-2xl font-bold">{{ number_format($attendance->approved_hours, 2) }} hrs</p></div>
              <div><span class="text-text-muted block text-xs font-medium tracking-wider uppercase">Total Hours</span><p class="text-text mt-1 text-2xl font-bold">{{ number_format($attendance->total_hours, 2) }} hrs</p></div>
              <div class="sm:col-span-2"><span class="text-text-muted mb-2 block text-xs font-medium tracking-wider uppercase">Status</span><div class="flex flex-wrap gap-1">@foreach ($attendance->attendance_statuses as $status)<span class="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700">{{ ucfirst($status) }}</span>@endforeach</div></div>
            </div>
          </section>
        </div>

        {{-- RIGHT COLUMN --}}
        <div class="space-y-6">
          @foreach ([
            ["Morning Session", "wb_sunny", "morning_in", "morning_out"],
            ["Afternoon Session", "wb_twilight", "afternoon_in", "afternoon_out"],
          ] as [$sessionTitle, $icon, $inField, $outField])
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">{{ $icon }}</span>
                <h2 class="text-text text-sm font-semibold">{{ $sessionTitle }}</h2>
              </div>
              <div class="space-y-4 p-5">
                @foreach ([[$inField, "Check In"], [$outField, "Check Out"]] as [$field, $label])
                  @php($time = $attendance->{$field})
                  <div class="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                    <div><p class="text-text-muted text-xs font-medium tracking-wider uppercase">{{ $label }}</p><p class="text-text mt-1 font-mono text-sm font-semibold">{{ $time ? \Carbon\Carbon::parse($time)->format("h:i A") : "Not logged" }}</p></div>
                    <form method="POST" action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, $field]) }}">
                      @csrf
                      @method ("PATCH")
                      <button type="submit" @disabled(!$time) @class([
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        "cursor-not-allowed bg-slate-100 text-slate-400" => !$time,
                        "bg-success-100 text-success-800 hover:bg-success-200" => $time && $attendance->{$field . "_verified"},
                        "bg-warning-100 text-warning-800 hover:bg-warning-200" => $time && !$attendance->{$field . "_verified"},
                      ])>{{ $attendance->{$field . "_verified"} ? "Approved" : "Unapproved" }}</button>
                    </form>
                  </div>
                @endforeach
              </div>
            </section>
          @endforeach
        </div>
      </div>
    </div>
  </div>
@endsection
