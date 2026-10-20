@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.reports.store";

  $studentOptions = $students->pluck("full_name", "id")->toArray();
  $reviewedByOptions = $reviewers->pluck("full_name", "id")->toArray();
  $reportTypeOptionsByStudent = $reportTypeOptionsByStudent ?? [];
@endphp

@extends ("layouts.app")

@section ("title", "Create Report")

@section ("header_title", "Create Report")

@section ("header_go_back", "")

@section ("header_description")
  Create a report for one of the student's published reporting requirements.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form method="POST" action="{{ route($route) }}" enctype="multipart/form-data">
      <div class="space-y-6">
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
                  <x-fields.report field="student_id" :options="$studentOptions" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="type" :options="[]" />
                  <p class="text-text-muted mt-2 text-xs">
                    Select the missing report requirement for this student. The report type comes from the published OJT requirement.
                  </p>
                  <input
                    type="hidden"
                    name="report_assignment_id"
                    id="report_assignment_id"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="report_date" />
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
                <x-fields.report field="document_paths" />
                <p class="text-text-muted mt-2 text-xs">Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 10MB.</p>
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
                  <x-fields.report field="status" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="reviewed_by" :options="$reviewedByOptions" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="reviewed_at" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report field="feedback" />
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

  <script>
    (() => {
      const optionsByStudent = @json ($reportTypeOptionsByStudent);
      const student = document.getElementById("student_id");
      const type = document.getElementById("type");
      const assignment = document.getElementById("report_assignment_id");
      const refresh = () => {
        const options = optionsByStudent[student.value] || [];
        type.innerHTML = '<option value="">Select a required report</option>';
        options.forEach((item) => type.add(new Option(item.label, item.value)));
        const selected = options[0];
        assignment.value = selected?.assignment_id || "";
        $(type).trigger("change.select2");
      };
      student?.addEventListener("change", refresh);
      type?.addEventListener("change", () => {
        const selected = (optionsByStudent[student.value] || []).find(
          (item) => item.value === type.value,
        );
        assignment.value = selected?.assignment_id || "";
      });
      refresh();
    })();
  </script>
@endsection
