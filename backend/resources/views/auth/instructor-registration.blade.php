<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Registration | OJTrack</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

    <style>
        body {
            background:
                radial-gradient(circle at 10% 10%, rgba(124, 58, 237, 0.06) 0%, transparent 35%),
                radial-gradient(circle at 90% 90%, rgba(124, 58, 237, 0.05) 0%, transparent 35%),
                #f8f9fa;
            min-height: 100vh;
        }
        .brand-badge {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #7c3aed;
            color: #fff;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
        }
        .section-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #f3e8ff;
            color: #7c3aed;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .info-sidebar {
            background: #fff;
            border-radius: 1rem;
        }
        .info-sidebar dt {
            color: #6c757d;
            font-weight: 400;
        }
        .info-sidebar dd {
            font-weight: 600;
        }
        .btn-brand {
            background: #7c3aed;
            border: none;
        }
        .btn-brand:hover {
            background: #6d28d9;
        }
    </style>
</head>
<body>
    <main class="container py-5">
        <div class="row justify-content-center g-4">

            <div class="col-lg-9">

                <div class="d-flex align-items-center gap-3 mb-2">
                    <div class="brand-badge">O</div>
                    <div>
                        <p class="text-uppercase text-muted small fw-semibold mb-0" style="letter-spacing: 0.05em;">
                            One-time setup
                        </p>
                        <h1 class="h4 fw-bold mb-0">Complete your instructor registration</h1>
                    </div>
                </div>
                <p class="text-muted mb-4">
                    Set your own password and confirm your details. You'll use these credentials to sign in from now on.
                </p>

                @if ($errors->any())
                    <div class="alert alert-danger d-flex align-items-start gap-2">
                        <i class="bi bi-exclamation-circle mt-1"></i>
                        <ul class="mb-0 ps-3">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="row g-4">

                    {{-- Read-only summary sidebar --}}
                    <div class="col-md-4 order-md-2">
                        <div class="info-sidebar shadow-sm p-4">
                            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 mb-3"
                                 style="width:56px;height:56px;background:#f3e8ff;color:#7c3aed;">
                                {{ strtoupper(substr($user->first_name, 0, 1) . substr($user->last_name ?? '', 0, 1)) }}
                            </div>
                            <h2 class="h6 fw-bold mb-3">Account already on file</h2>
                            <dl class="mb-0 small">
                                <dt>User ID</dt>
                                <dd class="mb-2">{{ $user->user_id }}</dd>
                            </dl>
                            <p class="text-muted small mb-0 mt-3">
                                <i class="bi bi-shield-check me-1"></i>
                                This account was created by your administrator. You're just confirming and securing it.
                            </p>
                        </div>
                    </div>

                    {{-- Form --}}
                    <div class="col-md-8 order-md-1">
                        <form method="POST" action="{{ route('instructor.registration.complete') }}">
                            @csrf

                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <div class="section-icon"><i class="bi bi-shield-lock"></i></div>
                                        <h2 class="h6 fw-bold mb-0">Account Security</h2>
                                    </div>

                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label small">Username</label>
                                            <input name="username" value="{{ old('username', $user->username) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small text-muted">User ID</label>
                                            <input value="{{ $user->user_id }}" class="form-control" disabled>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">New Password</label>
                                            <input type="password" name="newPassword" class="form-control" required>
                                            <div class="form-text">Use at least 8 characters with a mix of letters and numbers.</div>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Confirm New Password</label>
                                            <input type="password" name="confirmPassword" class="form-control" required>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card border-0 shadow-sm mb-3">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <div class="section-icon"><i class="bi bi-person-vcard"></i></div>
                                        <h2 class="h6 fw-bold mb-0">Personal Information</h2>
                                    </div>

                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label small">First Name</label>
                                            <input name="firstName" value="{{ old('firstName', $user->first_name) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Last Name</label>
                                            <input name="lastName" value="{{ old('lastName', $user->last_name) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Middle Name</label>
                                            <input name="middleName" value="{{ old('middleName', $user->middle_name) }}" class="form-control">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Extension Name</label>
                                            <input name="extensionName" value="{{ old('extensionName', $user->extension_name) }}" class="form-control">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Birth Date</label>
                                            <input type="date" name="birthDate" value="{{ old('birthDate', optional($user->birth_date)->format('Y-m-d')) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Gender</label>
                                            <select name="gender" class="form-select" required>
                                                @foreach (['Male', 'Female', 'Other'] as $gender)
                                                    <option value="{{ $gender }}" @selected(old('gender', $user->gender) === $gender)>{{ $gender }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card border-0 shadow-sm mb-4">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center gap-2 mb-3">
                                        <div class="section-icon"><i class="bi bi-geo-alt"></i></div>
                                        <h2 class="h6 fw-bold mb-0">Contact & Address</h2>
                                    </div>

                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label small">Email</label>
                                            <input type="email" name="email" value="{{ old('email', $user->email) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Contact Number</label>
                                            <input name="contactNumber" value="{{ old('contactNumber', $user->contact_number) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Home Address</label>
                                            <input name="homeAddress" value="{{ old('homeAddress', $user->home_address) }}" class="form-control" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small">Present Address</label>
                                            <input name="presentAddress" value="{{ old('presentAddress', $user->present_address) }}" class="form-control" required>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex justify-content-end">
                                <button type="submit" class="btn btn-brand text-white px-4">
                                    Complete Registration <i class="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </main>
</body>
</html>