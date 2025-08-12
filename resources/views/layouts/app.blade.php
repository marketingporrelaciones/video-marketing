<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Player Pro' }}</title>

    <link rel="stylesheet" href="{{ asset('assets/css/main.css') }}">

    @stack('styles')
</head>
<body>
    <div class="app-layout">

        @include('layouts.navigation')

        <main class="app-main-content">
            {{ $slot }}
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <script>
      feather.replace();
    </script>
    <script src="{{ asset('assets/js/main.js') }}"></script>

    @stack('scripts')
</body>
</html>
