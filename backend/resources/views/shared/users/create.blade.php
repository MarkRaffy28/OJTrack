@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.users.store";
@endphp

@extends ("layouts.app")

@section ("title", "Create User")

@section ("header_title", "Create User")

@section ("header_description",
  "Add a new user and fill in the required information below.")

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

            <div class="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.identity field="user_id" />
              </div>
              <div class="min-w-0">
                <x-fields.account field="status" />
              </div>
            </div>
          </div>
        </div>

        <div data-status-fields>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {{-- LEFT COLUMN --}}
            <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
              <div class="border-border-muted mb-5 border-b pb-4">
                <p class="text-text text-sm font-semibold">Account and Identity</p>
              </div>

              <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div class="min-w-0">
                  <x-fields.identity field="username" :required="false" />
                </div>
                <div class="min-w-0">
                  <x-fields.password field="password" :required="false" />
                </div>
                <div class="min-w-0">
                  <x-fields.password field="confirm_password" :required="false" />
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

              <div class="border-border-muted mt-6 border-t pt-6">
                <p class="text-text mb-5 text-sm font-semibold">Personal Information</p>
                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.personal field="birth_date" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.personal field="gender" :required="false" />
                  </div>
                </div>
              </div>
            </div>

            {{-- RIGHT COLUMN --}}
            <div class="space-y-6">
              <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
                <div class="border-border-muted mb-5 border-b pb-4">
                  <p class="text-text text-sm font-semibold">Contact Information</p>
                </div>

                <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div class="min-w-0">
                    <x-fields.contact field="contact_number" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.contact field="email" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.contact field="home_address" :required="false" />
                  </div>
                  <div class="min-w-0">
                    <x-fields.contact field="present_address" :required="false" />
                  </div>
                </div>
              </div>

              <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
                <div class="border-border-muted mb-5 border-b pb-4">
                  <p class="text-text text-sm font-semibold">Role</p>
                </div>
                <x-fields.account field="role" />
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          {{-- Student --}}
          <div
            data-role-fields="student"
            class="border-border bg-surface rounded-2xl border p-6 shadow-sm"
          >
            <div class="border-border-muted mb-5 border-b pb-4">
              <p class="text-text text-sm font-semibold">Student Details</p>
            </div>
            <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <x-fields.student-detail field="year" />
              <x-fields.student-detail field="program" />
              <x-fields.student-detail field="major" />
              <x-fields.student-detail field="section" />
              <x-fields.emergency-contact field="name" :required="false" />
              <x-fields.emergency-contact field="relationship" :required="false" />
              <x-fields.emergency-contact field="contact_number" :required="false" />
              <x-fields.emergency-contact field="address" :required="false" />
            </div>
          </div>

          {{-- Supervisor --}}
          <div
            data-role-fields="supervisor"
            class="border-border bg-surface rounded-2xl border p-6 shadow-sm"
          >
            <div class="border-border-muted mb-5 border-b pb-4">
              <p class="text-text text-sm font-semibold">Supervisor Details</p>
            </div>
            <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <x-fields.supervisor-detail field="office_id" />
              <x-fields.supervisor-detail field="position" />
            </div>
          </div>

          {{-- Instructor --}}
          <div
            data-role-fields="instructor"
            class="border-border bg-surface rounded-2xl border p-6 shadow-sm"
          >
            <div class="border-border-muted mb-5 border-b pb-4">
              <p class="text-text text-sm font-semibold">Instructor Details</p>
            </div>
            <div class="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <x-fields.instructor-detail field="department" />
              <x-fields.instructor-detail field="section" />
            </div>
          </div>
        </div>

        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$role}.users.index") }}"
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

        const emergencyContactNames = [
          "emergency_contact[name]",
          "emergency_contact[relationship]",
          "emergency_contact[contact_number]",
          "emergency_contact[address]",
        ];

        function updateRequired() {
          if (!$status.length) return;
          const isActive = $status.val() === "active";
          const role = $role.val();
          const isStudent = role === "student";

          emergencyContactNames.forEach((name) => {
            const $field = $(`[name="${name}"]`);
            if ($field.length) {
              const fieldId = $field.attr("id");
              const $marker = $(`label[for="${fieldId}"] [data-required-marker]`);

              $field.prop("required", isActive && isStudent);
              $marker.toggleClass("hidden", !(isActive && isStudent));
            }
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
