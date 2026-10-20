@php
  use App\Enums\UserRole;
@endphp

@extends ("layouts.app")

@section ("title", "View User")
@section ("header_title", "View User")
@section ("header_description", "Viewing details for {$user->full_name}.")

@section ("header_edit_route", route("web.{$currentRole}.users.edit", $user))
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- PROFILE HEADER --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <x-avatar mode="view" size="md" :user="$user" />

        <div class="flex min-w-0 flex-col items-center gap-1 sm:items-start">
          <p class="text-text truncate text-xl font-bold">{{ $user->full_name }}</p>

          <div class="text-text-muted">
            <x-fields.identity field="user_id" :user="$user" mode="view" />
          </div>
        </div>
      </div>
    </div>

    {{-- TWO-COLUMN LAYOUT --}}
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {{-- LEFT COLUMN --}}
      <div class="space-y-6">
        {{-- ACCOUNT --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >manage_accounts</span
            >
            <h2 class="text-text text-sm font-semibold">Account</h2>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <x-fields.account field="role" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.account field="status" :user="$user" mode="view" />
            </div>
          </div>
        </section>

        {{-- IDENTITY --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >badge</span
            >
            <h2 class="text-text text-sm font-semibold">Identity</h2>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <x-fields.identity field="username" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.identity field="first_name" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.identity field="middle_name" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.identity field="last_name" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.identity field="extension_name" :user="$user" mode="view" />
            </div>
          </div>
        </section>

        {{-- PERSONAL INFORMATION --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >person</span
            >
            <h2 class="text-text text-sm font-semibold">Personal Information</h2>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <x-fields.personal field="birth_date" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.personal field="gender" :user="$user" mode="view" />
            </div>
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- CONTACT INFORMATION --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >call</span
            >
            <h2 class="text-text text-sm font-semibold">Contact Information</h2>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <x-fields.contact field="contact_number" :user="$user" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.contact field="email" :user="$user" mode="view" />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <x-fields.contact field="home_address" :user="$user" mode="view" />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <x-fields.contact field="present_address" :user="$user" mode="view" />
            </div>
          </div>
        </section>

        {{-- STUDENT --}}
        @if ($user->role === UserRole::STUDENT)
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >school</span
              >
              <h2 class="text-text text-sm font-semibold">Academic Details</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.student-detail field="year" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.student-detail field="program" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.student-detail field="major" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.student-detail field="section" :user="$user" mode="view" />
              </div>
            </div>
          </section>

          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >emergency</span
              >
              <h2 class="text-text text-sm font-semibold">Emergency Contact</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.emergency-contact field="name" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.emergency-contact
                  field="relationship"
                  :user="$user"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.emergency-contact
                  field="contact_number"
                  :user="$user"
                  mode="view"
                />
              </div>
              <div class="min-w-0 sm:col-span-2">
                <x-fields.emergency-contact field="address" :user="$user" mode="view" />
              </div>
            </div>
          </section>
        @endif

        {{-- SUPERVISOR --}}
        @if ($user->role === UserRole::SUPERVISOR)
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >work</span
              >
              <h2 class="text-text text-sm font-semibold">Work Details</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.supervisor-detail field="office_id" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.supervisor-detail field="position" :user="$user" mode="view" />
              </div>
            </div>
          </section>
        @endif

        {{-- INSTRUCTOR --}}
        @if ($user->role === UserRole::INSTRUCTOR)
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >groups</span
              >
              <h2 class="text-text text-sm font-semibold">Teaching Details</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.instructor-detail field="program" :user="$user" mode="view" />
              </div>
              <div class="min-w-0">
                <x-fields.instructor-detail
                  field="department"
                  :user="$user"
                  mode="view"
                />
              </div>
              <div class="min-w-0">
                <x-fields.instructor-detail field="section" :user="$user" mode="view" />
              </div>
            </div>
          </section>
        @endif
      </div>
    </div>
  </div>
@endsection
