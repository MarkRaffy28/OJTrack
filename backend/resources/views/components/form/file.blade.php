@php
  $dotName = str_replace(["[", "]"], [".", ""], $name);
  $dotName = rtrim($dotName, ".");
  $hasError = $errors->has($dotName);
  $files = is_array($value) ? $value : ($value ? [$value] : []);
  $canAddMore = count($files) < $maxFiles;
@endphp

<div>
  @if ($label)
    <label
      @class ([
        "mb-2 block text-xs font-bold uppercase tracking-wider",
        "text-danger-500" => $hasError,
        "text-text-muted" => !$hasError
      ])
      for="{{ $id }}"
    >
      {{ $label }}
      <span data-required-marker @class (["text-danger-500", "hidden" => !$required])>
        *
      </span>
    </label>
  @endif

  <div>
    <div id="chip-container-{{ $id }}" class="mb-3 flex flex-wrap gap-2">
      @foreach ($files as $index => $file)
        @php
          $filePath = is_array($file) ? $file["path"] ?? null : $file;
          $fileName = is_array($file) ? $file["name"] ?? $filePath : basename($file);
          $fileUrl = $filePath && \Illuminate\Support\Str::startsWith($filePath, ['http://', 'https://'])
            ? $filePath
            : ($filePath ? asset('storage/' . ltrim($filePath, '/')) : null);
        @endphp

        <div
          data-file-chip="{{ $index }}"
          class="bg-background-variant inline-flex items-center gap-2 rounded-md px-3 py-2"
        >
          <span class="material-symbols-outlined text-xs">description</span>
          @if ($readonly && $fileUrl)
            <a href="{{ $fileUrl }}" target="_blank" rel="noopener" class="text-primary-600 text-sm hover:underline" title="Open file">
              {{ $fileName }}
            </a>
          @else
            <span class="text-text text-sm"> {{ $fileName }} </span>
          @endif
          @if (!$readonly)
            <button
              type="button"
              tabindex="-1"
              data-file-remove="{{ $index }}"
              data-file-path="{{ $filePath }}"
              class="text-text-subtle hover:text-danger-500 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          @endif
        </div>
      @endforeach
    </div>

    @if (!$readonly && $canAddMore)
      <input
        type="file"
        id="{{ $id }}"
        name="{{ $name }}{{ $maxFiles > 1 ? '[]' : '' }}"
        class="hidden"
        {{ $maxFiles > 1 ? "multiple" : "" }}
      />
      <input
        type="file"
        id="trigger-{{ $id }}"
        {{ $maxFiles > 1 ? "multiple" : "" }}
        @if($accept) accept="{{ $accept }}" @endif
        {{ $required && count($files) == 0 ? "required" : "" }}
        {{ $disabled ? "disabled" : "" }}
        @class ([
          "block w-full cursor-pointer rounded-md border-2 px-3 py-2 text-sm text-text",
          "border-border bg-background" => !$hasError,
          "border-danger-500 bg-background" => $hasError,
          "file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold",
          "file:bg-primary file:text-on-primary hover:file:bg-primary-hover"
        ])
      />
    @endif
  </div>

  @error ($dotName)
    <p class="text-danger-500 mt-1 text-sm">{{ $message }}</p>
  @enderror
  @if($errors->has($dotName . '.*'))
    @foreach($errors->get($dotName . '.*') as $errorsArray)
      @foreach($errorsArray as $error)
        <p class="text-danger-500 mt-1 text-sm">{{ $error }}</p>
      @endforeach
    @endforeach
  @endif
</div>

@if (!$readonly)
  <script>
    $(function () {
      const actualInput = $("#{{ $id }}")[0];
      const triggerInput = $("#trigger-{{ $id }}");
      const chipContainer = $("#chip-container-{{ $id }}");
      let dt = new DataTransfer();

      $("[data-file-remove]").on("click", function () {
        const chip = $(this).closest("[data-file-chip]");
        const path = $(this).data("file-path");

        if (path) {
          $("<input>")
            .attr("type", "hidden")
            .attr("name", "remove_document_paths[]")
            .val(path)
            .appendTo(chipContainer.closest("form"));
        }

        chip.remove();
      });

      if (triggerInput.length > 0) {
        triggerInput.on("change", function () {
          const newFiles = this.files;
          const maxFiles = {{ $maxFiles }};
          const existingCount = chipContainer.children().length;
          
          for (let i = 0; i < newFiles.length; i++) {
            if (existingCount + dt.files.length >= maxFiles) break;

            const file = newFiles[i];
            dt.items.add(file);
            
            const chipHtml = `
              <div class="bg-background-variant inline-flex items-center gap-2 rounded-md px-3 py-2" data-new-file-name="${file.name}">
                <span class="material-symbols-outlined text-xs">description</span>
                <span class="text-text text-sm">${file.name}</span>
                <button type="button" tabindex="-1" class="text-text-subtle hover:text-danger-500 transition-colors remove-new-file" data-file-name="${file.name}">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            `;
            chipContainer.append(chipHtml);
          }
          
          actualInput.files = dt.files;
          this.value = '';

          if (actualInput.files.length > 0) {
            triggerInput.prop('required', false);
          }
        });

        chipContainer.on("click", ".remove-new-file", function () {
          const fileName = $(this).data("file-name");
          const newDt = new DataTransfer();
          
          for (let i = 0; i < dt.files.length; i++) {
            if (dt.files[i].name !== fileName) {
              newDt.items.add(dt.files[i]);
            }
          }
          
          dt = newDt;
          actualInput.files = dt.files;
          $(this).parent().remove();

          if (actualInput.files.length === 0 && {{ count($files) }} === 0 && {{ $required ? 'true' : 'false' }}) {
            triggerInput.prop('required', true);
          }
        });
      }
    });
  </script>
@endif
