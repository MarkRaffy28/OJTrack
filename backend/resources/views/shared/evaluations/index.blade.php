@php($role = auth()->user()->role->value)
@extends('layouts.app')
@section('title', 'Evaluations')
@section('header_title', 'Evaluations')
@section('header_description', 'Review and manage supervisor evaluations for each student OJT.')
@section('header_actions')
  <a href="{{ route("web.{$role}.evaluations.create") }}" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
    Create Evaluation
  </a>
@endsection
@section('content')
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <x-table :headers="['Student', 'Supervisor', 'Office', 'Total', 'Status', 'Actions']">
      @forelse ($studentOjts as $studentOjt)
        @php($evaluation = $studentOjt->evaluation)
        <x-table.row>
          <x-table.cell>
            <div class="font-medium text-gray-900">{{ $studentOjt->student?->full_name ?? 'Unknown student' }}</div>
            <div class="text-xs text-gray-500">{{ $studentOjt->academic_year }} · {{ $studentOjt->term?->value }}</div>
          </x-table.cell>
          <x-table.cell>{{ $studentOjt->supervisor?->full_name ?? 'Unassigned' }}</x-table.cell>
          <x-table.cell>{{ $studentOjt->office?->name ?? 'Unassigned' }}</x-table.cell>
          <x-table.cell>{{ $evaluation?->total_points ?? '—' }}{{ $evaluation ? ' / 100' : '' }}</x-table.cell>
          <x-table.cell>
            <span class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {{ ucfirst($evaluation?->status?->value ?? 'not started') }}
            </span>
          </x-table.cell>
          <x-table.cell>
            <div class="flex items-center gap-2">
              <a href="{{ route("web.{$role}.evaluations.show", $studentOjt) }}" class="rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-600 hover:text-white">View</a>
              <a href="{{ route("web.{$role}.evaluations." . ($evaluation ? 'edit' : 'create-for'), $studentOjt) }}" class="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-600 hover:text-white">{{ $evaluation ? 'Edit' : 'Evaluate' }}</a>
              @if ($evaluation)
                <form method="POST" action="{{ route("web.{$role}.evaluations.destroy", $studentOjt) }}" class="inline-flex">
                  @csrf
                  @method('DELETE')
                  <x-u-i.delete-dialog item="this evaluation" title="Delete Evaluation" delete-label="Delete Evaluation" />
                </form>
              @endif
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No student OJTs found." :colspan="6" />
      @endforelse
    </x-table>
  </div>
  <x-pagination :paginator="$studentOjts" />
@endsection
