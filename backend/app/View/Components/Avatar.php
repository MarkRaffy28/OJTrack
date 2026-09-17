<?php

namespace App\View\Components;

use App\Enums\FieldMode;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Avatar extends Component {
  public FieldMode $mode;
  public string $size;
  private array $sizeMap = [
    'sm' => 48,
    'md' => 80,
    'lg' => 120,
  ];

  public function __construct(
    public ?User $user = null,
    string|FieldMode $mode = FieldMode::VIEW,
    string $size = 'md',
    public string $inputName = 'profile_picture',
  ) {
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
    $this->size = in_array($size, array_keys($this->sizeMap)) ? $size : 'md';
  }

  /**
   * Get the pixel size for the current size prop.
   */
  public function sizePixels(): int {
    return $this->sizeMap[$this->size];
  }

  /**
   * Get initials from user (first letter of first name + first letter of last name).
   */
  public function initials(): string {
    if (!$this->user) {
      return '';
    }
    $first = strtoupper(substr($this->user->first_name ?? '', 0, 1));
    $last = strtoupper(substr($this->user->last_name ?? '', 0, 1));
    return $first . $last;
  }

  /**
   * Check if user has a profile picture.
   */
  public function hasProfilePicture(): bool {
    return $this->user && !is_null($this->user->profile_picture);
  }

  /**
   * Get profile picture as base64 data URL.
   */
  public function profilePictureDataUrl(): string {
    if (!$this->hasProfilePicture()) {
      return '';
    }
    $binary = $this->user->profile_picture;
    $base64 = base64_encode($binary);
    return 'data:image/jpeg;base64,' . $base64;
  }

  /**
   * Get background color for initials circle (deterministic based on initials).
   */
  public function initialsBackgroundColor(): string {
    $colors = [
      'bg-primary-500',
      'bg-primary-400',
      'bg-primary-600',
    ];
    $hash = crc32($this->initials()) % count($colors);
    return $colors[$hash];
  }

  /**
   * Whether the avatar is in edit mode.
   */
  public function isEditable(): bool {
    return $this->mode === FieldMode::EDIT;
  }

  public function render(): View|Closure|string {
    return view('components.avatar');
  }
}