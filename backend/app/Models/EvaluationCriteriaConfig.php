<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property array<array-key, mixed> $criteria
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig whereCriteria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvaluationCriteriaConfig whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class EvaluationCriteriaConfig extends Model {
  protected $table = 'evaluation_criteria';

  protected $fillable = ['criteria'];

  protected $casts = ['criteria' => 'array'];
}
