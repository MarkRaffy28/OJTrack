<?php

namespace App\Providers;

use App\Models\Activity;
use App\Models\Backup;
use App\Models\EvaluationCriteriaConfig;
use App\Models\Setting;
use App\Models\StudentDetail;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\Office;
use App\Models\Ojt;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\StudentOjt;
use App\Models\User;
use App\Policies\ActivityPolicy;
use App\Policies\BackupPolicy;
use App\Policies\EvaluationCriteriaPolicy;
use App\Policies\SettingPolicy;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\EvaluationPolicy;
use App\Policies\OfficePolicy;
use App\Policies\OjtPolicy;
use App\Policies\ReportPolicy;
use App\Policies\ReportAssignmentPolicy;
use App\Policies\StudentOjtPolicy;
use App\Policies\DeveloperConsolePolicy;
use App\Services\DatabaseBackupService;
use App\Support\EvaluationCriteria;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
  /**
   * Register any application services.
   */
  public function register(): void {
    //
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void {
    Gate::policy(Activity::class, ActivityPolicy::class);
    Gate::policy(Attendance::class, AttendancePolicy::class);
    Gate::policy(Backup::class, BackupPolicy::class);
    Gate::policy(DatabaseBackupService::class, BackupPolicy::class);
    Gate::policy(Evaluation::class, EvaluationPolicy::class);
    Gate::policy(EvaluationCriteriaConfig::class, EvaluationCriteriaPolicy::class);
    Gate::policy(EvaluationCriteria::class, EvaluationCriteriaPolicy::class);
    Gate::policy(Office::class, OfficePolicy::class);
    Gate::policy(Ojt::class, OjtPolicy::class);
    Gate::policy(Report::class, ReportPolicy::class);
    Gate::policy(ReportAssignment::class, ReportAssignmentPolicy::class);
    Gate::policy(Setting::class, SettingPolicy::class);
    Gate::policy(StudentDetail::class, StudentPolicy::class);
    Gate::policy(StudentOjt::class, StudentOjtPolicy::class);
    Gate::policy(User::class, UserPolicy::class);

    Gate::define('access-developer-console', [DeveloperConsolePolicy::class, 'access']);

    RateLimiter::for('api', function (Request $request) {
      return Limit::perMinute(60)
        ->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
      return Limit::perMinute(5)
        ->by($request->ip());
    });

    RateLimiter::for('sensitive', function (Request $request) {
      return Limit::perMinute(10)
        ->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('web-auth', function (Request $request) {
      return Limit::perMinute(5)
        ->by(strtolower($request->input('email', '')) . '|' . $request->ip());
    });

    RateLimiter::for('web-sensitive', function (Request $request) {
      return Limit::perMinute(20)
        ->by($request->user()?->id ?: $request->ip());
    });

    Model::shouldBeStrict($this->app->environment('local', 'testing'));

    View::composer('*', function ($view) {
      $user = Auth::user();

      $view->with([
        'currentUser' => $user,
        'isAdmin' => $user?->isAdmin(),
        'isSupervisor' => $user?->isSupervisor(),
        'isSuperAdmin' => $user?->isSuperAdmin(),
        'currentRole' => $user?->role->value,
      ]);
    });
  }
}
