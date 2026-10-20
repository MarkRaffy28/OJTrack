@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Office> $offices */
  $currentRole = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection} Assignments"
    : (isset($office)
      ? "{$office->name} - Assignments"
      : "Assignments"))
@section ("header_title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection}"
    : (isset($office)
      ? $office->name
      : (isset($allOffices) && $allOffices ? "All Offices" : "Assignments")))
@section ("header_description",
  isset($currentSection)
    ? "Manage student OJT assignments for this section."
    : (isset($office) || isset($allOffices)
      ? "Select a section to view assignments."
      : "Select an office to get started."))

@section ("header_show_cohort_selector", "")

@if (isset($studentOjts))
  @section ("header_print", "")
  @section ("header_create_route",
    route(
      "web.{$currentRole}.assignments.create",
      request()->query("office_id") ? ["office_id" => request()->query("office_id")] : []
    ))

  @section ("header_filters")
    <x-search-filter :filters="$filters" />
  @endsection
@endif

@section ("content")
  @if (isset($offices))
    {{-- Level 1: Office List Cards --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($offices->isNotEmpty())
        <x-selectable-card
          icon="domain"
          title="All Offices"
          subtitle="View assignments across every office"
          :id="1"
          param="all_offices"
          :count="$offices->sum('student_ojts_count')"
          countLabel="assigned student"
        />
      @endif

      @forelse ($offices as $office)
        <x-selectable-card
          icon="domain"
          :title="$office->name"
          :subtitle="$office->address ?? null"
          :id="$office->id"
          param="office_id"
          :count="$office->student_ojts_count"
          countLabel="assigned student"
        />
      @empty
        <x-empty-state
          icon="business"
          title="No offices found"
          description="There are no offices available to display."
        />
      @endforelse
    </div>
  @elseif (isset($sections))
    {{-- Level 2: Section List Cards (for selected office) --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalOfficeAssignmentsCount > 0)
        <x-selectable-card
          icon="folder"
          title="All Sections"
          subtitle="View assignments across all sections"
          :id="1"
          param="all_sections"
          :queryParams="
            request()->has('office_id')
              ? ['office_id' => request()->query('office_id')]
              : ['all_offices' => 1]
          "
          :count="$totalOfficeAssignmentsCount"
          countLabel="assigned student"
        />
      @endif

      @forelse ($sections as $item)
        <x-selectable-card
          icon="group"
          :title="$item['label']"
          subtitle="View assignments for this section"
          :id="$item['section']"
          param="section"
          :queryParams="
            array_merge(
              request()->has('office_id')
                ? ['office_id' => request()->query('office_id')]
                : ['all_offices' => 1],
              ['program' => $item['program']],
            )
          "
          :count="$item['assignments_count'] ?? 0"
          countLabel="assigned student"
        />
      @empty
        <x-empty-state
          icon="folder_open"
          title="No sections found"
          description="There are no student sections available for this office."
        />
      @endforelse
    </div>
  @else
    {{-- Level 3: Assignment Table View --}}
    <div class="space-y-4">
      {{-- Table --}}
      <x-table :headers="$headers">
        @forelse ($studentOjts as $studentOjt)
          <x-table.row :model="$studentOjt" routePrefix="assignments">
            <x-table.cell> {{ $studentOjt->id }} </x-table.cell>

            <x-table.cell :model="$studentOjt->student">
              {{
                $studentOjt->student?->full_name ??
                  "Unknown User"
              }}
            </x-table.cell>

            <x-table.cell :model="$studentOjt->supervisor">
              {{
                $studentOjt->supervisor?->full_name ??
                  "Unassigned"
              }}
            </x-table.cell>

            <x-table.cell :model="$studentOjt->office">
              {{
                $studentOjt->office?->name ??
                  "Unknown Office"
              }}
            </x-table.cell>

            <x-table.cell> {{ $studentOjt->cohort }} </x-table.cell>

            <x-table.cell> {{ $studentOjt->status->label() }}</x-table.cell>

            <x-table.actions
              :model="$studentOjt"
              :actions="['view', 'edit', 'delete', 'restore']"
              routePrefix="assignments"
              :deleteLabel="($studentOjt->student?->full_name ?? 'Student') . '\'s record'"
            />
          </x-table.row>
        @empty
          <x-table.empty-state
            message="No assignments found for this office."
            :colspan="count($headers)"
          />
        @endforelse
      </x-table>

      {{-- Pagination --}}
      <div class="print:hidden">
        <x-pagination :paginator="$studentOjts" />
      </div>
    </div>
  @endif
@endsection

@if (!isset($offices))
  @push ("styles")
    <style>
      @media print {
        body * {
          visibility: hidden;
        }

        main,
        main * {
          visibility: visible;
        }

        main {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    </style>
  @endpush
@endif
