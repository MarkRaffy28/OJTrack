@extends ("layouts.app")

@section ("title", "Login")

@section ("content")
  <div
    class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12"
    style="background-image: url('{{ asset('images/lab.jpeg') }}');"
  >
    {{-- Overlay: keeps the background visible while improving readability --}}
    <div class="bg-primary-950/40 absolute inset-0"></div>

    {{-- Card --}}
    <div
      class="bg-surface/95 relative w-full max-w-md rounded-2xl p-8 shadow-xl backdrop-blur-sm"
    >
      {{-- Logos --}}
      <div class="flex items-center justify-center gap-4">
        <img
          src="{{ asset('images/ispsc.png') }}"
          alt="ISPSC logo"
          class="h-16 w-16 object-contain"
        />

        <div class="bg-border h-10 w-px"></div>

        <img
          src="{{ asset('images/ojt.png') }}"
          alt="OJTrack logo"
          class="h-16 w-16 object-contain"
        />

        <div class="bg-border h-10 w-px"></div>

        <img
          src="{{ asset('images/ccs.png') }}"
          alt="College of Computing Studies logo"
          class="h-16 w-16 object-contain"
        />
      </div>

      {{-- Login Header --}}
      <div class="mt-6 text-center">
        <h1 class="text-text text-2xl font-semibold">Log in</h1>

        <p class="text-text-muted mt-1 text-sm">College of Computing Studies portal</p>
      </div>

      {{-- Login Form --}}
      <x-form.form action="{{ route('web.login.authenticate') }}" class="mt-8 space-y-5">
        <x-form.input
          id="identifier"
          name="identifier"
          label="Identifier"
          icon="key"
          required
        />

        <x-form.input
          id="password"
          name="password"
          label="Password"
          icon="lock"
          required
          secure
        />

        <x-form.submit text="Log In" loading-text="Logging in..." class="w-full" />
      </x-form.form>
    </div>
  </div>
@endsection
