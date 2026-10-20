@php
  $role = auth()->user()->role->value;
  $attendance = $attendance ?? null;
  $isCreate = isset($studentOjts);
  $identityField = \App\Enums\Fields\IdentityField::class;
  $selectedOjt = $isCreate
    ? $studentOjts->firstWhere('student_id', old('student_id', $studentOjts->first()?->student_id))
    : $attendance?->ojt;
  $studentAssignments = $isCreate
    ? $studentOjts->mapWithKeys(function ($item) {
      return [$item->student_id => [
        'ojt_id' => $item->id,
        'office' => $item->office?->name ?? 'Unassigned',
        'supervisor' => $item->supervisor?->full_name ?? 'Unassigned',
        'instructor' => $item->instructor?->full_name ?? 'Unassigned',
      ]];
    })->all()
    : [];
  $action = $isCreate
    ? route("web.{$role}.attendance.store")
    : route("web.{$role}.attendance.update", $attendance);
  $mIn = $attendance?->morning_in
    ? \Carbon\Carbon::parse($attendance?->morning_in)->format("H:i")
    : "";
  $mOut = $attendance?->morning_out
    ? \Carbon\Carbon::parse($attendance?->morning_out)->format("H:i")
    : "";
  $aIn = $attendance?->afternoon_in
    ? \Carbon\Carbon::parse($attendance?->afternoon_in)->format("H:i")
    : "";
  $aOut = $attendance?->afternoon_out
    ? \Carbon\Carbon::parse($attendance?->afternoon_out)->format("H:i")
    : "";
@endphp

@extends ("layouts.app")

@section ("title", $isCreate ? "Log Attendance" : "Edit Attendance")

@section ("header_title", $isCreate ? "Log Attendance" : "Edit Attendance")

@section ("header_go_back", "")

@section ("header_description")
  {{ $isCreate ? "Manually record" : "Update" }} student OJT attendance record.
@endsection

@if ($isCreate)
  @push ("scripts")
    <script>
      $(function () {
        const assignments = @json($studentAssignments);
        const $student = $('#student_id');
        const $ojt = $('#ojt_id');
        const $office = $('#name');
        const $supervisor = $('#attendance_supervisor');
        const $instructor = $('#attendance_instructor');

        function updateAssignmentFields() {
          const assignment = assignments[$student.val()] ?? {};
          $ojt.val(assignment.ojt_id ?? '');
          $office.val(assignment.office ?? 'Unassigned');
          $supervisor.val(assignment.supervisor ?? 'Unassigned');
          $instructor.val(assignment.instructor ?? 'Unassigned');
        }

        $student.on('change', updateAssignmentFields);
        updateAssignmentFields();
      });
    </script>
  @endpush
@endif

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <form
      method="POST"
      action="{{ $action }}"
    >
      @csrf
      @if (!$isCreate)
        @method ("PUT")
      @endif

      <div class="space-y-6">
        {{-- HERO HEADER --}}
        <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            >
              <span
                class="material-symbols-outlined material-symbols-md"
                aria-hidden="true"
                >edit_calendar</span
              >
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-text truncate text-lg font-semibold">
                {{
                  $attendance?->student?->full_name ??
                    ($isCreate ? "Manual Attendance Entry" : "Attendance Record")
                }}
              </h2>
              <p class="text-text-muted truncate text-sm">
                {{
                  $attendance?->date
                    ? $attendance->date->format("F j, Y")
                    : "No date set"
                }}
              </p>
            </div>
          </div>
        </div>

        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- LEFT COLUMN --}}
          <div class="space-y-6">
            {{-- RECORD DETAILS --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >event</span
                >
                <h2 class="text-text text-sm font-semibold">Record Details</h2>
              </div>
              <div class="space-y-4 p-5">
                @if ($isCreate)
                  <x-fields.attendance
                    field="student_id"
                    :options="$studentOjts->map(fn ($ojt) => ['value' => $ojt->student_id, 'label' => $ojt->student?->full_name ?? 'Unknown Student'])->unique('value')->values()->all()"
                    :value="old('student_id', $selectedOjt?->student_id)"
                  />
                  <input type="hidden" id="ojt_id" name="ojt_id" value="{{ old('ojt_id', $selectedOjt?->id) }}" />
                  <x-fields.office field="name" :office="$selectedOjt?->office" mode="view" />
                  <x-fields.identity :field="$identityField::FULL_NAME" :user="$selectedOjt?->supervisor" label="Supervisor" field-id="attendance_supervisor" mode="view" />
                  <x-fields.identity :field="$identityField::FULL_NAME" :user="$selectedOjt?->instructor" label="Instructor" field-id="attendance_instructor" mode="view" />
                @else
                  <x-fields.office field="name" :office="$attendance?->ojt?->office" mode="view" />
                  <x-fields.identity :field="$identityField::FULL_NAME" :user="$attendance?->ojt?->supervisor" label="Supervisor" field-id="attendance_supervisor" mode="view" />
                  <x-fields.identity :field="$identityField::FULL_NAME" :user="$attendance?->ojt?->instructor" label="Instructor" field-id="attendance_instructor" mode="view" />
                @endif
                <div class="min-w-0">
                  <x-fields.attendance
                    field="date"
                    :value="old('date', $attendance?->date ? $attendance->date->format('Y-m-d') : '')"
                  />
                  <p class="text-text-muted mt-1.5 text-xs">Note: Attendance can only be recorded on weekdays (Mon–Fri).</p>
                  @error ("date")
                    <p class="text-danger-600 mt-1 text-xs">{{ $message }}</p>
                  @enderror
                </div>
              </div>
            </section>
          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">
            {{-- MORNING SESSION --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >wb_sunny</span
                >
                <h2 class="text-text text-sm font-semibold">Morning Session</h2>
              </div>
              <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-text-muted block text-xs font-medium tracking-wider uppercase"
                    >Morning In</label
                  >
                  <input
                    type="time"
                    name="morning_in"
                    value="{{ old('morning_in', $mIn) }}"
                    class="border-border bg-surface text-text focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <label
                    class="text-text inline-flex items-center gap-2 pt-1 text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      name="morning_in_verified"
                      value="1"
                      @checked (old("morning_in_verified", $attendance?->morning_in_verified))
                      class="border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                    />
                    <span>Approved</span>
                  </label>
                </div>

                <div class="min-w-0 space-y-2">
                  <label
                    class="text-text-muted block text-xs font-medium tracking-wider uppercase"
                    >Morning Out</label
                  >
                  <input
                    type="time"
                    name="morning_out"
                    value="{{ old('morning_out', $mOut) }}"
                    class="border-border bg-surface text-text focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <label
                    class="text-text inline-flex items-center gap-2 pt-1 text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      name="morning_out_verified"
                      value="1"
                      @checked (old("morning_out_verified", $attendance?->morning_out_verified))
                      class="border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                    />
                    <span>Approved</span>
                  </label>
                </div>
              </div>
            </section>

            {{-- AFTERNOON SESSION --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >wb_twilight</span
                >
                <h2 class="text-text text-sm font-semibold">Afternoon Session</h2>
              </div>
              <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-text-muted block text-xs font-medium tracking-wider uppercase"
                    >Afternoon In</label
                  >
                  <input
                    type="time"
                    name="afternoon_in"
                    value="{{ old('afternoon_in', $aIn) }}"
                    class="border-border bg-surface text-text focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <label
                    class="text-text inline-flex items-center gap-2 pt-1 text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      name="afternoon_in_verified"
                      value="1"
                      @checked (old("afternoon_in_verified", $attendance?->afternoon_in_verified))
                      class="border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                    />
                    <span>Approved</span>
                  </label>
                </div>

                <div class="min-w-0 space-y-2">
                  <label
                    class="text-text-muted block text-xs font-medium tracking-wider uppercase"
                    >Afternoon Out</label
                  >
                  <input
                    type="time"
                    name="afternoon_out"
                    value="{{ old('afternoon_out', $aOut) }}"
                    class="border-border bg-surface text-text focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <label
                    class="text-text inline-flex items-center gap-2 pt-1 text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      name="afternoon_out_verified"
                      value="1"
                      @checked (old( "afternoon_out_verified", $attendance?->afternoon_out_verified ))
                      class="border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                    />
                    <span>Approved</span>
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>

        {{-- ACTIONS --}}
        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$role}.attendance.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </form>
  </div>
@endsection
