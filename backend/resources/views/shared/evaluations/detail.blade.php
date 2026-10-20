@php
  $role = auth()->user()->role->value;
  $isAdmin = auth()->user()->isAdmin() || auth()->user()->isSuperAdmin();
  $scores = $evaluationDetail->criteria_scores ?? [];
  $criteria = \App\Support\EvaluationCriteria::get();
  $identityField = \App\Enums\Fields\IdentityField::class;
  $evaluationField = \App\Enums\Fields\EvaluationField::class;

  $statusClasses = match ($evaluationDetail->status?->value) {
    "submitted", "finalized" => "bg-success-50 text-success-700",
    "draft" => "bg-warning-50 text-warning-700",
    default => "bg-background text-text-muted",
  };

  $statusDot = match ($evaluationDetail->status?->value) {
    "submitted", "finalized" => "bg-success-500",
    "draft" => "bg-warning-500",
    default => "bg-text-subtle",
  };
@endphp

@extends ("layouts.app")

@section ("title", "Evaluation Details")

@section ("header_title",
  ucfirst($evaluationDetail->evaluation_type) .
    " " .
    ($evaluationDetail->period ? ucfirst($evaluationDetail->period) : "") .
    " Evaluation")

@section ("header_go_back", "")

@section ("header_description", $studentOjt->student?->full_name)

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
                  "Unknown Student"
              }}
            </h2>
            <p class="text-text-muted truncate text-sm">
              Evaluator: {{
                $evaluationDetail->evaluator?->full_name ??
                  "System"
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
              $evaluationDetail->status?->value ?? "Draft",
            )
          }}
        </span>
      </div>
    </div>

    <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
      <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
        <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">person</span>
        <h3 class="text-text text-sm font-semibold">Student & OJT Information</h3>
      </div>
      <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
        <x-fields.identity :field="$identityField::FULL_NAME" :user="$studentOjt->student" label="Student" mode="view" />
        <x-fields.identity field="user_id" :user="$studentOjt->student" label="Student ID" mode="view" />
        <x-fields.office field="name" :office="$studentOjt->office" mode="view" />
        <x-fields.identity :field="$identityField::FULL_NAME" :user="$studentOjt->instructor" label="Instructor" field-id="instructor_name" mode="view" />
        <x-fields.identity :field="$identityField::FULL_NAME" :user="$studentOjt->supervisor" label="Supervisor" field-id="supervisor_name" mode="view" />
      </div>
    </section>

    <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
      <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
        <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">fact_check</span>
        <h3 class="text-text text-sm font-semibold">Evaluation Information</h3>
      </div>
      <div class="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
        @if ($isAdmin)
          <x-fields.evaluation :field="$evaluationField::EVALUATION_TYPE" :value="$evaluationDetail->evaluation_type" mode="view" />
        @endif
        <x-fields.evaluation :field="$evaluationField::PERIOD" :value="$evaluationDetail->period" mode="view" />
        <x-fields.evaluation :field="$evaluationField::STATUS" :value="$evaluationDetail->status?->value" mode="view" />
      </div>
    </section>

    {{-- TWO-COLUMN LAYOUT --}}
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {{-- LEFT COLUMN --}}
      <div class="space-y-6">
        {{-- EVALUATION SUMMARY --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >info</span
            >
            <h3 class="text-text text-sm font-semibold">Evaluation Summary</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            @if ($isAdmin)
              <div class="min-w-0">
                <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                  Evaluation Type
                </dt>
                <dd class="text-text mt-1 text-sm font-semibold">
                  {{
                    ucfirst(
                      $evaluationDetail->evaluation_type,
                    )
                  }}
                </dd>
              </div>
            @endif

            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Period
              </dt>
              <dd class="text-text mt-1 text-sm font-medium">
                {{
                  $evaluationDetail->period
                    ? ucfirst($evaluationDetail->period)
                    : "Not applicable"
                }}
              </dd>
            </div>

            <div class="min-w-0 sm:col-span-2">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Submitted At
              </dt>
              <dd class="text-text mt-1 text-sm">
                {{
                  $evaluationDetail->submitted_at?->format(
                    "M d, Y g:i A",
                  ) ?? "Not submitted"
                }}
              </dd>
            </div>
          </div>
        </section>

        {{-- TOTAL SCORE & REMARKS --}}
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
            <h3 class="text-text text-sm font-semibold">Overall Grade & Remarks</h3>
          </div>
          <div class="space-y-4 p-5">
            <div>
              <span
                class="text-text-muted block text-xs font-medium tracking-wider uppercase"
                >Total Points</span
              >
              <p class="text-primary-700 mt-1 text-3xl font-bold tracking-tight">
                {{ $evaluationDetail->total_points }}
                <span class="text-text-muted text-lg font-medium">/ 100</span>
              </p>
            </div>

            @if ($evaluationDetail->remarks)
              <div class="border-border-muted border-t pt-4">
                <span
                  class="text-text-muted mb-2 block text-xs font-medium tracking-wider uppercase"
                  >Evaluator Remarks</span
                >
                <p class="border-border bg-background text-text rounded-xl border p-4 text-sm whitespace-pre-line">
                  {{ $evaluationDetail->remarks }}
                </p>
              </div>
            @endif
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- CRITERIA SCORES BREAKDOWN --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >fact_check</span
            >
            <h3 class="text-text text-sm font-semibold">Criteria Breakdown</h3>
          </div>
          <div class="space-y-3 p-5">
            @foreach ($criteria as $criterion)
              <div
                class="border-border bg-background flex items-center justify-between rounded-xl border p-3.5"
              >
                <div class="min-w-0">
                  <p class="text-text truncate text-sm font-medium">{{ $criterion["label"] }}</p>
                  <p class="text-text-muted text-xs">Max points: {{ $criterion["points"] }}</p>
                </div>
                <span class="text-primary-700 ml-3 shrink-0 text-base font-bold">
                  {{
                    $scores[$criterion["key"]] ??
                      0
                  }}
                  <span class="text-text-muted text-xs font-normal"
                    >/ {{ $criterion["points"] }}</span
                  >
                </span>
              </div>
            @endforeach
          </div>
        </section>
      </div>
    </div>

    {{-- ACTIONS --}}
    @if ($evaluationDetail->evaluation_type === "instructor" &&
      $evaluationDetail->status->value === "draft")
      <div
        class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
      >
        <a
          href="{{ route('web.' . $role . '.evaluations.detail.create', [$studentOjt, $evaluationDetail->period]) }}"
          class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <span class="material-symbols-outlined text-base">edit</span>
          Edit Draft
        </a>
      </div>
    @endif
  </div>
@endsection
