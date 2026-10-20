@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.reports.update";

  $studentOptions = $students->pluck("full_name", "id")->toArray();
  $reviewedByOptions = $reviewers->pluck("full_name", "id")->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Edit Report Submission")

@section ("header_title", "Edit Report Submission")

@section ("header_go_back", "")

@section ("header_description")
  Update this report submission, its documents, or its review information.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form
      method="PUT"
      action="{{ route($route, $report) }}"
      enctype="multipart/form-data"
    >
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
                >edit_note</span
              >
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-text truncate text-lg font-semibold">
                {{
                  $report->student?->full_name ??
                    "Unknown Student"
                }}
              </h2>
              <p class="text-text-muted truncate text-sm">
                {{
                  $report->type?->value
                    ? "Required " . ucfirst($report->type->value) . " Report"
                    : "Report Submission"
                }}
              </p>
            </div>
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
                <h2 class="text-text text-sm font-semibold">Submission Details</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report
                    field="student_id"
                    mode="view"
                    :value="$report->student_id"
                    :options="[$report->student_id => $report->student?->full_name ?? '']"
                  />
                  <input type="hidden" name="student_id" value="{{ $report->student_id }}" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report
                    field="type"
                    mode="view"
                    :value="$report->type?->value"
                  />
                  <p class="text-text-muted mt-2 text-xs">
                    This requirement comes from the report assignment and cannot be changed after submission.
                  </p>
                  <input type="hidden" name="report_assignment_id" value="{{ $report->report_assignment_id }}" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report
                    field="report_date"
                    :value="$report->report_date?->format('Y-m-d')"
                  />
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
                <h2 class="text-text text-sm font-semibold">Submitted Documents</h2>
              </div>
              <div class="p-5">
                <x-fields.report
                  field="document_paths"
                  :value="$report->document_paths ?? []"
                />
              </div>
            </section>
          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">
            {{-- REVIEW & STATUS --}}
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
                <h2 class="text-text text-sm font-semibold">Review & Feedback</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="status" :value="$report->status->value" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report
                    field="reviewed_by"
                    :value="$report->reviewed_by"
                    :options="$reviewedByOptions"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report
                    field="reviewed_at"
                    :value="$report->reviewed_at?->format('Y-m-d\TH:i')"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="feedback" :value="$report->feedback" />
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
            href="{{ route("web.{$role}.reports.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </x-form.form>
  </div>
@endsection
