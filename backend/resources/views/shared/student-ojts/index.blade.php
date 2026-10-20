@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Office> $offices */
  /** @var \Illuminate\Support\Collection $sections */
  /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $studentOjts */
  $currentRole = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection} Student OJTs"
    : (isset($office)
      ? "{$office->name} - Student OJTs"
      : "Student OJTs"))
@section ("header_title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection}"
    : (isset($office)
      ? $office->name
      : (isset($allOffices) && $allOffices
        ? "All Offices"
        : "Student OJTs")))
@section ("header_description",
  isset($currentSection)
    ? "Manage student OJT records for this section."
    : (isset($office) || isset($allOffices)
      ? "Select a section to view student OJT records."
      : "Select an office to get started."))

@section ("header_show_cohort_selector", "")

@if (isset($studentOjts))
  @section ("header_print", "")
  
  @section ("header_filters")
    <x-search-filter :filters="$filters" />
  @endsection
@endif

@section ("content")
  @if (isset($offices))
    {{-- Level 1: Office List Cards --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalStudentOjtsCount > 0)
        <x-selectable-card
          icon="domain"
          title="All Offices"
          subtitle="View student OJTs across every office"
          :id="1"
          param="all_offices"
          :count="$totalStudentOjtsCount"
          countLabel="assigned student"
        />
      @endif

      @forelse ($offices as $item)
        <x-selectable-card
          icon="domain"
          :title="$item['office']->name"
          :subtitle="$item['office']->address ?? null"
          :id="$item['office']->id"
          param="office_id"
          :count="$item['student_ojts_count']"
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
      @if ($totalOfficeStudentOjtsCount > 0)
        <x-selectable-card
          icon="folder"
          title="All Sections"
          subtitle="View student OJTs across all sections"
          :id="1"
          param="all_sections"
          :queryParams="
            request()->has('office_id')
    ? ['office_id' => request()->query('office_id')]
    : ['all_offices' => 1]
          "
          :count="$totalOfficeStudentOjtsCount"
          countLabel="assigned student"
        />
      @endif

      @forelse ($sections as $item)
        <x-selectable-card
          icon="group"
          :title="$item['label']"
          subtitle="View student OJTs for this section"
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
          :count="$item['student_ojts_count'] ?? 0"
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
    {{-- Level 3: Student OJTs Table View --}}
    <div class="space-y-6">
      <x-table :headers="$headers">
        @forelse ($studentOjts as $studentOjt)
          <x-table.row :model="$studentOjt">
            <x-table.cell> {{ $studentOjt->id }}</x-table.cell>

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

            <x-table.cell> {{ $studentOjt->required_hours }} </x-table.cell>

            <x-table.cell>
              {{
                number_format(
                  $studentOjt->rendered_hours,
                  2,
                )
              }} hrs
            </x-table.cell>

            <x-table.cell>
              <div class="min-w-28">
                <div class="mb-1 flex justify-between text-xs">
                  <span class="font-medium text-gray-700"
                    >{{
                      number_format(
                        $studentOjt->progress_percent,
                        1,
                      )
                    }}%</span
                  >
                  <span class="text-gray-500"
                    >{{
                      number_format(
                        max((float) $studentOjt->required_hours - $studentOjt->rendered_hours, 0),
                        2,
                      )
                    }}h left</span
                  >
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="bg-primary-600 h-full rounded-full"
                    style="width: {{ $studentOjt->progress_percent }}%"
                  ></div>
                </div>
              </div>
            </x-table.cell>

            <x-table.cell>
              {{
                $studentOjt->status
                  ->value
              }}
            </x-table.cell>

            <x-table.cell>
              {{
                $studentOjt->start_date?->format("F j, Y") ??
                  "—"
              }}
            </x-table.cell>

            <x-table.cell>
              {{
                $studentOjt->end_date?->format("F j, Y") ??
                  "—"
              }}
            </x-table.cell>

            <x-table.actions
              :model="$studentOjt"
              :actions="['view', 'evaluation']"
              :evaluationRoute="
                route(
    'web.' .
      $currentRole .
      '.evaluations.' .
      ($studentOjt->evaluation ? 'show' : 'create-for'),
    $studentOjt,
  )
              "
              :evaluationLabel="$studentOjt->evaluation ? 'View Evaluation' : 'Evaluate'"
            />
          </x-table.row>
        @empty
          <x-table.empty-state
            message="No student OJTs found. Try changing your search or filters."
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

@if (isset($studentOjts))
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
