<?php

namespace App\Providers;

use App\Enums\UserRole;
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
use App\Services\DatabaseBackupService;
use App\Support\EvaluationCriteria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
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

    Model::shouldBeStrict($this->app->environment('local', 'testing'));

    View::composer('*', function ($view) {
      $user = Auth::user();

      $view->with([
        'currentRole' => $user?->role->value,
        'isSupervisor' => $user?->isSupervisor(),
        'isAdmin' => $user?->isAdmin(),
        'isSuperAdmin' => $user?->isSuperAdmin(),
      ]);
    });
  }
}
