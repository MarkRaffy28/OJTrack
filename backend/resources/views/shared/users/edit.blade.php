@php
  use App\Enums\UserRoles;

  $authRole = auth()->user()->role->value;
  $route = "web.{$authRole}.users.update";

@endphp

@extends ("layouts.app")

@section ("title", "Edit User")

@section ("header_title", "Edit User")

@section ("header_description", "Update the user's information and account details.")

@section ("content")
  <div class="mx-auto w-full max-w-6xl">

    <x-form.form
      method="PUT"
      action="{{ route($route, $user) }}"
      enctype="multipart/form-data"
    >
      <div class="space-y-6">

        {{-- =========================================================
             TOP: AVATAR + STATUS + USER ID
        ========================================================== --}}
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center">

        {{-- AVATAR - LEFT --}}
        <div class="shrink-0">
            <x-avatar mode="edit" size="md" :user="$user" />
        </div>

        {{-- USER ID + STATUS - RIGHT --}}
        <div class="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">

            <div class="min-w-0">
                <x-fields.identity
                    field="user_id"
                    :user="$user"
                    mode="edit"
                />
            </div>

            <div class="min-w-0">
                <x-fields.account
                    field="status"
                    :user="$user"
                />
            </div>

        </div>

    </div>
</div>

        {{-- =========================================================
             TWO-COLUMN LAYOUT
        ========================================================== --}}
        <div class="!mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {{-- LEFT COLUMN --}}
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">

            {{-- ACCOUNT INFORMATION --}}
            <div>
              <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.identity field="username" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.password field="password" :required="false" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.account field="role" :user="$user" mode="view" />
                </div>
              </div>
            </div>

            {{-- IDENTITY --}}
            <div class="mt-6 border-t border-border-muted pt-6">
              <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
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
            </div>

            {{-- PERSONAL --}}
            <div class="mt-6 border-t border-border-muted pt-6">
              <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.personal field="birth_date" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.personal field="gender" :user="$user" />
                </div>
              </div>
            </div>

          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">

            {{-- CONTACT INFORMATION --}}
            <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.contact field="contact_number" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.contact field="email" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.contact field="home_address" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.contact field="present_address" :user="$user" />
                </div>
              </div>
            </div>

            {{-- STUDENT --}}
            @if ($user->role === UserRoles::STUDENT)
              <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
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
              </div>

              <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="name" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="relationship" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="contact_number" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact field="address" :user="$user" />
                  </div>
                </div>
              </div>
            @endif

            {{-- SUPERVISOR --}}
            @if ($user->role === UserRoles::SUPERVISOR)
              <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.supervisor-detail field="office_id" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.supervisor-detail field="position" :user="$user" />
                  </div>
                </div>
              </div>
            @endif

            {{-- INSTRUCTOR --}}
            @if ($user->role === UserRoles::INSTRUCTOR)
              <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.instructor-detail field="department" :user="$user" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.instructor-detail field="section" :user="$user" />
                  </div>
                </div>
              </div>
            @endif

          </div>

        </div>

        {{-- =========================================================
             ACTIONS
        ========================================================== --}}
        <div class="flex items-center justify-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <a
            href="{{ route("web.{$authRole}.users.index") }}"
            class="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-background"
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

        const conditionalNames = [
          "username",
          "password",
          "middle_name",
          "extension_name",
          "birth_date",
          "gender",
          "contact_number",
          "email",
          "home_address",
          "present_address",
        ];

        const emergencyContactNames = [
          "emergency_contact[name]",
          "emergency_contact[relationship]",
          "emergency_contact[contact_number]",
          "emergency_contact[address]",
        ];

        function updateRequired() {
          if (!$status.length) return;
          const isActive = $status.val() === "active";

          conditionalNames.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) {
              const fieldId = $field.attr("id");
              const $marker = $(`label[for="${fieldId}"] [data-required-marker]`);

              $field.prop("required", isActive);
              $marker.toggleClass("hidden", !isActive);
            }
          });

          // Emergency contact only required if active
          emergencyContactNames.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) {
              const fieldId = $field.attr("id");
              const $marker = $(`label[for="${fieldId}"] [data-required-marker]`);

              $field.prop("required", isActive);
              $marker.toggleClass("hidden", !isActive);
            }
          });
        }

        $status.on("change", updateRequired);
        updateRequired();
      });
    }

    initStatusRequired();
  </script>
@endsection