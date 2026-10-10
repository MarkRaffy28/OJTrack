@php($role = auth()->user()->role->value)
@extends('layouts.app')

@section('title', $title)
@section('header_title', $title)
@section('header_description', $description)
@section('header_actions')
  <a href="{{ route("web.{$role}.dashboard.index") }}" class="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:bg-background">Back to Dashboard</a>
@endsection

@section('content')
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Students listed</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ $students->count() }}</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Required hours</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ number_format($students->sum('required_hours'), 2) }}</p>
        <p class="text-xs text-text-subtle">total assigned hours</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Rendered hours</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ number_format($students->sum(fn($ojt) => $ojt->rendered_hours), 2) }}</p>
        <p class="text-xs text-text-subtle">approved attendance hours</p>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border-muted text-sm">
          <thead class="bg-background text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
            <tr>
              <th class="px-5 py-3">Student</th>
              <th class="px-5 py-3">Placement</th>
              <th class="px-5 py-3">Supervisor</th>
              <th class="px-5 py-3">Hours / Progress</th>
              <th class="px-5 py-3">{{ $detailLabel }}</th>
              <th class="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-muted">
            @forelse ($students as $ojt)
              <tr class="hover:bg-background/60">
                <td class="px-5 py-4 font-medium text-text">{{ $ojt->student?->full_name ?? 'Unknown student' }}</td>
                <td class="px-5 py-4 text-text-muted">{{ $ojt->office?->name ?? 'Unassigned' }}<span class="block text-xs text-text-subtle">{{ $ojt->academic_year }} / {{ $ojt->term?->value }}</span></td>
                <td class="px-5 py-4 text-text-muted">{{ $ojt->supervisor?->full_name ?? 'Unassigned' }}</td>
                <td class="px-5 py-4"><span class="font-medium text-text">{{ number_format($ojt->rendered_hours, 2) }} / {{ number_format($ojt->required_hours, 2) }} hrs</span><span class="block text-xs text-primary-600">{{ number_format($ojt->progress_percent, 1) }}%</span></td>
                <td class="px-5 py-4 text-text-muted">{{ $detailValue($ojt) }}</td>
                <td class="px-5 py-4"><a href="{{ route("web.{$role}.student-ojts.show", $ojt) }}" class="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-600 hover:text-white">View details</a></td>
              </tr>
            @empty
              <tr><td colspan="6" class="px-5 py-12 text-center text-sm text-text-muted">No students found for this category.</td></tr>
            @endforelse
          </tbody>
        </table>
      </div>
    </div>
  </div>
@endsection
