@props([
  'id',
  'title',
  'description' => null,
])

<div
  id="{{ $id }}"
  class="fixed inset-0 z-50 hidden items-center justify-center"
  data-dialog
  role="dialog"
  aria-modal="true"
>
  <div class="absolute inset-0 bg-black/50" data-dialog-dismiss></div>

  <div class="relative w-full max-w-md rounded-xl bg-white shadow-xl">
    <div class="px-6 pt-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ $title }}</h2>
    </div>

    @if ($description || $slot->isNotEmpty())
      <div class="px-6 py-4">
        @if ($description)
          <p class="text-sm text-gray-600">{{ $description }}</p>
        @endif

        {{ $slot }}
      </div>
    @endif

    @isset ($actions)
      <div class="flex items-center justify-end gap-2 px-6 py-4">{{ $actions }}</div>
    @endisset
  </div>
</div>
