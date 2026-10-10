<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>@yield ("title", "Report")</title>

  <link rel="shortcut icon" href="{{ asset('images/logo.png') }}" type="image/png" />

  <style>
    @page {
      margin: 20px;
    }

    body {
      font-family:
        DejaVu Sans,
        sans-serif;
      font-size: 9px;
      color: #333;
    }

    h1 {
      font-size: 16px;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 12px;
      margin-top: 20px;
      margin-bottom: 6px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    th,
    td {
      border: 1px solid #000;
      padding: 4px;
      text-align: left;
    }

    th {
      font-weight: bold;
      background: #eee;
    }

    .footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: right;
      font-size: 8px;
      color: #777;
    }
  </style>

  @stack ("styles")
</head>

<body>
  <h1>@yield ("header_title")</h1>

  <div class="content">
    @yield ("content")
  </div>

  <div class="footer">Generated on {{ now()->format("Y-m-d H:i") }}</div>
</body>
</html>
