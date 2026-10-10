<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use BackedEnum;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

abstract class BaseField extends BaseComponent {
  protected mixed $fieldEnum;
  public FieldMode $mode;

  /**
   * Get the configuration for the requested field.
   * Must be implemented by child classes.
   */
  abstract public function config(): ?array;

  /**
   * Get the current value for the requested field.
   * Override in child class if custom logic is needed.
   */
  public function value(): mixed {
    if ($config = $this->config()) {
      $fieldName = rtrim(
        str_replace(['[', ']'], ['.', ''], $config['name'] ?? $this->getFieldValue()),
        '.'
      );

      $raw = $this->resolveValue();
      $raw = $this->formatValue($raw);

      return old($fieldName, $raw);
    }

    return null;
  }

  /**
   * Get raw field value from model. Override in child class.
   */
  protected function resolveValue(): mixed {
    return null;
  }

  /**
   * Format value based on type (dates, enums, etc.)
   */
  protected function formatValue(mixed $value): mixed {
    if ($value instanceof BackedEnum) {
      return $value->value;
    }

    if ($value instanceof CarbonInterface) {
      return $value->format('Y-m-d');
    }

    return $value;
  }

  /**
   * Get field options for select fields.
   */
  public function fieldOptions(): array {
    $config = $this->config();
    if (!$config) {
      return [];
    }

    $options = $config['options'] ?? [];

    return collect($options)
      ->map(function ($label, $value) {
        if (is_array($label) && isset($label['value'], $label['label'])) {
          return $label;
        }

        return [
          'value' => $value,
          'label' => $label,
        ];
      })
      ->values()
      ->all();
  }

  /**
   * Whether the field should be disabled.
   */
  public function disabled(): bool {
    $config = $this->config();

    return $this->mode === FieldMode::VIEW
      || ($config['disabled'] ?? false);
  }

  /**
   * Whether the field should be readonly.
   */
  public function readonly(): bool {
    $config = $this->config();

    return $this->mode === FieldMode::VIEW
      || ($config['readonly'] ?? false);
  }

  /**
   * Get field enum value as string.
   */
  protected function getFieldValue(): string {
    if (is_string($this->fieldEnum)) {
      return $this->fieldEnum;
    }

    return $this->fieldEnum->value ?? (string) $this->fieldEnum;
  }

  /**
   * Parse field enum from string or enum.
   */
  protected function parseEnum(string|object $field, string $enumClass): object {
    if (is_string($field)) {
      return $enumClass::from($field);
    }

    return $field;
  }

  /**
   * Parse mode from string or FieldMode.
   */
  protected function parseMode(string|FieldMode $mode): FieldMode {
    if (is_string($mode)) {
      return FieldMode::from($mode);
    }

    return $mode;
  }

  /**
   * Render the unified field component view.
   */
  public function render(): View|Closure|string {
    return view('components.form.field', [
      'component' => $this,
    ]);
  }
}
