@php($role = auth()->user()->role->value)
@extends('layouts.app')

@section('title', 'Create Evaluation')
@section('header_title', 'Create Evaluation')
@section('header_description', isset($studentOjt) ? 'Rate ' . ($studentOjt->student?->full_name ?? 'the trainee') . ' using the 100-point supervisor assessment.' : 'Select a trainee to begin a new supervisor assessment.')

@section('content')
  @if (!isset($studentOjt))
    <form method="GET" action="{{ route("web.{$role}.evaluations.create") }}" class="max-w-3xl space-y-4">
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label for="student_ojt_id" class="block text-sm font-medium text-gray-700">Select trainee</label>
        <select id="student_ojt_id" name="student_ojt_id" required class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500">
          <option value="">Choose a trainee</option>
          @foreach ($studentOjts as $ojt)
            <option value="{{ $ojt->id }}" @selected(request('student_ojt_id') == $ojt->id)>
              {{ $ojt->student?->full_name ?? 'Unknown student' }} — {{ $ojt->academic_year }} / {{ $ojt->term?->value }}
            </option>
          @endforeach
        </select>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Continue</button>
      </div>
    </form>
  @else
  <form method="POST" action="{{ route("web.{$role}.evaluations.store-for", $studentOjt) }}" class="max-w-3xl space-y-4">
    @csrf

    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-6 rounded-lg bg-gray-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Trainee</p>
        <p class="mt-1 text-lg font-semibold text-gray-900">{{ $studentOjt->student?->full_name ?? 'Unknown student' }}</p>
        <p class="text-sm text-gray-500">
          {{ $studentOjt->office?->name ?? 'Unassigned office' }} ·
          {{ $studentOjt->academic_year }} / {{ $studentOjt->term?->value }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        @foreach ([
          ['quality', 'Quality', 40, 'Overall performance and quality of assigned work.'],
          ['productivity', 'Productivity', 20, 'Volume of useful work completed.'],
          ['initiative', 'Initiative', 20, 'Willingness to learn and contribute.'],
          ['time_management_punctuality', 'Time Management / Punctuality', 10, 'Dependability and effective use of time.'],
          ['proper_attire_grooming', 'Proper Attire / Grooming', 10, 'Professional workplace appearance.'],
        ] as [$field, $label, $max, $description])
          <div>
            <label for="{{ $field }}" class="block text-sm font-medium text-gray-700">
              {{ $label }} <span class="text-gray-500">(max {{ $max }})</span>
            </label>
            <p class="mb-1 text-xs text-gray-500">{{ $description }}</p>
            <input id="{{ $field }}" name="{{ $field }}" type="number" min="0" max="{{ $max }}" required value="{{ old($field, 0) }}" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" />
            @error($field)
              <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
          </div>
        @endforeach
      </div>

      <div class="mt-5">
        <label for="remarks" class="block text-sm font-medium text-gray-700">Remarks (optional)</label>
        <textarea id="remarks" name="remarks" rows="4" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500">{{ old('remarks') }}</textarea>
        @error('remarks')
          <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
        @enderror
      </div>

      <div class="mt-5">
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500">
          <option value="draft" @selected(old('status', 'draft') === 'draft')>Draft</option>
          <option value="submitted" @selected(old('status') === 'submitted')>Submitted</option>
          <option value="finalized" @selected(old('status') === 'finalized')>Finalized</option>
        </select>
        @error('status')
          <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
        @enderror
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <a href="{{ route("web.{$role}.evaluations.show", $studentOjt) }}" class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</a>
      <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Create Evaluation</button>
    </div>
  </form>
  @endif
@endsection
