@php
  use App\Enums\UserRole;

  $route = "web.{$currentRole}.users.store";

  $roleOptions = collect(UserRole::cases())
    ->reject(fn (UserRole $role) => $role === UserRole::SUPER_ADMIN)
    ->when(
        ! $isSuperAdmin,
        fn ($roles) => $roles->reject(
            fn (UserRole $role) => $role === UserRole::ADMIN
        )
    )
    ->map(fn (UserRole $role) => $role->value)
    ->values()
    ->all();
@endphp

@extends ("layouts.app")

@section ("title", "Create User")
@section ("header_title", "Create User")
@section ("header_description",
  "Add a new user and fill in the required information below.")
@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form action="{{ route($route) }}" enctype="multipart/form-data">
      <div class="space-y-6">
        {{-- PROFILE HEADER --}}
        <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div class="shrink-0">
              <x-avatar mode="edit" size="md" />
            </div>

            <div class="grid flex-1 grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.identity field="user_id" />
              </div>
              <div class="min-w-0">
                <x-fields.account field="status" :optionOnly="['pre_activated', 'active']" />
              </div>
            </div>
          </div>
        </div>

        <div data-status-fields>
          <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {{-- LEFT COLUMN --}}
            <div class="space-y-6">
              {{-- ACCOUNT --}}
              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">manage_accounts</span>
                  <h2 class="text-text text-sm font-semibold">Account</h2>
                </div>
                <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.account field="role" :optionOnly="$roleOptions" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.password field="password" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.password field="confirm_password" :required="false" />
                  </div>
                </div>
              </section>

              {{-- IDENTITY --}}
              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">badge</span>
                  <h2 class="text-text text-sm font-semibold">Identity</h2>
                </div>
                <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.identity field="username" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.identity field="first_name" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.identity field="middle_name" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.identity field="last_name" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.identity field="extension_name" />
                  </div>
                </div>
              </section>

              {{-- PERSONAL INFORMATION --}}
              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">person</span>
                  <h2 class="text-text text-sm font-semibold">Personal Information</h2>
                </div>
                <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.personal field="birth_date" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.personal field="gender" :required="false" />
                  </div>
                </div>
              </section>
            </div>

            {{-- RIGHT COLUMN --}}
            <div class="space-y-6">
              {{-- CONTACT INFORMATION --}}
              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">call</span>
                  <h2 class="text-text text-sm font-semibold">Contact Information</h2>
                </div>
                <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.contact field="contact_number" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.contact field="email" :required="false" />
                  </div>
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.contact field="home_address" :required="false" />
                  </div>
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.contact field="present_address" :required="false" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          {{-- Student --}}
          <div data-role-fields="student" class="space-y-6">
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">school</span>
                <h2 class="text-text text-sm font-semibold">Academic Details</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <x-fields.student-detail field="year" />
                <x-fields.student-detail field="program" />
                <x-fields.student-detail field="major" />
                <x-fields.student-detail field="section" />
              </div>
            </section>

            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">emergency</span>
                <h2 class="text-text text-sm font-semibold">Emergency Contact</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <x-fields.emergency-contact field="name" :required="false" />
                <x-fields.emergency-contact field="relationship" :required="false" />
                <x-fields.emergency-contact field="contact_number" :required="false" />
                <x-fields.emergency-contact field="address" :required="false" />
              </div>
            </section>
          </div>

          {{-- Supervisor --}}
          <section
            data-role-fields="supervisor"
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
              <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">work</span>
              <h2 class="text-text text-sm font-semibold">Work Details</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <x-fields.supervisor-detail field="office_id" />
              <x-fields.supervisor-detail field="position" />
            </div>
          </section>

          {{-- Instructor --}}
          <section
            data-role-fields="instructor"
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
              <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">groups</span>
              <h2 class="text-text text-sm font-semibold">Teaching Details</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <x-fields.instructor-detail field="program" />
              <x-fields.instructor-detail field="department" />
              <x-fields.instructor-detail field="section" />
            </div>
          </section>
        </div>

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
        const $role = $('select[name="role"]');
        const $adminOption = $role.find('option[value="admin"]');
        $role.data("admin-option", $adminOption.clone());

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
          const isStudent = $role.val() === "student";
          const hideAdmin = status === "pre_activated";

          if (hideAdmin && $role.val() === "admin") {
            $role.val("").trigger("change");
          }

          if (hideAdmin) {
            $role.find('option[value="admin"]').detach();
          } else if (!$role.find('option[value="admin"]').length && $role.data("admin-option")) {
            $role.append($role.data("admin-option").clone());
          }

          $role.trigger("change.select2");

          statusFields.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) toggleRequired($field, isActiveOrSuspended);
          });

          studentFields.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) toggleRequired($field, isActiveOrSuspended && isStudent);
          });
        }

        $status.on("change", updateRequired);
        $role.on("change", updateRequired);
        updateRequired();
      });
    }

    initStatusRequired();
  </script>
@endsection