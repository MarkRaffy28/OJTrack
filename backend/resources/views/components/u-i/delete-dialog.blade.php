<div
  id="global-delete-dialog"
  data-dialog
  class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4"
>
  <div class="bg-surface w-full max-w-md rounded-lg p-6 shadow-xl">
    <h3 id="global-delete-title" class="text-text text-lg font-semibold">{{ $title }}</h3>
    <p id="global-delete-description" class="text-text-muted mt-2 text-sm">Are you sure you want to delete {{ $item }}?</p>

    <form
      id="global-delete-form"
      method="POST"
      action=""
      class="mt-6 flex justify-end gap-3"
    >
      @csrf
      @method ("DELETE")

      <button
        type="button"
        data-dialog-dismiss
        class="border-border text-text hover:bg-background rounded-md border px-4 py-2 text-sm font-medium"
      >
        {{ $cancelLabel }}
      </button>

      <button
        type="submit"
        class="bg-danger-600 hover:bg-danger-700 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        {{ $deleteLabel }}
      </button>
    </form>
  </div>
</div>
