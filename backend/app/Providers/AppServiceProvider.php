<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\StudentDetail;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\Office;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use App\Policies\StudentPolicy;
use App\Policies\UserPolicy;
use App\Policies\AttendancePolicy;
use App\Policies\EvaluationPolicy;
use App\Policies\OfficePolicy;
use App\Policies\ReportPolicy;
use App\Policies\StudentOjtPolicy;
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
    Gate::policy(User::class, UserPolicy::class);
    
    Gate::policy(StudentDetail::class, StudentPolicy::class);
    Gate::policy(Attendance::class, AttendancePolicy::class);
    Gate::policy(Evaluation::class, EvaluationPolicy::class);
    Gate::policy(Office::class, OfficePolicy::class);
    Gate::policy(Report::class, ReportPolicy::class);
    Gate::policy(StudentOjt::class, StudentOjtPolicy::class);

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
