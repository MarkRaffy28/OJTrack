@php
  $routes = [
    [
      "route" => "dashboard.index",
      "active" => "dashboard.*",
      "path" => "",
      "label" => "Dashboard",
      "icon" => "dashboard",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "section" => "Main",
    ],
    [
      "route" => "users.index",
      "active" => "users.*",
      "label" => "Users",
      "icon" => "people",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "route" => "offices.index",
      "active" => "offices.*",
      "label" => "Offices",
      "icon" => "business",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "route" => "assignments.index",
      "active" => "assignments.*",
      "label" => "Assignments",
      "icon" => "assignment",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "route" => "student-ojts.index",
      "active" => "student-ojts.*",
      "label" => "Student OJT",
      "icon" => "school",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "section" => "Reports",
    ],
    [
      "route" => "reports.index",
      "active" => "reports.*",
      "label" => "Reports",
      "icon" => "description",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "route" => "report-assignments.index",
      "active" => "report-assignments.*",
      "label" => "Report Assignments",
      "icon" => "assignment_turned_in",
      "role" => ["admin", "super-admin"],
    ],
    [
      "route" => "evaluations.index",
      "active" => "evaluations.*",
      "label" => "Evaluations",
      "icon" => "fact_check",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "route" => "attendance.index",
      "active" => "attendance.*",
      "label" => "Attendance",
      "icon" => "schedule",
      "role" => ["instructor", "admin", "super-admin"],
    ],
    [
      "section" => "System",
    ],
    [
      "route" => "settings.index",
      "active" => "settings.*",
      "label" => "Settings",
      "icon" => "settings",
      "role" => ["admin", "super-admin"],
    ],
    [
      "route" => "ojts.index",
      "active" => "ojts.*",
      "label" => "OJT Periods",
      "icon" => "calendar_month",
      "role" => ["admin", "super-admin"],
    ],
    [
      "route" => "activities.index",
      "active" => "activities.*",
      "label" => "Activities",
      "icon" => "history",
      "role" => ["admin", "super-admin"],
    ],
  ];
@endphp

<!-- Mobile backdrop (outside <aside> so the transform doesn't affect it) -->
<div
  data-sidebar-backdrop
  class="bg-text/50 fixed inset-0 z-30 hidden lg:hidden print:hidden"
></div>

<aside
  id="app-sidebar"
  data-sidebar
  data-open="false"
  class="border-border bg-surface fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r transition-transform duration-200 data-[open=true]:translate-x-0 lg:static lg:min-h-screen lg:translate-x-0 print:hidden"
>
  <div
    class="border-border flex h-20 shrink-0 items-center justify-between border-b px-4 lg:px-6"
  >
    <a href="{{ url('/') }}" class="flex min-w-0 items-center gap-3">
      <img
        src="{{ asset('images/logo.png') }}"
        alt="{{ config('app.name') }} logo"
        class="h-12 w-12 shrink-0 object-contain"
      />
      <span class="text-text truncate text-xl font-bold">
        {{ config("app.name") }}
      </span>
    </a>

    <button
      type="button"
      data-sidebar-toggle
      aria-label="Close menu"
      class="text-text-muted border-border hover:bg-primary-50 hover:text-primary-700 focus-visible:ring-primary-500 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
    >
      <span class="material-symbols-outlined material-symbols-xs" aria-hidden="true">
        close
      </span>
    </button>
  </div>

  <nav class="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
    @php
      $pendingSection = null;
    @endphp

    @foreach ($routes as $item)
      @if (isset($item["section"]))
        @php
          $pendingSection = $item["section"];
        @endphp

        @continue
      @endif

      @if (in_array($currentRole, $item["role"]))
        @if ($pendingSection)
          <p
            class="text-text-subtle mt-4 px-3 pb-1 text-xs font-semibold tracking-wider uppercase"
          >
            {{ $pendingSection }}
          </p>
          @php
            $pendingSection = null;
          @endphp
        @endif

        @php
          $route = "{$currentRole}.{$item["route"]}";
          $activeRoute = "{$currentRole}." . ($item["active"] ?? $item["route"]);
          $isActive =
            request()->routeIs($activeRoute) ||
            (isset($item["path"]) && request()->is(trim("{$currentRole}/{$item["path"]}", "/")));
        @endphp

        <a
          href="{{ route($route) }}"
          @if ($isActive) aria-current="page" @endif
          @class ([
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "bg-primary-50 text-primary-700" => $isActive,
            "text-text-muted hover:bg-background hover:text-text" => !$isActive
          ])
        >
          <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">
            {{ $item["icon"] }}
          </span>
          <span class="truncate">
            {{ $item["label"] }}
          </span>
        </a>
      @endif
    @endforeach
  </nav>

  <div class="border-border shrink-0 border-t p-4">
    <div class="mb-3 flex items-center gap-3 px-1">
      <x-avatar :user="$currentUser" size="sm" />

      <div class="min-w-0">
        <p class="text-text truncate text-sm font-medium">
          {{ $currentUser->display_name }}
        </p>
        <p class="text-text-muted truncate text-xs capitalize">
          {{
            str_replace(
              "-",
              " ",
              $currentRole,
            )
          }}
        </p>
      </div>
    </div>

    <button
      type="button"
      data-dialog-open="logout-dialog"
      class="bg-danger-500 hover:bg-danger-600 flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true">
        logout
      </span>
      <span>Logout</span>
    </button>
  </div>
</aside>

<!-- Dialog sits outside <aside>: a transformed parent breaks fixed positioning -->
<x-u-i.dialog
  id="logout-dialog"
  title="Log out"
  description="Are you sure you want to log out?"
>
  <x-slot:actions>
    <button
      type="button"
      data-dialog-dismiss
      class="border-border text-text bg-surface hover:bg-background focus:ring-primary-500 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
    >
      Cancel
    </button>

    <x-form.form
      action="{{ route('logout') }}"
      method="POST"
      class="contents"
    >
      <button
        type="submit"
        class="bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none"
      >
        Log out
      </button>
    </x-form.form>
  </x-slot:actions>
</x-u-i.dialog>

<script>
  $(document).ready(function () {
    const $sidebar = $("[data-sidebar]");
    const $backdrop = $("[data-sidebar-backdrop]");
    const $toggles = $("[data-sidebar-toggle]");

    function setSidebar(open) {
      $sidebar.attr("data-open", open ? "true" : "false");
      $backdrop.toggleClass("hidden", !open);
      $toggles.attr("aria-expanded", open ? "true" : "false");
    }

    $toggles.on("click", function () {
      setSidebar($sidebar.attr("data-open") !== "true");
    });

    $backdrop.on("click", function () {
      setSidebar(false);
    });

    $(document).on("keydown", function (event) {
      if (event.key === "Escape") {
        setSidebar(false);
      }
    });
  });
</script>
