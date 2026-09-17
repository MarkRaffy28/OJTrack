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
          src="{{ asset('images/ojt.png') }}"
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
            <div>
              <label class="block text-xs font-medium text-text mb-1">Username <span class="text-danger-500">*</span></label>
              <input
                type="text"
                name="username"
                value="{{ old('username', $user->username) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Email Address <span class="text-danger-500">*</span></label>
              <input
                type="email"
                name="email"
                value="{{ old('email', $user->email) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">New Password <span class="text-danger-500">*</span></label>
              <input
                type="password"
                name="password"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Confirm Password <span class="text-danger-500">*</span></label>
              <input
                type="password"
                name="password_confirmation"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Re-enter password"
              />
            </div>
          </div>
        </div>

        {{-- Personal Information Section --}}
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-border pb-1">
            2. Personal Profile
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-text mb-1">First Name <span class="text-danger-500">*</span></label>
              <input
                type="text"
                name="first_name"
                value="{{ old('first_name', $user->first_name) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value="{{ old('middle_name', $user->middle_name) }}"
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Last Name <span class="text-danger-500">*</span></label>
              <input
                type="text"
                name="last_name"
                value="{{ old('last_name', $user->last_name) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-text mb-1">Extension Name (e.g. Jr., III)</label>
              <input
                type="text"
                name="extension_name"
                value="{{ old('extension_name', $user->extension_name) }}"
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Birth Date <span class="text-danger-500">*</span></label>
              <input
                type="date"
                name="birth_date"
                value="{{ old('birth_date', $user->birth_date ? $user->birth_date->format('Y-m-d') : '') }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Gender <span class="text-danger-500">*</span></label>
              <select
                name="gender"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Gender</option>
                <option value="male" @selected(old('gender', strtolower($user->gender ?? '')) === 'male')>Male</option>
                <option value="female" @selected(old('gender', strtolower($user->gender ?? '')) === 'female')>Female</option>
                <option value="other" @selected(old('gender', strtolower($user->gender ?? '')) === 'other')>Other</option>
              </select>
            </div>
          </div>
        </div>

        {{-- Contact & Addresses Section --}}
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-primary-700 border-b border-border pb-1">
            3. Contact & Address Info
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-text mb-1">Contact Number <span class="text-danger-500">*</span></label>
              <input
                type="text"
                name="contact_number"
                value="{{ old('contact_number', $user->contact_number) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-text mb-1">Home Address <span class="text-danger-500">*</span></label>
              <input
                type="text"
                name="home_address"
                value="{{ old('home_address', $user->home_address) }}"
                required
                class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-text mb-1">Present Address <span class="text-danger-500">*</span></label>
            <input
              type="text"
              name="present_address"
              value="{{ old('present_address', $user->present_address) }}"
              required
              class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="pt-4 flex items-center justify-between border-t border-border">
          <x-form.form action="{{ route('web.logout') }}" method="POST">
            <button
              type="submit"
              class="text-xs text-danger-600 hover:underline font-medium"
            >
              Cancel & Log Out
            </button>
          </x-form.form>

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
