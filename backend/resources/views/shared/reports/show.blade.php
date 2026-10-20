@php
  $role = auth()->user()->role->value;
  $assignment = $report->ojt;

  $statusClasses = match ($report->status?->value) {
    "approved" => "bg-success-50 text-success-700",
    "pending" => "bg-warning-50 text-warning-700",
    "rejected" => "bg-danger-50 text-danger-700",
    default => "bg-background text-text-muted",
  };

  $statusDot = match ($report->status?->value) {
    "approved" => "bg-success-500",
    "pending" => "bg-warning-500",
    "rejected" => "bg-danger-500",
    default => "bg-text-subtle",
  };
@endphp

@extends ("layouts.app")

@section ("title", "View Report")

@section ("header_title", "View Report")
@section ("header_edit_route", route("web.{$role}.reports.edit", $report))
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- HERO HEADER --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <x-avatar mode="view" size="md" :user="$report->student" />
          <div class="min-w-0">
            <h2 class="text-text truncate text-lg font-semibold">
              {{
                $report->student?->full_name ??
                  "Unknown Student"
              }}
            </h2>
            <p class="text-text-muted truncate text-sm">
              {{
                $assignment?->office?->name ??
                  "No office assigned"
              }}
            </p>
          </div>
        </div>

        @if ($report->status)
          <span
            class="{{ $statusClasses }} inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          >
            <span class="{{ $statusDot }} h-1.5 w-1.5 rounded-full"></span>
            {{
              ucfirst(
                $report->status->value,
              )
            }}
          </span>
        @endif
      </div>
    </div>

    {{-- TWO-COLUMN LAYOUT --}}
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {{-- LEFT COLUMN --}}
      <div class="space-y-6">
        {{-- REPORT DETAILS --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >description</span
            >
            <h3 class="text-text text-sm font-semibold">Report Information</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <x-fields.report
                field="student_id"
                mode="view"
                :value="$report->student_id"
                :options="[
                  $report->student_id => $report->student?->full_name ?? '',
                ]"
              />
            </div>
            <div class="min-w-0">
              <x-fields.report field="type" mode="view" :value="$report->type?->value" />
            </div>
            <div class="min-w-0">
              <x-fields.report
                field="status"
                mode="view"
                :value="$report->status?->value"
              />
            </div>
            <div class="min-w-0">
              <x-fields.report
                field="report_date"
                mode="view"
                :value="$report->report_date?->format('Y-m-d')"
              />
            </div>
            <div class="min-w-0">
              <x-fields.report field="deadline" mode="view" :value="$report->deadline" />
            </div>
          </div>
        </section>

        {{-- ATTACHMENTS --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >attach_file</span
            >
            <h3 class="text-text text-sm font-semibold">Submitted Documents</h3>
          </div>
          <div class="p-5">
            <x-fields.report
              field="document_paths"
              mode="view"
              :value="$report->document_paths ?? []"
            />
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
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
          <div class="p-5">
            <div class="border-border bg-background space-y-2 rounded-xl border p-4">
              <p class="text-text font-semibold">
                A.Y. {{ $assignment?->academic_year ?? "N/A" }} {{
                  $assignment?->term?->value
                    ? "· " . $assignment->term->value . " Term"
                    : ""
                }}
              </p>
              <p class="text-text-muted flex items-center gap-1.5 text-sm">
                <span class="material-symbols-outlined text-primary-600 text-base"
                  >badge</span
                >
                Supervisor: {{
                  $assignment?->supervisor?->full_name ??
                    "No supervisor assigned"
                }}
              </p>
              <p class="text-text-muted flex items-center gap-1.5 text-sm">
                <span class="material-symbols-outlined text-primary-600 text-base"
                  >business</span
                >
                Office: {{
                  $assignment?->office?->name ??
                    "No office assigned"
                }}
              </p>
            </div>
          </div>
        </section>

        {{-- REVIEW & FEEDBACK --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >rate_review</span
            >
            <h3 class="text-text text-sm font-semibold">Review & Feedback</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <x-fields.report
                field="reviewed_by"
                mode="view"
                :value="$report->reviewer?->id"
                :options="[
                  $report->reviewer?->id => $report->reviewer?->full_name,
                ]"
              />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <x-fields.report
                field="reviewed_at"
                mode="view"
                :value="$report->reviewed_at?->format('Y-m-d H:i')"
              />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <x-fields.report field="feedback" mode="view" :value="$report->feedback" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
@endsection
