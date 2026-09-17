@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Student OJTs")

@section ("header_title", "Student OJTs")

@section ("header_description", "Manage student OJT assignments.")

@section ("content")
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
      @foreach ([
        ['Total Assignments', $stats['total'], 'All student OJT records', 'bg-primary-50 text-primary-700'],
        ['Ongoing', $stats['ongoing'], 'Currently in progress', 'bg-blue-50 text-blue-700'],
        ['Completed', $stats['completed'], 'Finished placements', 'bg-green-50 text-green-700'],
        ['Pending', $stats['pending'], 'Not started yet', 'bg-amber-50 text-amber-700'],
        ['Average Progress', $stats['average_progress'] . '%', 'Based on approved hours', 'bg-violet-50 text-violet-700'],
      ] as [$label, $value, $description, $colors])
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-gray-500">{{ $label }}</p>
            <span class="rounded-lg px-2 py-1 text-xs font-semibold {{ $colors }}">{{ $label === 'Average Progress' ? 'PROGRESS' : 'OJT' }}</span>
          </div>
          <p class="mt-3 text-2xl font-bold text-gray-900">{{ $value }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ $description }}</p>
        </div>
      @endforeach
    </div>

    <x-table
      :headers="[
        'Student',
        'Supervisor',
        'Office',
        'Academic Year',
        'Term',
        'Required Hours',
        'Rendered Hours',
        'Progress',
        'Status',
        'Start Date',
        'End Date',
        'Actions',
      ]"
    >
      @forelse ($studentOjts as $studentOjt)
        <x-table.row>
          <x-table.cell>
            <div class="font-medium text-gray-900">
              {{
                $studentOjt->student
                  ->full_name
              }}
            </div>
          </x-table.cell>

          <x-table.cell>
            {{
              $studentOjt->supervisor?->full_name ??
                "Unassigned"
            }}
          </x-table.cell>

          <x-table.cell>
            {{
              $studentOjt->office
                ->name
            }}
          </x-table.cell>

          <x-table.cell> {{ $studentOjt->academic_year }} </x-table.cell>

          <x-table.cell> {{ $studentOjt->term->value }} </x-table.cell>

          <x-table.cell> {{ $studentOjt->required_hours }} </x-table.cell>

          <x-table.cell>
            <span class="font-medium text-gray-900">{{ number_format($studentOjt->rendered_hours, 2) }} hrs</span>
            <span class="block text-xs text-gray-500">approved</span>
          </x-table.cell>

          <x-table.cell>
            <div class="min-w-28">
              <div class="mb-1 flex justify-between text-xs">
                <span class="font-medium text-gray-700">{{ number_format($studentOjt->progress_percent, 1) }}%</span>
                <span class="text-gray-500">{{ number_format(max((float) $studentOjt->required_hours - $studentOjt->rendered_hours, 0), 2) }}h left</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-gray-200">
                <div class="h-full rounded-full bg-primary-600" style="width: {{ $studentOjt->progress_percent }}%"></div>
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
              $studentOjt->start_date->format(
                "Y-m-d",
              )
            }}
          </x-table.cell>

          <x-table.cell>
            {{
              $studentOjt->end_date->format(
                "Y-m-d",
              )
            }}
          </x-table.cell>

          <x-table.cell>
            <div class="flex items-center gap-2">
              <a
                href="{{ route("web.{$role}.student-ojts.show", $studentOjt) }}"
                class="rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-600 hover:text-white"
              >
                View
              </a>
              <a
                href="{{ route("web.{$role}.evaluations." . ($studentOjt->evaluation ? 'show' : 'create-for'), $studentOjt) }}"
                class="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-600 hover:text-white"
              >
                {{ $studentOjt->evaluation ? 'View Evaluation' : 'Evaluate' }}
              </a>
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No student OJTs found." :colspan="12" />
      @endforelse
    </x-table>

    <x-pagination :paginator="$studentOjts" />
  </div>
@endsection
