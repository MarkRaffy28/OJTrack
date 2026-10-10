@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.reports.update";

  $studentOptions = $students->pluck("full_name", "id")->toArray();
  $ojtOptions = $studentOjts
    ->mapWithKeys(
      fn($ojt) => [
        $ojt->id => "{$ojt->student->full_name} - {$ojt->academic_year} ({$ojt->term->value})",
      ],
    )
    ->toArray();
  $reviewedByOptions = $reviewers->pluck("full_name", "id")->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Edit Report")
@section ("header_title", "Edit Report")

@section ("content")
  <div>
    <x-form.form
      method="PUT"
      action="{{ route($route, $report) }}"
      enctype="multipart/form-data"
    >
      <x-fields.report
        field="student_id"
        :value="$report->student_id"
        :options="$studentOptions"
      />
      <x-fields.report field="ojt_id" :value="$report->ojt_id" :options="$ojtOptions" />
      <x-fields.report field="type" :value="$report->type->value" />
      <x-fields.report
        field="report_date"
        :value="$report->report_date?->format('Y-m-d')"
      />
      <x-fields.report field="document_paths" :value="$report->document_paths ?? []" />
      <x-fields.report field="status" :value="$report->status->value" />
      <x-fields.report
        field="reviewed_by"
        :value="$report->reviewed_by"
        :options="$reviewedByOptions"
      />
      <x-fields.report
        field="reviewed_at"
        :value="$report->reviewed_at?->format('Y-m-d\TH:i')"
      />
      <x-fields.report field="feedback" :value="$report->feedback" />
      <x-form.submit />
    </x-form.form>
  </div>
@endsection
