@php
  $role = auth()->user()->role->value;
  $period = $evaluationDetail?->period ?? request()->route("period");
  $evaluationType =
    $evaluationDetail?->evaluation_type ?? ($period ? "instructor" : "supervisor");
  $title = $period
    ? "Instructor " . ucfirst($period) . " Evaluation"
    : "Supervisor Evaluation";
  $title = ($evaluationDetail?->exists ? 'Edit ' : 'Create ') . $title;
  $isCreate = isset($studentOjts);
  $action = $evaluationDetail?->exists
    ? route("web." . $role . ".evaluations.detail.update", [$studentOjt, $evaluationDetail])
    : ($period
      ? route("web." . $role . ".evaluations.detail.store", [$studentOjt, $period])
      : ($isCreate
        ? route("web." . $role . ".evaluations.store")
        : route("web." . $role . ".evaluations.store-for", $studentOjt)));
  $scores = $evaluationDetail?->criteria_scores ?? [];
  $criteria = \App\Support\EvaluationCriteria::get();
  $isAdmin = auth()->user()->isAdmin() || auth()->user()->isSuperAdmin();
  $evaluationField = \App\Enums\Fields\EvaluationField::class;
  $identityField = \App\Enums\Fields\IdentityField::class;
  $officeField = \App\Enums\Fields\OfficeField::class;
  $studentAssignments = $isCreate
    ? $studentOjts->mapWithKeys(function ($item) {
      return [$item->id => [
        'office' => $item->office?->name ?? 'Unassigned',
        'instructor' => $item->instructor?->full_name ?? 'Unassigned',
        'supervisor' => $item->supervisor?->full_name ?? 'Unassigned',
      ]];
    })->all()
    : [];
@endphp

@extends ("layouts.app")

@section ("title", $title)

@section ("header_title", $title)

@section ("header_go_back", "")

@section ("header_description")
  {{ $evaluationDetail?->exists ? "Update" : "Create" }} {{
    $studentOjt->student?->full_name ??
      "student"
  }}'s OJT performance.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <form method="POST" action="{{ $action }}">
      @csrf
      @if ($evaluationDetail?->exists)
        @method ("PUT")
      @endif

      <div class="space-y-6">
        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- LEFT COLUMN --}}
          <div class="space-y-6">
            {{-- STUDENT & OJT INFORMATION --}}
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
                <h2 class="text-text text-sm font-semibold">Student & OJT Information</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  @if ($isCreate)
                    <x-fields.evaluation
                      :field="$evaluationField::STUDENT_OJT_ID"
                      :value="$studentOjt->id"
                      :options="$studentOjts->map(fn ($item) => ['value' => $item->id, 'label' => $item->student?->full_name ?? 'Unknown Student'])->all()"
                    />
                  @else
                    <x-fields.identity
                      :field="$identityField::FULL_NAME"
                      :user="$studentOjt->student"
                      label="Student"
                      mode="view"
                    />
                  @endif
                </div>

                <div class="hidden">
                  <dt
                    class="text-text-muted hidden text-xs font-medium tracking-wider uppercase"
                  >
                    Student ID
                  </dt>
                  <dd class="text-text mt-1 hidden text-sm">
                    {{
                      $studentOjt->student?->user_id ??
                        "—"
                    }}
                  </dd>
                </div>

                <div class="min-w-0">
                  <x-fields.office field="name" :office="$studentOjt->office" mode="view" />
                </div>

                <div class="min-w-0">
                  <x-fields.identity
                    :field="$identityField::FULL_NAME"
                    :user="$studentOjt->instructor"
                    label="Instructor"
                    field-id="instructor_name"
                    mode="view"
                  />
                </div>

                <div class="min-w-0">
                  <x-fields.identity
                    :field="$identityField::FULL_NAME"
                    :user="$studentOjt->supervisor"
                    label="Supervisor"
                    field-id="supervisor_name"
                    mode="view"
                  />
                </div>

                @if ($isAdmin)
                  <div class="min-w-0">
                    <x-fields.evaluation
                      :field="$evaluationField::EVALUATION_TYPE"
                      :value="$evaluationType"
                    />
                  </div>
                  <div class="min-w-0">
                    <x-fields.evaluation
                      :field="$evaluationField::PERIOD"
                      :value="$period"
                    />
                  </div>
                @else
                  <div class="min-w-0 sm:col-span-2">
                    <dt
                      class="text-text-muted text-xs font-medium tracking-wider uppercase"
                    >
                      Period
                    </dt>
                    <dd class="text-text mt-1 text-sm">
                      {{
                        $period
                          ? ucfirst($period)
                          : "Not applicable"
                      }}
                    </dd>
                  </div>
                @endif
              </div>
            </section>

            {{-- SUBMISSION & STATUS --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >tune</span
                >
                <h2 class="text-text text-sm font-semibold">Evaluation Status</h2>
              </div>
              <div class="space-y-4 p-5">
                <div>
                  <x-fields.evaluation
                    :field="$evaluationField::STATUS"
                    :value="$evaluationDetail?->status?->value ?? 'draft'"
                    :options="array_values(array_filter(\App\Enums\EvaluationStatus::options(), fn ($option) => $isAdmin || $option['value'] !== 'finalized'))"
                  />
                </div>
              </div>
            </section>
          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">
            {{-- EVALUATION CRITERIA --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >grade</span
                >
                <h2 class="text-text text-sm font-semibold">Evaluation Criteria</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5">
                @foreach ($criteria as $criterion)
                  @php ($scoreField = "score_" . $criterion["key"])
                  <div>
                    <div class="flex items-center justify-between">
                      <label class="text-text text-sm font-medium" for="{{ $scoreField }}">
                        {{ $criterion["label"] }}
                      </label>
                      <span class="text-text-muted text-xs font-semibold"
                        >(Max {{ $criterion["points"] }} pts)</span
                      >
                    </div>
                    <p class="text-text-muted mt-0.5 text-xs">{{
                      $criterion[
                        "description"
                      ]
                    }}</p>
                    <input
                      required
                      id="{{ $scoreField }}"
                      name="{{ $scoreField }}"
                      type="number"
                      min="0"
                      max="{{ $criterion['points'] }}"
                      value="{{ old($scoreField, $scores[$criterion['key']] ?? 0) }}"
                      class="border-border bg-surface text-text focus:ring-primary-500 mt-2 w-full rounded-md border px-3 py-2 text-sm"
                    />
                    @error ($scoreField)
                      <p class="text-danger-600 mt-1 text-xs">{{ $message }}</p>
                    @enderror
                  </div>
                @endforeach

                <div class="border-border-muted border-t pt-2">
                  <x-fields.evaluation
                    :field="$evaluationField::REMARKS"
                    :value="$evaluationDetail?->remarks"
                  />
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
            href="{{ route('web.' . $role . '.evaluations.show', $studentOjt) }}"
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

@if ($isCreate)
  @push ("scripts")
    <script>
      $(function () {
        const studentAssignments = @json($studentAssignments);
        const $student = $('#{{ $evaluationField::STUDENT_OJT_ID->value }}');
        const $office = $('#name');
        const $instructor = $('#instructor_name');
        const $supervisor = $('#supervisor_name');

        function updateAssignmentFields() {
          const assignment = studentAssignments[$student.val()] ?? {};
          $office.val(assignment.office ?? 'Unassigned');
          $instructor.val(assignment.instructor ?? 'Unassigned');
          $supervisor.val(assignment.supervisor ?? 'Unassigned');
        }

        $student.on('change', updateAssignmentFields);
        updateAssignmentFields();
      });
    </script>
  @endpush
@endif
