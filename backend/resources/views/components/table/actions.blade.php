<td class="px-4 py-3 whitespace-nowrap">
  <div class="flex items-center gap-2 print:hidden">
    @if (in_array("view", $actions))
      <a
        href="{{ $routes['view'] }}"
        class="bg-success-50 text-success-700 hover:bg-success-500 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
      >
        <span class="material-symbols-outlined material-symbols-md">visibility</span>
        View
      </a>
    @endif

    @if (in_array("evaluation", $actions))
      <a
        href="{{ $routes['evaluation'] }}"
        class="bg-primary-50 text-primary-700 hover:bg-primary-600 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
      >
        <span class="material-symbols-outlined material-symbols-md">assignment</span>
        {{ $evaluationLabel }}
      </a>
    @endif

    @if (in_array("edit", $actions))
      <a
        href="{{ $routes['edit'] }}"
        class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
      >
        <span class="material-symbols-outlined material-symbols-md">edit</span>
        Edit
      </a>
    @endif

    @if (in_array("delete", $actions))
      <button
        type="button"
        data-delete-trigger
        data-action="{{ $routes['delete'] }}"
        data-item="{{ $deleteLabel }}"
        data-title="{{ $deleteTitle }}"
        class="bg-danger-50 text-danger-700 hover:bg-danger-500 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
      >
        <span class="material-symbols-outlined material-symbols-md">delete</span>
        Delete
      </button>
    @endif
  </div>
</td>
