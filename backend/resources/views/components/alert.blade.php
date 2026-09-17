@php
  $styles = [
    "success" => [
      "container" => "border-green-200 bg-green-50 text-green-800",
      "icon" => "check_circle",
    ],
    "error" => [
      "container" => "border-red-200 bg-red-50 text-red-800",
      "icon" => "error",
    ],
    "warning" => [
      "container" => "border-yellow-200 bg-yellow-50 text-yellow-800",
      "icon" => "warning",
    ],
    "info" => [
      "container" => "border-blue-200 bg-blue-50 text-blue-800",
      "icon" => "info",
    ],
  ];

  $style = $styles[$type] ?? $styles["info"];
@endphp

<div
  {{
    $attributes->merge([
      "class" => "pointer-events-auto flex w-full items-center gap-3 rounded-lg border p-4 shadow-lg transition-opacity duration-300 {$style["container"]}",
      "role" => "alert",
      "data-auto-hide" => $duration,
    ])
  }}
>
  <span class="material-symbols-outlined shrink-0">{{ $style["icon"] }}</span>

  <div class="flex-1">
    @if ($title)
      <p class="font-semibold">{{ $title }}</p>
    @endif

    <div class="text-sm">{{ $slot }}</div>
  </div>

  <button
    type="button"
    data-alert-dismiss
    class="material-symbols-outlined shrink-0 rounded-md p-1 text-current/70 transition-colors hover:bg-black/5 hover:text-current"
    aria-label="Dismiss notification"
  >
    close
  </button>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-auto-hide]").forEach(function (alert) {
      const duration = Number(alert.dataset.autoHide);
      const dismiss = function () {
        alert.classList.add("opacity-0");
        window.setTimeout(function () {
          alert.remove();
        }, 300);
      };

      const dismissButton = alert.querySelector("[data-alert-dismiss]");
      if (dismissButton) dismissButton.addEventListener("click", dismiss);
      if (duration > 0) window.setTimeout(dismiss, duration);
    });
  });
</script>
