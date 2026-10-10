<?php

namespace App\Models;

use App\Enums\OjtTerm;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $academic_year
 * @property OjtTerm $term
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon $end_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudentOjt> $studentOjts
 * @property-read int|null $student_ojts_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereAcademicYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereTerm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Ojt whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Ojt extends Model {
  use HasFactory;

  /**
   * Get the fillable attributes for the model.
   *
   * @return array<int, string>
   */
  public function getFillable(): array {
    return [
      'academic_year',
      'term',
      'start_date',
      'end_date',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array {
    return [
      'term' => OjtTerm::class,
      'start_date' => 'date',
      'end_date' => 'date',
    ];
  }

  public function studentOjts(): HasMany {
    return $this->hasMany(StudentOjt::class);
  }
}
