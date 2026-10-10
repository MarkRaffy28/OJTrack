<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Models\EmergencyContact;
use App\Models\InstructorDetail;
use App\Models\StudentDetail;
use App\Models\StudentOjt;
use App\Models\SupervisorDetail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string|null $username
 * @property string $password
 * @property string|null $profile_picture
 * @property string $first_name
 * @property string|null $middle_name
 * @property string $last_name
 * @property string|null $extension_name
 * @property string $user_id
 * @property \Illuminate\Support\Carbon|null $birth_date
 * @property string|null $gender
 * @property string|null $home_address
 * @property string|null $present_address
 * @property string|null $contact_number
 * @property string|null $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property UserRole $role
 * @property AccountStatus $status
 * @property \Illuminate\Support\Carbon|null $activated_at
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read StudentOjt|null $currentOjt
 * @property-read \Illuminate\Database\Eloquent\Collection<int, EmergencyContact> $emergencyContacts
 * @property-read int|null $emergency_contacts_count
 * @property-read string $full_name
 * @property-read InstructorDetail|null $instructorDetail
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read StudentDetail|null $studentDetail
 * @property-read \Illuminate\Database\Eloquent\Collection<int, StudentOjt> $studentOjts
 * @property-read int|null $student_ojts_count
 * @property-read SupervisorDetail|null $supervisorDetail
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static Builder<static>|User filter(array $filters)
 * @method static Builder<static>|User newModelQuery()
 * @method static Builder<static>|User newQuery()
 * @method static Builder<static>|User onlyTrashed()
 * @method static Builder<static>|User query()
 * @method static Builder<static>|User search(?string $search)
 * @method static Builder<static>|User sort(?string $sort = 'id', ?string $direction = 'asc')
 * @method static Builder<static>|User whereActivatedAt($value)
 * @method static Builder<static>|User whereBirthDate($value)
 * @method static Builder<static>|User whereContactNumber($value)
 * @method static Builder<static>|User whereCreatedAt($value)
 * @method static Builder<static>|User whereDeletedAt($value)
 * @method static Builder<static>|User whereEmail($value)
 * @method static Builder<static>|User whereEmailVerifiedAt($value)
 * @method static Builder<static>|User whereExtensionName($value)
 * @method static Builder<static>|User whereFirstName($value)
 * @method static Builder<static>|User whereGender($value)
 * @method static Builder<static>|User whereHomeAddress($value)
 * @method static Builder<static>|User whereId($value)
 * @method static Builder<static>|User whereLastName($value)
 * @method static Builder<static>|User whereMiddleName($value)
 * @method static Builder<static>|User wherePassword($value)
 * @method static Builder<static>|User wherePresentAddress($value)
 * @method static Builder<static>|User whereProfilePicture($value)
 * @method static Builder<static>|User whereRememberToken($value)
 * @method static Builder<static>|User whereRole($value)
 * @method static Builder<static>|User whereStatus($value)
 * @method static Builder<static>|User whereUpdatedAt($value)
 * @method static Builder<static>|User whereUserId($value)
 * @method static Builder<static>|User whereUsername($value)
 * @method static Builder<static>|User withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|User withoutTrashed()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, StudentOjt> $supervisedOjts
 * @property-read int|null $supervised_ojts_count
 * @mixin \Eloquent
 */
class User extends Authenticatable {
  use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

  /**
   * Get the fillable attributes for the model.
   *
   * @return array<int, string>
   */
  public function getFillable(): array {
    return [
      'username',
      'password',
      'profile_picture',
      'first_name',
      'middle_name',
      'last_name',
      'extension_name',
      'user_id',
      'birth_date',
      'gender',
      'home_address',
      'present_address',
      'contact_number',
      'email',
      'email_verified_at',
      'role',
      'status',
      'activated_at',
    ];
  }

  /**
   * Get the hidden attributes for the model.
   *
   * @return array<int, string>
   */
  public function getHidden(): array {
    return [
      'password',
      'remember_token',
    ];
  }

  /**
   * Get the accessors to append to the model's array form.
   *
   * @return array<int, string>
   */
  public function getAppends(): array {
    return [
      'full_name',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array {
    return [
      'birth_date' => 'date',
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'role' => UserRole::class,
      'status' => AccountStatus::class,
      'activated_at' => 'datetime',
    ];
  }

  /**
   * Get the user's full name.
   */
  protected function fullName(): Attribute {
    return Attribute::make(
      get: fn(): string => trim(implode(' ', array_filter([
        $this->first_name,
        $this->middle_name,
        $this->last_name,
        $this->extension_name,
      ])))
    );
  }

  public function studentDetail(): HasOne {
    return $this->hasOne(StudentDetail::class);
  }

  public function instructorDetail(): HasOne {
    return $this->hasOne(InstructorDetail::class);
  }
  public function supervisorDetail(): HasOne {
    return $this->hasOne(SupervisorDetail::class);
  }

  public function emergencyContacts(): HasMany {
    return $this->hasMany(EmergencyContact::class);
  }

  public function scopeSearch(Builder $query, ?string $search): void {
    $query->when($search, function (Builder $query, string $search) {
      $query->where(function (Builder $query) use ($search) {
        $query
          ->where('user_id', 'like', "%{$search}%")
          ->orWhere('username', 'like', "%{$search}%")
          ->orWhere('first_name', 'like', "%{$search}%")
          ->orWhere('middle_name', 'like', "%{$search}%")
          ->orWhere('last_name', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%")
          ->orWhere('contact_number', 'like', "%{$search}%");
      });
    });
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['role'] ?? null, fn(Builder $query, $role) =>
        $query->where('role', $role)
      )
      ->when($filters['status'] ?? null, fn(Builder $query, $status) =>
        $query->where('status', $status)
      );
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'asc'): void {
    $sortableColumns = ['id', 'user_id', 'username', 'email', 'role', 'status', 'created_at'];
    $direction = in_array($direction, ['asc', 'desc']) ? $direction : 'asc';

    if ($sort === 'full_name') {
      $query
        ->orderBy('first_name', $direction)
        ->orderBy('middle_name', $direction)
        ->orderBy('last_name', $direction);

      return;
    }

    $sort = in_array($sort, $sortableColumns) ? $sort : 'id';

    $query->orderBy($sort, $direction);
  }

  public function scopeVisibleTo(Builder $query, User $viewer): Builder {
    $query->where('role', '!=', UserRole::SUPER_ADMIN);

    if ($viewer->isSuperAdmin()) {
      return $query;
    }

    if ($viewer->isInstructor()) {
      $section = $viewer->instructorDetail?->section;

      return $query
        ->where('role', UserRole::STUDENT->value)
        ->where(function ($query) use ($viewer, $section) {
          if ($section) {
            $query->whereHas(
              'studentDetail',
              fn($q) => $q->where('section', $section)
            );
          } else {
            $query->whereHas(
              'studentOjts',
              fn($q) => $q->where('instructor_id', $viewer->id)
            );
          }
        });
    }

    if ($viewer->isAdmin()) {
      return $query->whereNotIn(
        'role',
        [UserRole::ADMIN->value, UserRole::SUPER_ADMIN->value]
      );
    }

    return $query->whereKey($viewer->id);
  }

  public function hasRole(UserRole $role): bool {
    return $this->role === $role;
  }

  public function isAdmin(): bool {
    return $this->hasRole(UserRole::ADMIN);
  }

  public function isSuperAdmin(): bool {
    return $this->hasRole(UserRole::SUPER_ADMIN);
  }

  public function isInstructor(): bool {
    return $this->hasRole(UserRole::INSTRUCTOR);
  }

  public function isStudent(): bool {
    return $this->hasRole(UserRole::STUDENT);
  }

  public function isSupervisor(): bool {
    return $this->hasRole(UserRole::SUPERVISOR);
  }

  public function currentOjt(): HasOne {
    return $this->hasOne(StudentOjt::class, 'student_id')->latestOfMany();
  }

  public function studentOjts(): HasMany {
    return $this->hasMany(StudentOjt::class, 'student_id');
  }

  public function supervisedOjts(): HasManyThrough {
    return $this->hasManyThrough(StudentOjt::class, SupervisorDetail::class, 'user_id', 'office_id', 'id', 'office_id');
  }
}
