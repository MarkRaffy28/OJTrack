@php
  $assignment = $report->ojt;
@endphp

@extends ("layouts.app")

@section ("title", "View Report")

@section ("header_title", "View Report")

@section ("content")
  <div class="space-y-6">
    <x-fields.report
      field="student_id"
      mode="view"
      :value="$report->student_id"
      :options="[
        $report->student_id => $report->student?->full_name ?? '',
      ]"
    />

    <div>
      <label
        class="text-text-muted mb-2 block text-xs font-bold tracking-wider uppercase"
      >
        Assignment
      </label>

      <div class="border-border bg-background-variant rounded-md border px-4 py-3">
        <div class="text-text font-medium">
          A.Y. {{ $assignment?->academic_year }} {{ $assignment?->term->value }} Term
        </div>

        <div class="text-text-muted mt-1 text-sm">
          Supervisor: {{
            $assignment?->supervisor?->full_name ??
              "No supervisor"
          }}
        </div>

        <div class="text-text-muted text-sm">
          Office: {{
            $assignment?->office?->name ??
              "No office"
          }}
        </div>
      </div>
    </div>

    <x-fields.report field="type" mode="view" :value="$report->type?->value" />
    <x-fields.report
      field="report_date"
      mode="view"
      :value="$report->report_date?->format('Y-m-d')"
    />
    <x-fields.report
      field="document_paths"
      mode="view"
      :value="$report->document_paths ?? []"
    />
    <x-fields.report field="status" mode="view" :value="$report->status?->value" />
    <x-fields.report
      field="reviewed_by"
      mode="view"
      :value="$report->reviewer?->id"
      :options="[
        $report->reviewer?->id => $report->reviewer?->full_name,
      ]"
    />
    <x-fields.report
      field="reviewed_at"
      mode="view"
      :value="$report->reviewed_at?->format('Y-m-d H:i')"
    />
    <x-fields.report field="feedback" mode="view" :value="$report->feedback" />
  </div>
@endsection
