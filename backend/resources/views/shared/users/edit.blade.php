@php
  use App\Enums\UserRole;

  $route = "web.{$currentRole}.users.update";
@endphp

@extends ("layouts.app")

@section ("title", "Edit User")
@section ("header_title", "Edit User")
@section ("header_description", "Update user information and account details.")
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form
      method="PUT"
      action="{{ route($route, $user) }}"
      enctype="multipart/form-data"
    >
      <div class="space-y-6">
        {{-- PROFILE HEADER --}}
        <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div class="shrink-0">
              <x-avatar mode="edit" size="md" :user="$user" />
            </div>

            <div class="grid flex-1 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.identity field="user_id" :user="$user" mode="edit" />
              </div>
              <div class="min-w-0">
                <x-fields.account field="status" :user="$user" />
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
                <div class="min-w-0 sm:col-span-2" data-role-display>
                  <x-fields.account field="role" :user="$user" mode="view" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.password field="password" :required="false" :user="$user" />
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
                  <x-fields.identity field="username" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.identity field="first_name" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.identity field="middle_name" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.identity field="last_name" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.identity field="extension_name" :user="$user" />
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
                  <x-fields.personal field="birth_date" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.personal field="gender" :user="$user" />
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
                  <x-fields.contact field="contact_number" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.contact field="email" :user="$user" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.contact field="home_address" :user="$user" />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.contact field="present_address" :user="$user" />
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
                    <x-fields.student-detail field="year" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.student-detail field="program" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.student-detail field="major" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.student-detail field="section" :user="$user" />
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
                    <x-fields.emergency-contact field="name" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="relationship" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="contact_number" :user="$user" />
                  </div>
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.emergency-contact field="address" :user="$user" />
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
                    <x-fields.supervisor-detail field="office_id" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.supervisor-detail field="position" :user="$user" />
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
                    <x-fields.instructor-detail field="program" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.instructor-detail field="department" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.instructor-detail field="section" :user="$user" />
                  </div>
                </div>
              </section>
            @endif
          </div>
        </div>

        {{-- ACTIONS --}}
        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$currentRole}.users.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </x-form.form>
  </div>

  <script>
    function initStatusRequired() {
      if (typeof $ === "undefined") {
        setTimeout(initStatusRequired, 100);
        return;
      }

      $(document).ready(function () {
        const $status = $('select[name="status"]');
        const $role = $('input[name="role"]');
        const $roleDisplay = $role.closest("[data-role-display]");

        const statusFields = [
          "username",
          "birth_date",
          "gender",
          "home_address",
          "present_address",
          "contact_number",
          "email",
        ];

        const studentFields = [
          "emergency_contact[name]",
          "emergency_contact[relationship]",
          "emergency_contact[contact_number]",
          "emergency_contact[address]",
        ];

        function toggleRequired($field, isRequired) {
          $field.prop("required", isRequired);
          $field
            .closest("div")
            .parent()
            .parent()
            .find("[data-required-marker]")
            .toggleClass("hidden", !isRequired);
        }

        function updateRequired() {
          if (!$status.length) return;

          const status = $status.val();
          const isActiveOrSuspended = status === "active" || status === "suspended";
          const hideAdmin = status === "pre_activated" && $role.val() === "admin";

          $roleDisplay.toggle(!hideAdmin);

          statusFields.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) toggleRequired($field, isActiveOrSuspended);
          });

          studentFields.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) toggleRequired($field, isActiveOrSuspended);
          });
        }

        $status.on("change", updateRequired);
        updateRequired();
      });
    }

    initStatusRequired();
  </script>
@endsection
