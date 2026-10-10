@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Attendance Details")

@section ("header_title", "Attendance Details")

@section ("header_description", "Detailed view of student attendance record.")

@section ("header_actions")
  <div class="flex gap-2">
    <a
      href="{{ route("web.{$role}.attendance.edit", $attendance) }}"
      class="rounded-md bg-warning-600 px-4 py-2 text-sm font-medium text-white hover:bg-warning-700 transition-colors"
    >
      Edit
    </a>
    <a
      href="{{ route("web.{$role}.attendance.index") }}"
      class="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:bg-slate-100 transition-colors"
    >
      Back to List
    </a>
  </div>
@endsection

@section ("content")
  <div class="mx-auto max-w-4xl space-y-6">
    {{-- Main Detail Card --}}
    <div class="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
      <div class="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 class="text-lg font-bold text-text">
            {{ $attendance->student->full_name ?? 'Unknown Student' }}
          </h3>
          <p class="text-xs text-text-subtle">
            Date: {{ $attendance->date ? $attendance->date->format('F d, Y (l)') : 'N/A' }}
          </p>
        </div>

        <div>
          @php
            $isApproved = $attendance->is_fully_approved;
          @endphp
          <form method="POST" action="{{ route("web.{$role}.attendance.toggle", $attendance) }}">
            @csrf
            @method('PATCH')
            <button
              type="submit"
              @class([
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors shadow-xs",
                "bg-success-100 text-success-800 hover:bg-success-200 border border-success-300" => $isApproved,
                "bg-warning-100 text-warning-800 hover:bg-warning-200 border border-warning-300" => !$isApproved,
              ])
              title="Toggle all 4 session slots at once"
            >
              <span class="material-symbols-outlined text-base">
                {{ $isApproved ? 'task_alt' : 'motion_photos_paused' }}
              </span>
              <span>{{ $isApproved ? 'All Approved' : 'Toggle All 4' }}</span>
            </button>
          </form>
        </div>
      </div>

      {{-- Information Grid --}}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="rounded-lg bg-background p-4 border border-border">
          <span class="text-xs font-medium text-text-subtle uppercase tracking-wider block mb-1">Assigned Office</span>
          <span class="text-sm font-bold text-text">{{ $attendance->ojt->office->name ?? 'Unassigned' }}</span>
        </div>

        <div class="rounded-lg bg-background p-4 border border-border">
          <span class="text-xs font-medium text-text-subtle uppercase tracking-wider block mb-1">Supervisor</span>
          <span class="text-sm font-bold text-text">{{ $attendance->ojt->supervisor->full_name ?? 'Unassigned' }}</span>
        </div>

        <div class="rounded-lg bg-background p-4 border border-border">
          <span class="text-xs font-medium text-text-subtle uppercase tracking-wider block mb-1">Rendered Hours (Approved)</span>
          <span class="text-sm font-bold text-success-700 block">{{ number_format($attendance->approved_hours, 2) }} hrs</span>
          <span class="text-[11px] text-text-subtle block">Out of {{ number_format($attendance->total_hours, 2) }} total hrs logged</span>
        </div>

        <div class="rounded-lg bg-background p-4 border border-border">
          <span class="text-xs font-medium text-text-subtle uppercase tracking-wider block mb-2">Attendance Status</span>
          <div class="flex flex-wrap gap-1">
            @foreach ($attendance->attendance_statuses as $status)
              <span class="rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700">{{ ucfirst($status) }}</span>
            @endforeach
          </div>
        </div>
      </div>

      {{-- Time Tasks / Slots Detail --}}
      <div class="space-y-3">
        <h4 class="text-sm font-bold text-text">Time Tasks & Slot Verifications</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {{-- Morning --}}
          <div class="rounded-lg border border-border bg-background p-4 space-y-3">
            <h5 class="text-xs font-bold text-text uppercase tracking-wider">Morning Session</h5>

            <div class="flex items-center justify-between text-sm">
              <span class="text-text-subtle">Check In:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-text">
                  {{ $attendance->morning_in ? \Carbon\Carbon::parse($attendance->morning_in)->format('h:i A') : 'Not logged' }}
                </span>
                <form method="POST" action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'morning_in']) }}">
                  @csrf
                  @method('PATCH')
                  <button
                    type="submit"
                    @disabled(!$attendance->morning_in)
                    @class([
                      'text-xs px-2 py-0.5 rounded font-medium transition-colors',
                      'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' => !$attendance->morning_in,
                      'bg-success-100 text-success-800 hover:bg-success-200' => $attendance->morning_in && $attendance->morning_in_verified,
                      'bg-warning-100 text-warning-800 hover:bg-warning-200' => $attendance->morning_in && !$attendance->morning_in_verified,
                    ])
                  >
                    {{ $attendance->morning_in_verified ? 'Approved' : 'Unapproved' }}
                  </button>
                </form>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-text-subtle">Check Out:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-text">
                  {{ $attendance->morning_out ? \Carbon\Carbon::parse($attendance->morning_out)->format('h:i A') : 'Not logged' }}
                </span>
                <form method="POST" action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'morning_out']) }}">
                  @csrf
                  @method('PATCH')
                  <button
                    type="submit"
                    @disabled(!$attendance->morning_out)
                    @class([
                      'text-xs px-2 py-0.5 rounded font-medium transition-colors',
                      'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' => !$attendance->morning_out,
                      'bg-success-100 text-success-800 hover:bg-success-200' => $attendance->morning_out && $attendance->morning_out_verified,
                      'bg-warning-100 text-warning-800 hover:bg-warning-200' => $attendance->morning_out && !$attendance->morning_out_verified,
                    ])
                  >
                    {{ $attendance->morning_out_verified ? 'Approved' : 'Unapproved' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {{-- Afternoon --}}
          <div class="rounded-lg border border-border bg-background p-4 space-y-3">
            <h5 class="text-xs font-bold text-text uppercase tracking-wider">Afternoon Session</h5>

            <div class="flex items-center justify-between text-sm">
              <span class="text-text-subtle">Check In:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-text">
                  {{ $attendance->afternoon_in ? \Carbon\Carbon::parse($attendance->afternoon_in)->format('h:i A') : 'Not logged' }}
                </span>
                <form method="POST" action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'afternoon_in']) }}">
                  @csrf
                  @method('PATCH')
                  <button
                    type="submit"
                    @disabled(!$attendance->afternoon_in)
                    @class([
                      'text-xs px-2 py-0.5 rounded font-medium transition-colors',
                      'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' => !$attendance->afternoon_in,
                      'bg-success-100 text-success-800 hover:bg-success-200' => $attendance->afternoon_in && $attendance->afternoon_in_verified,
                      'bg-warning-100 text-warning-800 hover:bg-warning-200' => $attendance->afternoon_in && !$attendance->afternoon_in_verified,
                    ])
                  >
                    {{ $attendance->afternoon_in_verified ? 'Approved' : 'Unapproved' }}
                  </button>
                </form>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-text-subtle">Check Out:</span>
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-text">
                  {{ $attendance->afternoon_out ? \Carbon\Carbon::parse($attendance->afternoon_out)->format('h:i A') : 'Not logged' }}
                </span>
                <form method="POST" action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, 'afternoon_out']) }}">
                  @csrf
                  @method('PATCH')
                  <button
                    type="submit"
                    @disabled(!$attendance->afternoon_out)
                    @class([
                      'text-xs px-2 py-0.5 rounded font-medium transition-colors',
                      'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' => !$attendance->afternoon_out,
                      'bg-success-100 text-success-800 hover:bg-success-200' => $attendance->afternoon_out && $attendance->afternoon_out_verified,
                      'bg-warning-100 text-warning-800 hover:bg-warning-200' => $attendance->afternoon_out && !$attendance->afternoon_out_verified,
                    ])
                  >
                    {{ $attendance->afternoon_out_verified ? 'Approved' : 'Unapproved' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection
