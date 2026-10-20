@php
  $role = auth()->user()->role->value;

  $routes = [
    [
      "route" => "dashboard.index",
      "active" => "dashboard.*",
      "label" => "Dashboard",
      "icon" => "dashboard",
      "role" => ["instructor", "admin", "super-admin"],
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

<aside class="border-border bg-surface flex min-h-screen w-64 flex-col border-r">
  <div class="border-border flex h-20 items-center border-b px-6">
    <div class="flex items-center gap-3">
      <img
        src="{{ asset('images/logo.png') }}"
        alt="OJTrack logo"
        class="h-12 w-12 object-contain"
      />
      <span class="text-text text-xl font-bold">OJTrack</span>
    </div>
  </div>

  <nav class="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
    @foreach ($routes as $item)
      @if (in_array($role, $item["role"]))
        @php
          $route = "web.{$role}.{$item["route"]}";
          $activeRoute = "web.{$role}." . ($item["active"] ?? $item["route"]);
        @endphp

        <a
          href="{{ route($route) }}"
          @class ([
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
            "bg-primary-50 text-primary-700" => request()->routeIs($activeRoute),
            "text-text-muted hover:bg-background hover:text-text" => !request()->routeIs(
              $activeRoute
            )
          ])
        >
          <span class="material-symbols-outlined">{{ $item["icon"] }}</span>
          <span>{{ $item["label"] }}</span>
        </a>
      @endif
    @endforeach
  </nav>

  <div class="border-border border-t p-4">
    <button
      type="button"
      data-dialog-open="logout-dialog"
      class="bg-danger-500 hover:bg-danger-600 flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
    >
      <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
        >logout</span
      >
      <span>Logout</span>
    </button>
  </div>

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

      <x-form.form action="{{ route('web.logout') }}" method="POST" class="contents">
        <button
          type="submit"
          class="bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none"
        >
          Log out
        </button>
      </x-form.form>
    </x-slot:actions>
  </x-u-i.dialog>
</aside>
