<?php

namespace App\Utils;

class ProfilePictureUtil {
  /**
   * Normalize an uploaded image before storing it in the users table.
   *
   * Avatars are displayed small, so keeping the original camera PNG/JPEG
   * wastes database space and makes every response containing a user slower.
   * The returned bytes are always a JPEG, which keeps the existing data URL
   * response format intact while providing a predictable upper bound.
   */
  public static function optimize(string $contents, int $maxDimension = 512, int $quality = 82): string {
    if (!function_exists('imagecreatefromstring')) {
      return $contents;
    }

    $source = @imagecreatefromstring($contents);
    if ($source === false) {
      return $contents;
    }

    $width = imagesx($source);
    $height = imagesy($source);
    $scale = min(1, $maxDimension / max($width, $height));
    $targetWidth = max(1, (int) round($width * $scale));
    $targetHeight = max(1, (int) round($height * $scale));

    $destination = imagecreatetruecolor($targetWidth, $targetHeight);

    // JPEG has no alpha channel. Use white so transparent PNG avatars remain
    // visually clean instead of becoming black when converted.
    $white = imagecolorallocate($destination, 255, 255, 255);
    imagefill($destination, 0, 0, $white);
    imagecopyresampled(
      $destination,
      $source,
      0,
      0,
      0,
      0,
      $targetWidth,
      $targetHeight,
      $width,
      $height,
    );

    ob_start();
    imagejpeg($destination, null, $quality);
    $optimized = ob_get_clean();

    imagedestroy($source);
    imagedestroy($destination);

    return $optimized !== false && $optimized !== '' ? $optimized : $contents;
  }

  public static function toBase64(?string $blob): ?string {
    if (!$blob) {
      return null;
    }

    $mimeType = finfo_buffer(finfo_open(FILEINFO_MIME_TYPE), $blob);

    return 'data:' . $mimeType . ';base64,' . base64_encode($blob);
  }
}
