@php
  $size = $sizePixels();
  $editIconSize = match ($size) {
    48 => 16,
    80 => 20,
    120 => 24,
    default => 20,
  };
  $editIconContainerSize = $editIconSize + 8;
  $avatarId = "avatar-" . uniqid();
@endphp

<div class="relative inline-block" id="{{ $avatarId }}">
  <!-- Avatar Circle -->
  <div
    class="border-border bg-surface relative flex items-center justify-center overflow-hidden rounded-full border-2"
    style="width: {{ $size }}px; height: {{ $size }}px;"
  >
    <!-- Profile Picture -->
    <img
      src="{{ $hasProfilePicture() ? $profilePictureDataUrl() : '' }}"
      alt="Profile"
      class="w-full h-full object-cover z-10 {{ $hasProfilePicture() ? '' : 'hidden' }}"
      data-avatar-img
    />

    <!-- Initials Fallback -->
    <!-- Initials Fallback -->
    <div
      class="bg-primary-500 w-full h-full flex items-center justify-center absolute inset-0 {{ $hasProfilePicture() ? 'hidden' : '' }}"
      data-avatar-fallback
    >
      <span class="font-bold text-white" style="font-size: {{ $size * 0.35 }}px;">
        {{ $initials() }}
      </span>
    </div>
  </div>

  @if ($isEditable())
    <!-- Edit Icon Button (Lower Right Corner) -->
    <button
      type="button"
      data-avatar-edit-trigger
      class="bg-primary-500 hover:bg-primary-600 absolute right-0 bottom-0 z-20 flex items-center justify-center rounded-full shadow-md transition-colors"
      style="
        width: {{ $editIconContainerSize }}px;
        height: {{ $editIconContainerSize }}px;
        transform: translate(2px, 2px);
      "
    >
      <span
        class="material-symbols-outlined text-text"
        style="font-size: {{ $editIconSize }}px;"
      >
        edit
      </span>
    </button>

    <!-- Hidden File Input -->
    <input
      type="file"
      id="avatar-file-input-{{ $user?->id ?? uniqid() }}"
      name="{{ $inputName }}"
      accept="image/*"
      class="hidden"
      data-avatar-file-input
    />

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const container = document.getElementById("{{ $avatarId }}");
        if (!container) return;

        const trigger = container.querySelector("[data-avatar-edit-trigger]");
        const fileInput = container.querySelector("[data-avatar-file-input]");
        const img = container.querySelector("[data-avatar-img]");
        const fallback = container.querySelector("[data-avatar-fallback]");

        if (trigger && fileInput) {
          trigger.addEventListener("click", function (e) {
            e.preventDefault();
            fileInput.click();
          });

          fileInput.addEventListener("change", function (e) {
            if (this.files && this.files[0]) {
              const reader = new FileReader();
              reader.onload = function (e) {
                img.src = e.target.result;
                img.classList.remove("hidden");
                if (fallback) fallback.classList.add("hidden");
              };
              reader.readAsDataURL(this.files[0]);
            }
          });
        }
      });
    </script>
  @endif
</div>
