<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="csrf-token" content="{{ csrf_token() }}" />

  <title>
    @hasSection ("title")
      @yield ("title")
      | {{ config("app.name") }}
    @else
      {{ config("app.name") }}
    @endif
  </title>

  <link rel="shortcut icon" href="{{ asset('images/logo.png') }}" type="image/png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200"
    rel="stylesheet"
  />

  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css"
  />

  <link
    href="https://fonts.googleapis.com/css2?family=Chewy&family=Chiron+GoRound+TC:wght@200..900&family=Chiron+Sung+HK:ital,wght@0,200..900;1,200..900&family=East+Sea+Dokdo&family=Gamja+Flower&family=Gothic+A1&family=Hi+Melody&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Jua&family=Pinyon+Script&family=Poor+Story&family=Single+Day&display=swap"
    rel="stylesheet"
  />

  @vite (["resources/css/app.css", "resources/js/app.js"])

  <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
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

  @if (auth()->check() &&
    !request()->routeIs("login*", "register*", "login*", "register*") &&
    !request()->is("web/login*", "web/register*", "login*", "register*"))
    <div
      class="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible"
    >
      <x-navigation.sidebar />

      <div
        class="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible"
      >
        @if (isset($breadcrumbs))
          <x-navigation.breadcrumbs :items="$breadcrumbs" />
        @endif

        @hasSection ("header_title")
          <x-navigation.header
            :title="View::yieldContent('header_title')"
            :description="View::yieldContent('header_description') ?: null"
            :dashboard="View::hasSection('header_dashboard')"
            :print="View::hasSection('header_print')"
            :open-print-in-new-tab="!View::hasSection('header_disable_open_print_in_new_tab')"
            :show-cohort-selector="View::hasSection('header_show_cohort_selector')"
            :create-route="View::yieldContent('header_create_route') ?: null"
            :create-button-text="View::yieldContent('header_create_button_text') ?: 'Create'"
            :edit-route="View::yieldContent('header_edit_route') ?: null"
            :edit-button-text="View::yieldContent('header_edit_button_text') ?: 'Edit'"
            :go-back="View::hasSection('header_go_back')"
          >
            @hasSection ("header_actions")
              <x-slot:actions>
                @yield ("header_actions")
              </x-slot:actions>
            @endif

            @hasSection ("header_filters")
              <x-slot:filters>
                @yield ("header_filters")
              </x-slot:filters>
            @endif
          </x-navigation.header>
        @endif

        <main class="flex-1 overflow-y-auto p-4 print:overflow-visible print:p-0">
          @yield ("content")
        </main>

        <x-u-i.delete-dialog />
      </div>
    </div>
  @else
    @yield ("content")
  @endif

  @stack ("scripts")
