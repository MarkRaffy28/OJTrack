@php
  use App\Enums\UserRoles;

  $authRole = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "View User")

@section ("header_title", "View User")

@section ("header_description", "Viewing details for {$user->full_name}.")

@section ("header_actions")
  <div class="flex items-center gap-2">
    <a
      href="{{ route("web.{$authRole}.users.index") }}"
      class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
    >
      Cancel
    </a>

    <a
      href="{{ route('web.' . auth()->user()->role->value . '.users.edit', $user) }}"
      class="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
    >
      Edit User
    </a>
  </div>
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- =========================================================
         PROFILE HEADER (full width)
    ========================================================== --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <x-avatar mode="view" size="md" :user="$user" />

        <div class="flex flex-col items-center gap-2 sm:items-start">
          <p class="text-text text-lg font-bold">{{ $user->full_name }}</p>

          <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span
              class="bg-primary-50 text-primary-700 ring-primary-600/20 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset"
            >
              {{ $user->role->value }}
            </span>

            <span
              class="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 capitalize ring-1 ring-green-600/20 ring-inset"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              {{
                str_replace(
                  "_",
                  " ",
                  $user->status->value,
                )
              }}
            </span>
          </div>

          <div class="text-text-muted">
            <x-fields.identity field="user_id" :user="$user" mode="view" />
          </div>
        </div>
      </div>
    </div>

    {{-- =========================================================
         TWO-COLUMN LAYOUT
    ========================================================== --}}
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {{-- LEFT COLUMN --}}
      <div class="space-y-6">
        {{-- BASIC INFORMATION (Role + Identity) --}}
        <div
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div class="divide-border-muted divide-y">
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.account field="role" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.identity field="user_id" :user="$user" mode="view" />
              </div>
            </div>
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.identity field="username" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.identity field="first_name" :user="$user" mode="view" />
              </div>
            </div>
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.identity field="middle_name" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.identity field="last_name" :user="$user" mode="view" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-0 p-5">
                <x-fields.identity field="extension_name" :user="$user" mode="view" />
              </div>
            </div>
          </div>
        </div>

        {{-- PERSONAL INFORMATION --}}
        <div
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
          >
            <div class="min-w-0 p-5">
              <x-fields.personal field="birth_date" :user="$user" mode="view" />
            </div>
            <div class="min-w-0 p-5">
              <x-fields.personal field="gender" :user="$user" mode="view" />
            </div>
          </div>
        </div>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- CONTACT INFORMATION --}}
        <div
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div class="divide-border-muted divide-y">
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.contact field="contact_number" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.contact field="email" :user="$user" mode="view" />
              </div>
            </div>
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.contact field="home_address" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.contact field="present_address" :user="$user" mode="view" />
              </div>
            </div>
          </div>
        </div>

        {{-- STUDENT --}}
        @if ($user->role === UserRoles::STUDENT)
          <div
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div class="divide-border-muted divide-y">
              <div
                class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              >
                <div class="min-w-0 p-5">
                  <x-fields.student-detail field="year" :user="$user" mode="view" />
                </div>
                <div class="min-w-0 p-5">
                  <x-fields.student-detail field="program" :user="$user" mode="view" />
                </div>
              </div>
              <div
                class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              >
                <div class="min-w-0 p-5">
                  <x-fields.student-detail field="major" :user="$user" mode="view" />
                </div>
                <div class="min-w-0 p-5">
                  <x-fields.student-detail field="section" :user="$user" mode="view" />
                </div>
              </div>
            </div>
          </div>

          <div
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div class="divide-border-muted divide-y">
              <div
                class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              >
                <div class="min-w-0 p-5">
                  <x-fields.emergency-contact field="name" :user="$user" mode="view" />
                </div>
                <div class="min-w-0 p-5">
                  <x-fields.emergency-contact
                    field="relationship"
                    :user="$user"
                    mode="view"
                  />
                </div>
              </div>
              <div
                class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              >
                <div class="min-w-0 p-5">
                  <x-fields.emergency-contact
                    field="contact_number"
                    :user="$user"
                    mode="view"
                  />
                </div>
                <div class="min-w-0 p-5">
                  <x-fields.emergency-contact field="address" :user="$user" mode="view" />
                </div>
              </div>
            </div>
          </div>
        @endif

        {{-- SUPERVISOR --}}
        @if ($user->role === UserRoles::SUPERVISOR)
          <div
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.supervisor-detail field="office_id" :user="$user" mode="view" />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.supervisor-detail field="position" :user="$user" mode="view" />
              </div>
            </div>
          </div>
        @endif

        {{-- INSTRUCTOR --}}
        @if ($user->role === UserRoles::INSTRUCTOR)
          <div
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="divide-border-muted grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0"
            >
              <div class="min-w-0 p-5">
                <x-fields.instructor-detail
                  field="department"
                  :user="$user"
                  mode="view"
                />
              </div>
              <div class="min-w-0 p-5">
                <x-fields.instructor-detail field="section" :user="$user" mode="view" />
              </div>
            </div>
          </div>
        @endif
      </div>
    </div>
  </div>
@endsection
