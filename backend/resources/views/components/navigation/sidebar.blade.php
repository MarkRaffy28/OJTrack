@php
  $role = auth()->user()->role->value;

  $routes = [
    [
      "route" => "dashboard.index",
      "active" => "dashboard.*",
      "label" => "Dashboard",
      "icon" => "dashboard",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "users.index",
      "active" => "users.*",
      "label" => "Users",
      "icon" => "people",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "offices.index",
      "active" => "offices.*",
      "label" => "Offices",
      "icon" => "business",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "assignments.index",
      "active" => "assignments.*",
      "label" => "Assignments",
      "icon" => "assignment",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "student-ojts.index",
      "active" => "student-ojts.*",
      "label" => "Student OJT",
      "icon" => "school",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "reports.index",
      "active" => "reports.*",
      "label" => "Reports",
      "icon" => "description",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "evaluations.index",
      "active" => "evaluations.*",
      "label" => "Evaluations",
      "icon" => "fact_check",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "attendance.index",
      "active" => "attendance.*",
      "label" => "Attendance",
      "icon" => "schedule",
      "role" => ["instructor", "admin"],
    ],
    [
      "route" => "settings.index",
      "active" => "settings.*",
      "label" => "Settings",
      "icon" => "settings",
      "role" => ["admin"],
    ],
  ];
@endphp

<aside class="border-border bg-surface flex min-h-screen w-64 flex-col border-r">
  <div class="border-border flex h-20 items-center border-b px-6">
    <div class="flex items-center gap-3">
      <img
        src="{{ asset('images/ojt.png') }}"
        alt="OJTrack logo"
        class="h-12 w-12 object-contain"
      />
      <span class="text-text text-xl font-bold">OJTrack</span>
    </div>
  </div>

  <nav class="flex-1 space-y-1 p-4">
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
    <x-form.form action="{{ route('web.logout') }}" method="POST">
      <button
        type="submit"
        class="bg-danger-500 hover:bg-danger-600 flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
      >
        <span class="material-symbols-outlined">logout</span>
        <span>Logout</span>
      </button>
    </x-form.form>
  </div>
</aside>
