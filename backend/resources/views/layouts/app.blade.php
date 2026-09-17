<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200"
    rel="stylesheet"
  />

  <title>
    @hasSection ("title")
      @yield ("title")
      | OJTrack
    @else
      OJTrack
    @endif
  </title>

  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"
  />

  @vite (["resources/css/app.css", "resources/js/app.js"])

  <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
</head>

<body>
  <div
    class="pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto flex w-full max-w-md flex-col items-center gap-3"
  >
    @foreach (["success", "error", "warning", "info"] as $type)
      @if (session($type))
        <x-alert :type="$type"> {{ session($type) }} </x-alert>
      @endif
    @endforeach
  </div>

  @if (auth()->check() && !request()->routeIs('web.login*', 'web.register*', 'login*', 'register*') && !request()->is('web/login*', 'web/register*', 'login*', 'register*'))
    <div
      class="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible"
    >
      <x-navigation.sidebar />

      <div
        class="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible"
      >
        @hasSection ("header_title")
          <x-navigation.header
            :title="View::yieldContent('header_title')"
            :description="View::yieldContent('header_description')"
          >
            <x-slot:actions>
              @yield ("header_actions")
            </x-slot:actions>
          </x-navigation.header>
        @endif

        <main class="flex-1 overflow-y-auto p-4 print:overflow-visible print:p-0">
          @yield ("content")
        </main>
      </div>
    </div>
  @else
    @yield ("content")
  @endif

  @stack ("scripts")
