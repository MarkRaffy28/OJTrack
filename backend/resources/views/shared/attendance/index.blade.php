@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Attendance Logs")

@section ("header_title", "Attendance Logs")

@section ("header_description", "Manage OJT attendance records and time approvals.")

@section ("header_actions")
  <button
    type="button"
    onclick="window.print()"
    class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium print:hidden"
  >
    <span class="material-symbols-outlined text-base">print</span>
    Print
  </button>

  <a
    href="{{ route("web.{$role}.attendance.create") }}"
    class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 print:hidden"
  >
    Log Attendance
  </a>
@endsection

@section ("content")
  <div class="space-y-4">
    {{-- Filters --}}
    <div class="border-border bg-surface rounded-xl border p-4 shadow-xs print:hidden">
      <form
        method="GET"
        action="{{ route("web.{$role}.attendance.index") }}"
        class="flex flex-wrap items-center gap-4"
      >
        <div class="min-w-[200px]">
          <label class="text-text-subtle mb-1 block text-xs font-medium">Student</label>
          <select
            name="student_id"
            class="border-border bg-background text-text focus:ring-primary-500 w-full rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">All Students</option>
            @foreach ($students as $student)
              <option
                value="{{ $student->id }}"
                @selected (request("student_id") == $student->id)
              >
                {{ $student->full_name }}
              </option>
            @endforeach
          </select>
        </div>

        <div class="min-w-[160px]">
          <label class="text-text-subtle mb-1 block text-xs font-medium">Date</label>
          <input
            type="date"
            name="date"
            value="{{ request('date') }}"
            class="border-border bg-background text-text focus:ring-primary-500 w-full rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <div class="flex items-end gap-2 pt-5">
          <button
            type="submit"
            class="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors"
          >
            Filter
          </button>

          @if (request()->hasAny(["student_id", "date"]))
            <a
              href="{{ route("web.{$role}.attendance.index") }}"
              class="border-border bg-background text-text-muted rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-slate-100"
            >
              Reset
            </a>
          @endif
        </div>
      </form>
    </div>

    {{-- Info banner note --}}
    {{-- Info banner note --}}
    <x-alert type="info" class="print:hidden">
      <strong>Note:</strong> Attendance is permitted on weekdays (Mon–Fri). Rendered hours
      count <strong>only approved</strong> morning and afternoon sessions. Toggle each of
      the <strong>4 session slots</strong> individually, or use
      <strong>Toggle All 4</strong> to approve/unapprove all at once.
    </x-alert>

    {{-- Print-only header --}}
    <div class="hidden print:mb-4 print:block">
      <h1 class="text-lg font-bold">Attendance Logs</h1>
      <p class="text-text-subtle text-xs">
        Generated {{ now()->format("M d, Y g:i A") }}
        @if (request("date")) &middot; Date:{{ request("date") }} @endif
        @if (request("student_id"))
          &middot; Student: {{
            optional(
              $students->firstWhere("id", request("student_id")),
            )->full_name
          }}
        @endif
      </p>
    </div>

    {{-- Attendance Table --}}
    <x-table
      :headers="[
        'Student Name',
        'Date',
        'Time Sessions (4 Total)',
        'Assigned Office',
        'Supervisor',
        'Rendered Hours',
        'Status',
        'Toggle All 4',
        'Actions',
      ]"
    >
      @forelse ($attendances as $attendance)
        <x-table.row>
          {{-- Student Name --}}
          <x-table.cell>
            <div class="text-text font-medium">
              {{
                $attendance->student->full_name ??
                  "Unknown Student"
              }}
            </div>
            <div class="text-text-subtle text-xs">
              {{
                $attendance->student->email ??
                  ""
              }}
            </div>
          </x-table.cell>

          {{-- Date --}}
          <x-table.cell>
            <div class="text-text font-medium whitespace-nowrap">
              {{
                $attendance->date
                  ? $attendance->date->format("M d, Y")
                  : "N/A"
              }}
            </div>
            <div class="text-text-subtle text-[11px]">
              {{
                $attendance->date
                  ? $attendance->date->format("l")
                  : ""
              }}
            </div>
          </x-table.cell>

          {{-- Time Sessions (4 slots, single row inline) --}}
          <x-table.cell>
            <div class="flex items-center gap-1.5 text-xs whitespace-nowrap">
              <span class="text-text-subtle font-semibold">AM:</span>
              <form
                method="POST"
                action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'morning_in']) }}"
                class="inline print:hidden"
              >
                @csrf
                @method ("PATCH")
                <button
                  type="submit"
                  @disabled (!$attendance->morning_in)
                  title="{{ $attendance->morning_in ? 'Toggle Morning In approval' : 'No time logged for Morning In' }}"
                  @class ([
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                    "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400" => !$attendance->morning_in,
                    "bg-success-100 text-success-800 hover:bg-success-200" =>
                      $attendance->morning_in && $attendance->morning_in_verified,
                    "bg-warning-100 text-warning-800 hover:bg-warning-200" =>
                      $attendance->morning_in && !$attendance->morning_in_verified
                  ])
                >
                  In: {{
                    $attendance->morning_in
                      ? \Carbon\Carbon::parse($attendance->morning_in)->format("g:i A")
                      : "--:--"
                  }}
                  <span class="material-symbols-outlined text-[12px]">{{
                    $attendance->morning_in_verified
                      ? "check_circle"
                      : "pending"
                  }}</span>
                </button>
              </form>
              <form
                method="POST"
                action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'morning_out']) }}"
                class="inline print:hidden"
              >
                @csrf
                @method ("PATCH")
                <button
                  type="submit"
                  @disabled (!$attendance->morning_out)
                  title="{{ $attendance->morning_out ? 'Toggle Morning Out approval' : 'No time logged for Morning Out' }}"
                  @class ([
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                    "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400" => !$attendance->morning_out,
                    "bg-success-100 text-success-800 hover:bg-success-200" =>
                      $attendance->morning_out && $attendance->morning_out_verified,
                    "bg-warning-100 text-warning-800 hover:bg-warning-200" =>
                      $attendance->morning_out && !$attendance->morning_out_verified
                  ])
                >
                  Out: {{
                    $attendance->morning_out
                      ? \Carbon\Carbon::parse($attendance->morning_out)->format("g:i A")
                      : "--:--"
                  }}
                  <span class="material-symbols-outlined text-[12px]">{{
                    $attendance->morning_out_verified
                      ? "check_circle"
                      : "pending"
                  }}</span>
                </button>
              </form>

              {{-- Print-only plain text version of AM sessions --}}
              <span class="hidden print:inline">
                {{
                  $attendance->morning_in
                    ? \Carbon\Carbon::parse($attendance->morning_in)->format("g:i A")
                    : "--:--"
                }} &ndash; {{
                  $attendance->morning_out
                    ? \Carbon\Carbon::parse($attendance->morning_out)->format("g:i A")
                    : "--:--"
                }}
              </span>

              <span class="text-border px-0.5">|</span>

              <span class="text-text-subtle font-semibold">PM:</span>
              <form
                method="POST"
                action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'afternoon_in']) }}"
                class="inline print:hidden"
              >
                @csrf
                @method ("PATCH")
                <button
                  type="submit"
                  @disabled (!$attendance->afternoon_in)
                  title="{{ $attendance->afternoon_in ? 'Toggle Afternoon In approval' : 'No time logged for Afternoon In' }}"
                  @class ([
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                    "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400" => !$attendance->afternoon_in,
                    "bg-success-100 text-success-800 hover:bg-success-200" =>
                      $attendance->afternoon_in && $attendance->afternoon_in_verified,
                    "bg-warning-100 text-warning-800 hover:bg-warning-200" =>
                      $attendance->afternoon_in && !$attendance->afternoon_in_verified
                  ])
                >
                  In: {{
                    $attendance->afternoon_in
                      ? \Carbon\Carbon::parse($attendance->afternoon_in)->format("g:i A")
                      : "--:--"
                  }}
                  <span class="material-symbols-outlined text-[12px]">{{
                    $attendance->afternoon_in_verified
                      ? "check_circle"
                      : "pending"
                  }}</span>
                </button>
              </form>
              <form
                method="POST"
                action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'afternoon_out']) }}"
                class="inline print:hidden"
              >
                @csrf
                @method ("PATCH")
                <button
                  type="submit"
                  @disabled (!$attendance->afternoon_out)
                  title="{{ $attendance->afternoon_out ? 'Toggle Afternoon Out approval' : 'No time logged for Afternoon Out' }}"
                  @class ([
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                    "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400" => !$attendance->afternoon_out,
                    "bg-success-100 text-success-800 hover:bg-success-200" =>
                      $attendance->afternoon_out && $attendance->afternoon_out_verified,
                    "bg-warning-100 text-warning-800 hover:bg-warning-200" =>
                      $attendance->afternoon_out && !$attendance->afternoon_out_verified
                  ])
                >
                  Out: {{
                    $attendance->afternoon_out
                      ? \Carbon\Carbon::parse($attendance->afternoon_out)->format("g:i A")
                      : "--:--"
                  }}
                  <span class="material-symbols-outlined text-[12px]">{{
                    $attendance->afternoon_out_verified
                      ? "check_circle"
                      : "pending"
                  }}</span>
                </button>
              </form>

              {{-- Print-only plain text version of PM sessions --}}
              <span class="hidden print:inline">
                {{
                  $attendance->afternoon_in
                    ? \Carbon\Carbon::parse($attendance->afternoon_in)->format("g:i A")
                    : "--:--"
                }} &ndash; {{
                  $attendance->afternoon_out
                    ? \Carbon\Carbon::parse($attendance->afternoon_out)->format("g:i A")
                    : "--:--"
                }}
              </span>
            </div>
          </x-table.cell>

          {{-- Assigned Office --}}
          <x-table.cell>
            <div class="text-text font-medium">
              {{
                $attendance->ojt->office->name ??
                  "Unassigned"
              }}
            </div>
          </x-table.cell>

          {{-- Supervisor --}}
          <x-table.cell>
            <div class="text-text font-medium">
              {{
                $attendance->ojt->supervisor->full_name ??
                  "Unassigned"
              }}
            </div>
          </x-table.cell>

          {{-- Rendered Hours --}}
          <x-table.cell>
            <div class="whitespace-nowrap">
              <span class="text-success-700 text-sm font-bold">
                {{
                  number_format(
                    $attendance->approved_hours,
                    1,
                  )
                }} hrs
              </span>
              @if ($attendance->total_hours > $attendance->approved_hours)
                <div class="text-text-subtle text-[11px]">
                  ({{
                    number_format(
                      $attendance->total_hours,
                      1,
                    )
                  }} hrs logged)
                </div>
              @endif
            </div>
          </x-table.cell>

          {{-- Attendance Status --}}
          <x-table.cell>
            <div class="flex max-w-36 flex-wrap gap-1">
              @foreach ($attendance->attendance_statuses as $status)
                <span @class([
                  'inline-flex rounded-full px-2 py-1 text-[11px] font-semibold',
                  'bg-success-50 text-success-700' => $status === 'present',
                  'bg-danger-50 text-danger-700' => $status === 'absent',
                  'bg-warning-50 text-warning-700' => in_array($status, ['late', 'early out']),
                  'bg-info-50 text-info-600' => $status === 'incomplete',
                ])>{{ ucfirst($status) }}</span>
              @endforeach
            </div>
          </x-table.cell>

          {{-- Toggle All 4 --}}
          <x-table.cell class="print:hidden">
            @php
              $isApproved = $attendance->is_fully_approved;
            @endphp
            <form
              method="POST"
              action="{{ route("web.{$role}.attendance.toggle", $attendance) }}"
            >
              @csrf
              @method ("PATCH")
              <button
                type="submit"
                class="bg-primary-50 text-primary-700 hover:bg-primary-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
                title="Toggle all 4 session slots at once"
              >
                {{
                  $isApproved
                    ? "All Approved"
                    : "Toggle All 4"
                }}
              </button>
            </form>
          </x-table.cell>

          {{-- Actions --}}
          <x-table.cell class="print:hidden">
            <div class="flex items-center gap-2">
              <a
                href="{{ route("web.{$role}.attendance.show", $attendance) }}"
                class="bg-success-50 text-success-700 hover:bg-success-500 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:text-white"
              >
                View
              </a>

              <a
                href="{{ route("web.{$role}.attendance.edit", $attendance) }}"
                class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:text-white"
              >
                Edit
              </a>

              <form
                method="POST"
                action="{{ route("web.{$role}.attendance.destroy", $attendance) }}"
                class="inline-flex"
              >
                @csrf
                @method ("DELETE")

                <x-u-i.delete-dialog
                  item="attendance record"
                  title="Delete Attendance"
                  class="bg-danger-50 text-danger-700 hover:bg-danger-500 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:text-white"
                />
              </form>
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No attendance records found." :colspan="9" />
      @endforelse
    </x-table>

    <div class="print:hidden">
      <x-pagination :paginator="$attendances" />
    </div>
  </div>
@endsection

@push ("styles")
  <style>
    @media print {
      body * {
        visibility: hidden;
      }
      main,
      main * {
        visibility: visible;
      }
      main {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
  </style>
@endpush
