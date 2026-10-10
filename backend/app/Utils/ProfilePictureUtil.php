<?php

namespace App\Utils;

class ProfilePictureUtil {
  public static function toBase64(?string $blob): ?string {
    if (!$blob) {
      return null;
    }

    $mimeType = finfo_buffer(finfo_open(FILEINFO_MIME_TYPE), $blob);

    return 'data:' . $mimeType . ';base64,' . base64_encode($blob);
  }
}
