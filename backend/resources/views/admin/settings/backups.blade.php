@extends ('layouts.app')

@section ('title', 'Database Backups')
@section ('header_title', 'Database Backups')
@section ('header_description', 'Create, download, and restore database backups.')

@section ('content')
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="border-border bg-surface rounded-xl border p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-text text-lg font-semibold">Create backup</h2>
          <p class="text-text-muted mt-1 text-sm">Automatic backups run through the Laravel scheduler.</p>
        </div>
        <form method="POST" action="{{ route('web.admin.settings.backups.store') }}">
          @csrf
          <button class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" type="submit">
            <span class="material-symbols-outlined text-base">backup</span> Create Backup
          </button>
        </form>
      </div>
      <p class="text-text-muted text-sm">Current automatic interval: <span class="text-text font-medium">{{ str($interval)->replace('_', ' ')->title() }}</span></p>
      <a class="text-primary-700 mt-2 inline-block text-sm hover:underline" href="{{ route('web.admin.settings.edit') }}">Change automatic backup interval</a>
    </div>

    <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      <div class="border-border border-b p-6"><h2 class="text-text text-lg font-semibold">Available backups</h2></div>
      @forelse ($backupFiles as $backup)
        <div class="border-border flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0">
          <div><p class="text-text font-medium">{{ $backup['name'] }}</p><p class="text-text-muted text-xs">{{ number_format($backup['size'] / 1024, 1) }} KB · {{ date('Y-m-d H:i:s', $backup['created_at']) }}</p></div>
          <div class="flex items-center gap-2">
            <a class="border-border text-text rounded-md border px-3 py-2 text-sm hover:bg-gray-50" href="{{ route('web.admin.settings.backups.download', ['backup' => $backup['path']]) }}">Download</a>
            <form method="POST" action="{{ route('web.admin.settings.backups.restore') }}" onsubmit="return confirm('Restoring will replace the current database. Continue?')">
              @csrf
              <input type="hidden" name="backup" value="{{ $backup['path'] }}">
              <button class="bg-red-600 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-red-700" type="submit">Restore</button>
            </form>
          </div>
        </div>
      @empty
        <p class="text-text-muted p-6 text-sm">No backups have been created yet.</p>
      @endforelse
    </div>
  </div>
@endsection
