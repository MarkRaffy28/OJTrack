<?php

namespace App\Models;

use App\Enums\AccountStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
  /** @use HasFactory<UserFactory> */
  use HasApiTokens, HasFactory, Notifiable;

  protected $fillable = [
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
    'address',
    'contact_number',
    'email',
    'role',
    'status',
    'activated_at',
  ];

  protected $hidden = [
    'password',
    'remember_token',
  ];

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
      'status' => AccountStatus::class,
      'activated_at' => 'datetime',
    ];
  }

  public function getFullNameAttribute(): string {
    return trim(implode(' ', array_filter([
      $this->first_name,
      $this->middle_name,
      $this->last_name,
      $this->extension_name,
    ])));
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
}
