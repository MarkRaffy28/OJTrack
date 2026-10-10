<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string|null $address
 * @property string|null $contact_email
 * @property string|null $contact_phone
 * @property string $morning_in
 * @property string $morning_out
 * @property string $afternoon_in
 * @property string $afternoon_out
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupervisorDetail> $supervisorDetail
 * @property-read int|null $supervisor_detail_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SupervisorDetail> $supervisors
 * @property-read int|null $supervisors_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereAfternoonIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereAfternoonOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereMorningIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereMorningOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Office whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Office extends Model {
  use HasFactory, SoftDeletes;

  /**
   * Get the fillable attributes for the model.
   *
   * @return array<int, string>
   */
  public function getFillable(): array {
    return [
      'name',
      'address',
      'contact_email',
      'contact_phone',
      'morning_in',
      'morning_out',
      'afternoon_in',
      'afternoon_out',
    ];
  }

  /**
   * Include custom accessors when model is converted to JSON or Array.
   *
   * @return array<int, string>
   */
  public function getAppends(): array {
    return [
      'morning_shift',
      'afternoon_shift',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array {
    return [
      'morning_in' => 'datetime:H:i:s',
      'morning_out' => 'datetime:H:i:s',
      'afternoon_in' => 'datetime:H:i:s',
      'afternoon_out' => 'datetime:H:i:s',
    ];
  }

  /**
   * Get the formatted morning shift hours (e.g., "08:00 AM - 12:00 PM").
   */
  protected function morningShift(): Attribute {
    return Attribute::make(
      get: fn(): ?string => ($this->morning_in && $this->morning_out)
      ? Carbon::parse($this->morning_in)->format('h:i A') . ' - ' . Carbon::parse($this->morning_out)->format('h:i A')
      : null
    );
  }

  /**
   * Get the formatted afternoon shift hours (e.g., "01:00 PM - 05:00 PM").
   */
  protected function afternoonShift(): Attribute {
    return Attribute::make(
      get: fn(): ?string => ($this->afternoon_in && $this->afternoon_out)
      ? Carbon::parse($this->afternoon_in)->format('h:i A') . ' - ' . Carbon::parse($this->afternoon_out)->format('h:i A')
      : null
    );
  }

  public function supervisorDetails(): HasMany {
    return $this->hasMany(SupervisorDetail::class, 'office_id');
  }

  public function studentOjts(): HasMany {
    return $this->hasMany(StudentOjt::class, 'office_id');
  }

  public function scopeSearch(Builder $query, ?string $search): void {
    $query->when($search, function (Builder $query, string $search) {
      $query->where(function (Builder $query) use ($search) {
        $query
          ->where('name', 'like', "%{$search}%")
          ->orWhere('contact_email', 'like', "%{$search}%")
          ->orWhere('contact_phone', 'like', "%{$search}%")
          ->orWhere('address', 'like', "%{$search}%")
          ->orWhere('morning_in', 'like', "%{$search}%")
          ->orWhere('morning_out', 'like', "%{$search}%")
          ->orWhere('afternoon_in', 'like', "%{$search}%")
          ->orWhere('afternoon_out', 'like', "%{$search}%");
      });
    });
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'asc'): void {
    $sortableColumns = ['id', 'name', 'contact_email', 'created_at', 'updated_at'];
    $direction = in_array(strtolower($direction ?? 'asc'), ['asc', 'desc']) ? $direction : 'asc';
    $sort = in_array($sort, $sortableColumns) ? $sort : 'id';

    $query->orderBy($sort, $direction);
  }
}
