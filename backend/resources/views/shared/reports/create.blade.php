@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.reports.store";

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

@section ("title", "Create Report")
@section ("header_title", "Create Report")
@section ("header_description", "Fill in the details below to create a new report.")

@section ("content")
  <div class="mx-auto max-w-5xl">
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {{-- Form --}}
      <x-form.form
        action="{{ route($route) }}"
        enctype="multipart/form-data"
        class="px-8 py-6"
      >
        <div class="space-y-6">
          {{-- Row 1: Student / Assignment --}}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.report field="student_id" :options="$studentOptions" />
            <x-fields.report field="ojt_id" :options="$ojtOptions" />
          </div>

          {{-- Row 2: Type / Report Date --}}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.report field="type" />
            <x-fields.report field="report_date" />
          </div>

          {{-- Documents (full width) --}}
          <div>
            <x-fields.report field="document_paths" />
            <p class="mt-1.5 text-xs text-gray-400">Supported formats: PDF, DOC, DOCX, JPG, PNG. Max size: 10MB.</p>
          </div>

          {{-- Row 3: Status / Reviewed By --}}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.report field="status" />
            <x-fields.report field="reviewed_by" :options="$reviewedByOptions" />
          </div>

          {{-- Row 4: Reviewed At / Feedback --}}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.report field="reviewed_at" />
            <x-fields.report field="feedback" />
          </div>
        </div>

        {{-- Footer actions --}}
        <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <a
            href="{{ route("web.{$role}.reports.index") }}"
            class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Cancel
          </a>

          <x-form.submit
            class="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Report
          </x-form.submit>
        </div>
      </x-form.form>
    </div>
  </div>
@endsection
