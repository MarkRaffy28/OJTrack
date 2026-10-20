@extends ("layouts.app")

@section ("title", "Instructor Registration")

@section ("content")
  <div
    class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12"
    style="background-image: url('{{ asset('images/lab.jpeg') }}');"
  >
    {{-- Overlay --}}
    <div class="bg-primary-950/40 absolute inset-0"></div>

    {{-- Card Container --}}
    <div
      class="bg-surface/95 relative w-full max-w-2xl rounded-2xl p-8 shadow-xl backdrop-blur-sm space-y-6"
    >
      {{-- Logos --}}
      <div class="flex items-center justify-center gap-4">
        <img
          src="{{ asset('images/ispsc.png') }}"
          alt="ISPSC logo"
          class="h-14 w-14 object-contain"
        />
        <div class="bg-border h-8 w-px"></div>
        <img
          src="{{ asset('images/logo.png') }}"
          alt="OJTrack logo"
          class="h-14 w-14 object-contain"
        />
        <div class="bg-border h-8 w-px"></div>
        <img
          src="{{ asset('images/ccs.png') }}"
          alt="College of Computing Studies logo"
          class="h-14 w-14 object-contain"
        />
      </div>

      {{-- Header --}}
      <div class="text-center">
        <h1 class="text-text text-2xl font-bold">Instructor Registration</h1>
        <p class="text-text-muted mt-1 text-sm">Activate your instructor account by setting up your details.</p>
      </div>

      {{-- Flash info --}}
      @if (session('info'))
        <div class="rounded-lg bg-info-50 p-3 text-xs text-info-800 border border-info-200">
          {{ session('info') }}
        </div>
      @endif

      @if ($errors->any())
        <div class="rounded-lg bg-danger-50 p-3 text-xs text-danger-800 border border-danger-200">
          <ul class="list-disc list-inside space-y-1">
            @foreach ($errors->all() as $error)
              <li>{{ $error }}</li>
            @endforeach
          </ul>
        </div>
      @endif

      {{-- Registration Form --}}
      <form method="POST" action="{{ route('web.register.store') }}" class="space-y-6">
        @csrf

        {{-- Account Information Section --}}
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-border pb-1">
            1. Account & Credentials
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <x-fields.identity field="username" :user="$user" />
            <x-fields.contact field="email" :user="$user" :required="true" />
            <x-fields.password field="password" />
            <x-fields.password field="confirm_password" field-name="password_confirmation" />
          </div>
        </div>

        {{-- Personal Information Section --}}
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-border pb-1">
            2. Personal Profile
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <x-fields.identity field="first_name" :user="$user" />
            <x-fields.identity field="middle_name" :user="$user" />
            <x-fields.identity field="last_name" :user="$user" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <x-fields.identity field="extension_name" :user="$user" />
            <x-fields.personal field="birth_date" :user="$user" />
            <x-fields.personal field="gender" :user="$user" />
          </div>
        </div>

        {{-- Contact & Addresses Section --}}
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-border pb-1">
            3. Contact & Address Info
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <x-fields.contact field="contact_number" :user="$user" :required="true" />
            <x-fields.contact field="home_address" :user="$user" :required="true" />
          </div>

          <x-fields.contact field="present_address" :user="$user" :required="true" />
        </div>

        <div class="pt-4 flex items-center justify-between border-t border-border">
          <button
            type="submit"
            formmethod="POST"
            formaction="{{ route('web.logout') }}"
            formnovalidate
            class="text-xs text-danger-600 hover:underline font-medium"
          >
            Cancel & Log Out
          </button>

          <button
            type="submit"
            class="rounded-xl bg-primary-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-800 transition-colors shadow-md"
          >
            Complete Registration & Activate Account
          </button>
        </div>
      </form>
    </div>
  </div>
@endsection
