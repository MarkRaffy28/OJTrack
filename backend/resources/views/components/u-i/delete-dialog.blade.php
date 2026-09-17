@props([
  'title' => 'Confirm Delete',
  'item' => 'this item',
  'cancelLabel' => 'Cancel',
  'deleteLabel' => 'Delete',
])

@php
  $id = "delete-dialog-" . uniqid();
@endphp

<button
  type="button"
  data-dialog-open="{{ $id }}"
  class="font-medium text-gray-700 hover:underline"
>
  Delete
</button>

<x-u-i.dialog
  :id="$id"
  :title="$title"
  description="Are you sure you want to delete {{ $item }}?"
>
  <x-slot:actions>
    <button
      type="button"
      data-dialog-dismiss
      class="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
    >
      {{ $cancelLabel }}
    </button>

    <button
      type="submit"
      class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      {{ $deleteLabel }}
    </button>
  </x-slot:actions>
</x-u-i.dialog>
