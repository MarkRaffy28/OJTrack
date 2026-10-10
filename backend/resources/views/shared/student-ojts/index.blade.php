@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudentOjt> $studentOjts */
@endphp

@extends ("layouts.app")

@section ("title", "Student OJTs")
@section ("header_title", "Student OJTs")
@section ("header_description", "Manage student OJT assignments.")

@section ("header_print", "")

@section ("header_filters")
  <x-search-filter
    :filters="$filters"
    :show-search="false"
  />
@endsection

@section ("content")
  <div class="space-y-6">
    <x-table :headers="$headers">
      @forelse ($studentOjts as $studentOjt)
        <x-table.row :model="$studentOjt">
          <x-table.cell> {{ $studentOjt->id }}</x-table.cell>

          <x-table.cell :model="$studentOjt->student">
            {{
              $studentOjt->student
                ?->full_name
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
              $studentOjt->office
                ->name
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

    <x-pagination :paginator="$studentOjts" />
  </div>
@endsection
