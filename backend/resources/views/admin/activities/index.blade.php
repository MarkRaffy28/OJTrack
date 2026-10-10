@extends('layouts.app')
@section('title', 'Activities')
@section('header_title', 'Activities')
@section('header_description', 'Audit trail of controller actions performed in OJTrack.')
@section('content')
  <div class="space-y-4">
    <form method="GET" class="flex gap-3">
      <input name="action" value="{{ request('action') }}" placeholder="Filter action..." class="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm">
      <button class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white">Filter</button>
    </form>
    <div class="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table class="min-w-full text-left text-sm"><thead class="border-b border-border bg-background"><tr><th class="px-5 py-3 font-semibold">Date</th><th class="px-5 py-3 font-semibold">User</th><th class="px-5 py-3 font-semibold">Action</th><th class="px-5 py-3 font-semibold">Target</th><th class="px-5 py-3 font-semibold">Description</th></tr></thead><tbody>
        @forelse($activities as $activity)
          <tr class="border-b border-border last:border-0"><td class="whitespace-nowrap px-5 py-3 text-text-muted">{{ $activity->created_at->format('M d, Y h:i A') }}</td><td class="px-5 py-3 font-medium">{{ $activity->actor?->full_name ?? 'Deleted user' }}</td><td class="px-5 py-3"><span class="rounded bg-background px-2 py-1 text-xs font-semibold">{{ $activity->action->description() }}</span></td><td class="px-5 py-3 text-text-muted">{{ $activity->subject ? class_basename($activity->subject_type) . ' #' . $activity->subject_id : '—' }}</td><td class="px-5 py-3 text-text-muted">{{ $activity->description }}</td><td class="px-5 py-3"><a href="{{ route('web.admin.activities.show', $activity) }}" class="text-primary-700 hover:underline">View</a></td></tr>
        @empty
          <tr><td colspan="6" class="px-5 py-8 text-center text-text-muted">No activities found.</td></tr>
        @endforelse
      </tbody></table>
    </div>
    <x-pagination :paginator="$activities" />
  </div>
@endsection
