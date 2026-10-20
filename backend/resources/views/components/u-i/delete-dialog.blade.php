<x-u-i.dialog
  id="global-delete-dialog"
  :title="$title"
  :description="'Are you sure you want to delete ' . $item . '?'"
>
  <x-slot:actions>
    <form id="global-delete-form" method="POST" action="" class="contents">
      @csrf
      @method ("DELETE")

      <button
        type="button"
        data-dialog-dismiss
        class="border-border text-text bg-surface hover:bg-background focus:ring-primary-500 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
      >
        {{ $cancelLabel }}
      </button>

      <button
        type="submit"
        class="bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none"
      >
        {{ $deleteLabel }}
      </button>
    </form>
  </x-slot:actions>
</x-u-i.dialog>
