@php($role = auth()->user()->role->value)
@php($headers = ['Student', 'Placement', 'Supervisor', 'Hours / Progress', $detailLabel, 'Action'])
@extends('layouts.app')

@section('title', $title)
@section('header_title', $title)
@section('header_description', $description)
@section('header_actions')
  <a href="{{ route("web.{$role}.dashboard.index") }}" class="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:bg-background">Back to Dashboard</a>
@endsection

@section('content')
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-primary-500/20 bg-primary-50 p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-primary-700">Students listed</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ $students->count() }}</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Required hours</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ number_format($students->sum('required_hours'), 2) }}</p>
        <p class="mt-1 text-xs text-text-subtle">total assigned hours</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-text-muted">Rendered hours</p>
        <p class="mt-2 text-2xl font-bold text-text">{{ number_format($students->sum(fn($ojt) => $ojt->rendered_hours), 2) }}</p>
        <p class="mt-1 text-xs text-text-subtle">approved attendance hours</p>
      </div>
    </div>

    <x-table :headers="$headers">
      @forelse ($students as $ojt)
        <x-table.row :model="$ojt" routePrefix="student-ojts">
          <x-table.cell alignment="left" :model="$ojt->student">
            {{ $ojt->student?->full_name ?? 'Unknown student' }}
          </x-table.cell>

          <x-table.cell alignment="left" :model="$ojt->office">
            {{ $ojt->office?->name ?? 'Unassigned' }}
            <span class="block text-xs text-text-subtle">{{ $ojt->academic_year }} / {{ $ojt->term?->value }}</span>
          </x-table.cell>

          <x-table.cell alignment="left" :model="$ojt->supervisor">
            {{ $ojt->supervisor?->full_name ?? 'Unassigned' }}
          </x-table.cell>

          <x-table.cell alignment="left">
            <span class="font-medium text-text">{{ number_format($ojt->rendered_hours, 2) }} / {{ number_format($ojt->required_hours, 2) }} hrs</span>
            <span class="block text-xs text-primary-600">{{ number_format($ojt->progress_percent, 1) }}%</span>
          </x-table.cell>

          <x-table.cell alignment="left">{{ $detailValue($ojt) }}</x-table.cell>

          <x-table.cell>
            <a href="{{ route("web.{$role}.student-ojts.show", ['studentOjt' => $ojt]) }}" class="rounded-md bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-600 hover:text-white">
              View details
            </a>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No students found for this category." :colspan="count($headers)" />
      @endforelse
    </x-table>
  </div>
@endsection
