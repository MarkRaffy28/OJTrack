@php($role = auth()->user()->role->value)
@php($evaluation = $studentOjt->evaluation)
@extends('layouts.app')
@section('title', 'Evaluation')
@section('header_title', 'Evaluation')
@section('header_description', 'Supervisor assessment for ' . ($studentOjt->student?->full_name ?? 'student'))
@section('header_actions')
  <div class="flex items-center gap-2">
    <a href="{{ route("web.{$role}.evaluations." . ($evaluation ? 'edit' : 'create-for'), $studentOjt) }}" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">{{ $evaluation ? 'Edit Evaluation' : 'Create Evaluation' }}</a>
    @if ($evaluation)
      <form method="POST" action="{{ route("web.{$role}.evaluations.destroy", $studentOjt) }}" class="inline-flex">
        @csrf
        @method('DELETE')
        <x-u-i.delete-dialog item="this evaluation" title="Delete Evaluation" delete-label="Delete Evaluation" />
      </form>
    @endif
  </div>
@endsection
@section('content')
  <div class="max-w-3xl space-y-4">
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div><h2 class="text-lg font-semibold text-gray-900">{{ $studentOjt->student?->full_name }}</h2><p class="text-sm text-gray-500">{{ $studentOjt->office?->name ?? 'Unassigned office' }} · {{ $studentOjt->academic_year }} / {{ $studentOjt->term?->value }}</p></div>
        <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{{ ucfirst($evaluation?->status?->value ?? 'not started') }}</span>
      </div>
      @if ($evaluation)
        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          @foreach ([['Quality', 'quality', 40], ['Productivity', 'productivity', 20], ['Initiative', 'initiative', 20], ['Time Management / Punctuality', 'time_management_punctuality', 10], ['Proper Attire / Grooming', 'proper_attire_grooming', 10]] as [$label, $field, $max])
            <div class="rounded-lg bg-gray-50 p-3"><p class="text-xs text-gray-500">{{ $label }}</p><p class="mt-1 text-lg font-semibold">{{ $evaluation->{$field} }} <span class="text-xs font-normal text-gray-500">/ {{ $max }}</span></p></div>
          @endforeach
        </div>
        <div class="mt-6 border-t border-gray-100 pt-4"><p class="text-sm text-gray-500">Total Score</p><p class="text-3xl font-bold text-primary-700">{{ $evaluation->total_points }} / 100</p></div>
        @if ($evaluation->remarks)<div class="mt-4 rounded-lg bg-gray-50 p-4"><p class="text-xs font-semibold uppercase text-gray-500">Remarks</p><p class="mt-1 whitespace-pre-line text-sm text-gray-700">{{ $evaluation->remarks }}</p></div>@endif
      @else
        <p class="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No evaluation has been recorded for this OJT yet.</p>
      @endif
    </div>
  </div>
@endsection
