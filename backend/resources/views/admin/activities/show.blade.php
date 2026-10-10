@extends('layouts.app')
@section('title', 'Activity Details')
@section('header_title', 'Activity Details')
@section('header_description', 'Full information for this recorded controller action.')
@section('content')
  <div class="max-w-3xl rounded-xl border border-border bg-surface p-6 shadow-sm">
    <dl class="grid gap-5 sm:grid-cols-2">
      <div><dt class="text-xs font-semibold uppercase text-text-muted">Action</dt><dd class="mt-1 font-medium">{{ $activity->action->description() }}</dd></div>
      <div><dt class="text-xs font-semibold uppercase text-text-muted">Performed At</dt><dd class="mt-1">{{ $activity->created_at->format('M d, Y h:i A') }}</dd></div>
      <div><dt class="text-xs font-semibold uppercase text-text-muted">User</dt><dd class="mt-1">{{ $activity->actor?->full_name ?? 'Deleted user' }}</dd></div>
      <div><dt class="text-xs font-semibold uppercase text-text-muted">Target</dt><dd class="mt-1">{{ $activity->subject ? class_basename($activity->subject_type) . ' #' . $activity->subject_id : 'None' }}</dd></div>
      <div><dt class="text-xs font-semibold uppercase text-text-muted">OJT</dt><dd class="mt-1">{{ $activity->ojt?->student?->full_name ? 'OJT #' . $activity->ojt_id . ' — ' . $activity->ojt->student->full_name : 'None' }}</dd></div>
      <div class="sm:col-span-2"><dt class="text-xs font-semibold uppercase text-text-muted">Description</dt><dd class="mt-1">{{ $activity->description ?? '—' }}</dd></div>
    </dl>
    <a href="{{ route('web.admin.activities.index') }}" class="mt-6 inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium">Back to Activities</a>
  </div>
@endsection
