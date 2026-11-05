@php
  use App\Enums\UserRole;

  $user = $user ?? null;
  $isEdit = $user !== null;

  $route = $isEdit ? "{$currentRole}.users.update" : "{$currentRole}.users.store";
  $action = $isEdit ? route($route, $user) : route($route);
  $method = $isEdit ? "PUT" : "POST";

  $roleOptions = [];

  if (!$isEdit) {
    $roleOptions = collect(UserRole::cases())
      ->reject(fn(UserRole $role) => $role === UserRole::SUPER_ADMIN)
      ->when(
        !$isSuperAdmin,
        fn($roles) => $roles->reject(fn(UserRole $role) => $role === UserRole::ADMIN),
      )
      ->map(fn(UserRole $role) => $role->value)
      ->values()
      ->all();
  }
@endphp

@extends ("layouts.app")

@section ("title", $isEdit ? "Edit User" : "Create User")
@section ("header_title", $isEdit ? "Edit User" : "Create User")

@section ("header_description",
  $isEdit
    ? "Update user information and account details."
    : "Add a new user and fill in the required information below.")

@section ("header_go_back", "")

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form
      method="{{ $method }}"
      action="{{ $action }}"
      enctype="multipart/form-data"
    >
      <div class="space-y-6">
        <div
          class="grid grid-cols-1 gap-6 lg:grid-cols-2"
          data-fluid-grid
          data-gap="24"
          data-max-cols="2"
        >
          {{-- PROFILE --}}
          <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
            <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
              <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                account_circle
              </span>
              <h2 class="text-text text-sm font-semibold">Profile</h2>
            </div>
            <div class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
              <div class="shrink-0">
                <x-avatar mode="edit" size="md" :user="$user" />
              </div>

              <div class="grid flex-1 grid-cols-1 gap-y-5">
                <div class="min-w-0">
                  <x-fields.identity
                    field="user_id"
                    :user="$user"
                    mode="edit"
                  />
                </div>
                <div class="min-w-0">
                  @if ($isEdit)
                    <x-fields.account field="status" :user="$user" />
                  @else
                    <x-fields.account
                      field="status"
                      :optionOnly="['pre_activated', 'active']"
                    />
                  @endif
                </div>
              </div>
            </div>
          </section>

          <div @if (!$isEdit) data-status-fields @endif class="contents">
            {{-- ACCOUNT --}}
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  manage_accounts
                </span>
                <h2 class="text-text text-sm font-semibold">Account</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                @if ($isEdit)
                  <div class="min-w-0 sm:col-span-2" data-role-display>
                    <x-fields.account field="role" :user="$user" mode="view" />
                  </div>
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.password
                      field="password"
                      :required="false"
                      :user="$user"
                    />
                  </div>
                @else
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.account field="role" :optionOnly="$roleOptions" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.password field="password" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.password
                      field="confirm_password"
                      :required="false"
                    />
                  </div>
                @endif
              </div>
            </section>

            {{-- IDENTITY --}}
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  badge
                </span>
                <h2 class="text-text text-sm font-semibold">Identity</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.identity
                    field="username"
                    :user="$user"
                    :required="$isEdit"
                  />
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
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  person
                </span>
                <h2 class="text-text text-sm font-semibold">
                  Personal Information
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.personal
                    field="birth_date"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
                <div class="min-w-0">
                  <x-fields.personal
                    field="gender"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
              </div>
            </section>

            {{-- CONTACT INFORMATION --}}
            <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  call
                </span>
                <h2 class="text-text text-sm font-semibold">
                  Contact Information
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.contact
                    field="contact_number"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
                <div class="min-w-0">
                  <x-fields.contact
                    field="email"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.contact
                    field="home_address"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.contact
                    field="present_address"
                    :user="$user"
                    :required="$isEdit"
                  />
                </div>
              </div>
            </section>
          </div>

          {{-- STUDENT --}}
          @if (!$isEdit || $user->role === UserRole::STUDENT)
            <div
              @if (!$isEdit) data-role-fields="student" @endif
              class="contents"
            >
              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                    school
                  </span>
                  <h2 class="text-text text-sm font-semibold">
                    Academic Details
                  </h2>
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

              <section class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
                <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                  <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                    emergency
                  </span>
                  <h2 class="text-text text-sm font-semibold">
                    Emergency Contact
                  </h2>
                </div>
                <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.emergency-contact
                      field="name"
                      :user="$user"
                      :required="$isEdit"
                    />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact
                      field="relationship"
                      :user="$user"
                      :required="$isEdit"
                    />
                  </div>
                  <div class="min-w-0">
                    <x-fields.emergency-contact
                      field="contact_number"
                      :user="$user"
                      :required="$isEdit"
                    />
                  </div>
                  <div class="min-w-0 sm:col-span-2">
                    <x-fields.emergency-contact
                      field="address"
                      :user="$user"
                      :required="$isEdit"
                    />
                  </div>
                </div>
              </section>
            </div>
          @endif

          {{-- SUPERVISOR --}}
          @if (!$isEdit || $user->role === UserRole::SUPERVISOR)
            <section
              @if (!$isEdit) data-role-fields="supervisor" @endif
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  work
                </span>
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
          @if (!$isEdit || $user->role === UserRole::INSTRUCTOR)
            <section
              @if (!$isEdit) data-role-fields="instructor" @endif
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3">
                <span class="material-symbols-outlined material-symbols-md text-primary-600" aria-hidden="true">
                  groups
                </span>
                <h2 class="text-text text-sm font-semibold">
                  Teaching Details
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.instructor-detail field="program" :user="$user" />
                </div>
                <div class="min-w-0">
                  <x-fields.instructor-detail
                    field="department"
                    :user="$user"
                  />
                </div>
                <div class="min-w-0">
                  <x-fields.instructor-detail field="section" :user="$user" />
                </div>
              </div>
            </section>
          @endif
        </div>

        {{-- ACTIONS --}}
        <div class="border-border bg-surface sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm">
          <a
            href="{{ route("{$currentRole}.users.index") }}"
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
        const isEdit = @json ($isEdit);

        const $status = $('select[name="status"]');
        const $role = $('[name="role"]');
        const $roleDisplay = $role.closest("[data-role-display]");
        const $adminOption = $role.find('option[value="admin"]');

        if (!isEdit) {
          $role.data("admin-option", $adminOption.clone());
        }

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

        function syncAdminRole(hideAdmin) {
          if (isEdit) {
            $roleDisplay.toggle(!(hideAdmin && $role.val() === "admin"));
            return;
          }

          if (hideAdmin && $role.val() === "admin") {
            $role.val("").trigger("change");
          }

          if (hideAdmin) {
            $role.find('option[value="admin"]').detach();
          } else if (
            !$role.find('option[value="admin"]').length &&
            $role.data("admin-option")
          ) {
            $role.append($role.data("admin-option").clone());
          }

          $role.trigger("change.select2");
        }

        function updateRequired() {
          if (!$status.length) return;

          const status = $status.val();
          const isActiveOrSuspended = status === "active" || status === "suspended";
          const isStudent = isEdit || $role.val() === "student";

          syncAdminRole(status === "pre_activated");

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
        if (!isEdit) $role.on("change", updateRequired);
        updateRequired();
      });
    }

    initStatusRequired();
  </script>
@endsection
