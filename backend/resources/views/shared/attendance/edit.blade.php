@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Edit Attendance")

@section ("header_title", "Edit Attendance")

@section ("header_description", "Update student OJT attendance record.")

@section ("header_actions")
  <a
    href="{{ route("web.{$role}.attendance.index") }}"
    class="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:bg-slate-100 transition-colors"
  >
    Back to List
  </a>
@endsection

@section ("content")
  <div class="mx-auto max-w-2xl">
    <div class="rounded-xl border border-border bg-surface p-6 shadow-xs">
      <form method="POST" action="{{ route("web.{$role}.attendance.update", $attendance) }}" class="space-y-6">
        @csrf
        @method('PUT')

        {{-- Student --}}
        <div>
          <label class="block text-sm font-medium text-text mb-1">Student <span class="text-danger-500">*</span></label>
          <select name="student_id" required class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select Student</option>
            @foreach ($students as $student)
              <option value="{{ $student->id }}" @selected(old('student_id', $attendance->student_id) == $student->id)>
                {{ $student->full_name }} ({{ $student->email }})
              </option>
            @endforeach
          </select>
          @error('student_id')
            <p class="mt-1 text-xs text-danger-600">{{ $message }}</p>
          @enderror
        </div>

        {{-- Student OJT --}}
        <div>
          <label class="block text-sm font-medium text-text mb-1">Student OJT Assignment <span class="text-danger-500">*</span></label>
          <select name="ojt_id" required class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select OJT Assignment</option>
            @foreach ($studentOjts as $ojt)
              <option value="{{ $ojt->id }}" @selected(old('ojt_id', $attendance->ojt_id) == $ojt->id)>
                {{ $ojt->student->full_name ?? 'Student' }} &mdash; {{ $ojt->office->name ?? 'Office' }} (Supervisor: {{ $ojt->supervisor->full_name ?? 'Unassigned' }})
              </option>
            @endforeach
          </select>
          @error('ojt_id')
            <p class="mt-1 text-xs text-danger-600">{{ $message }}</p>
          @enderror
        </div>

        {{-- Date --}}
        <div>
          <label class="block text-sm font-medium text-text mb-1">Date <span class="text-danger-500">*</span></label>
          <input
            type="date"
            name="date"
            value="{{ old('date', $attendance->date ? $attendance->date->format('Y-m-d') : '') }}"
            required
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p class="mt-1 text-xs text-text-subtle">Note: Attendance can only be recorded on weekdays (Mon–Fri).</p>
          @error('date')
            <p class="mt-1 text-xs text-danger-600">{{ $message }}</p>
          @enderror
        </div>

        @php
          $mIn = $attendance->morning_in ? \Carbon\Carbon::parse($attendance->morning_in)->format('H:i') : '';
          $mOut = $attendance->morning_out ? \Carbon\Carbon::parse($attendance->morning_out)->format('H:i') : '';
          $aIn = $attendance->afternoon_in ? \Carbon\Carbon::parse($attendance->afternoon_in)->format('H:i') : '';
          $aOut = $attendance->afternoon_out ? \Carbon\Carbon::parse($attendance->afternoon_out)->format('H:i') : '';
        @endphp

        {{-- Morning Session --}}
        <div class="rounded-lg border border-border bg-background p-4 space-y-4">
          <h4 class="text-xs font-bold text-text uppercase tracking-wider">Morning Session</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-text-subtle mb-1">Morning In</label>
              <input type="time" name="morning_in" value="{{ old('morning_in', $mIn) }}" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text" />
              <label class="mt-2 inline-flex items-center gap-2 text-xs text-text">
                <input type="checkbox" name="morning_in_verified" value="1" @checked(old('morning_in_verified', $attendance->morning_in_verified)) class="rounded border-border text-primary-600" />
                <span>Approved</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-subtle mb-1">Morning Out</label>
              <input type="time" name="morning_out" value="{{ old('morning_out', $mOut) }}" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text" />
              <label class="mt-2 inline-flex items-center gap-2 text-xs text-text">
                <input type="checkbox" name="morning_out_verified" value="1" @checked(old('morning_out_verified', $attendance->morning_out_verified)) class="rounded border-border text-primary-600" />
                <span>Approved</span>
              </label>
            </div>
          </div>
        </div>

        {{-- Afternoon Session --}}
        <div class="rounded-lg border border-border bg-background p-4 space-y-4">
          <h4 class="text-xs font-bold text-text uppercase tracking-wider">Afternoon Session</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-text-subtle mb-1">Afternoon In</label>
              <input type="time" name="afternoon_in" value="{{ old('afternoon_in', $aIn) }}" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text" />
              <label class="mt-2 inline-flex items-center gap-2 text-xs text-text">
                <input type="checkbox" name="afternoon_in_verified" value="1" @checked(old('afternoon_in_verified', $attendance->afternoon_in_verified)) class="rounded border-border text-primary-600" />
                <span>Approved</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-subtle mb-1">Afternoon Out</label>
              <input type="time" name="afternoon_out" value="{{ old('afternoon_out', $aOut) }}" class="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text" />
              <label class="mt-2 inline-flex items-center gap-2 text-xs text-text">
                <input type="checkbox" name="afternoon_out_verified" value="1" @checked(old('afternoon_out_verified', $attendance->afternoon_out_verified)) class="rounded border-border text-primary-600" />
                <span>Approved</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-border pt-4">
          <a
            href="{{ route("web.{$role}.attendance.index") }}"
            class="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:bg-slate-100"
          >
            Cancel
          </a>
          <button
            type="submit"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Update Attendance
          </button>
        </div>
      </form>
    </div>
  </div>
@endsection
