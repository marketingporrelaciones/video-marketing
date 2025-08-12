<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- Título y Metadatos SEO dinámicos --}}
    <title>{{ $videomarketing->seo_title ?: $videomarketing->title }}</title>
    <meta name="description" content="{{ $videomarketing->seo_description }}">
    <meta name="keywords" content="{{ $videomarketing->focus_keyphrase }}">
    <meta name="robots" content="{{ $videomarketing->meta_robots_index ? 'index' : 'noindex' }}, {{ $videomarketing->meta_robots_follow ? 'follow' : 'nofollow' }}">

    @if($videomarketing->canonical_url)
        <link rel="canonical" href="{{ $videomarketing->canonical_url }}" />
    @endif

    {{-- Metadatos para Redes Sociales (Open Graph) --}}
    <meta property="og:title" content="{{ $videomarketing->og_title ?: $videomarketing->title }}" />
    <meta property="og:description" content="{{ $videomarketing->og_description ?: $videomarketing->seo_description }}" />
    <meta property="og:image" content="{{ $videomarketing->og_image ? asset('storage/' . $videomarketing->og_image) : ($videomarketing->custom_thumbnail ? asset('storage/' . $videomarketing->custom_thumbnail) : 'https://i.ytimg.com/vi/' . $videomarketing->video_id . '/maxresdefault.jpg') }}" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:type" content="video.other" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $videomarketing->og_title ?: $videomarketing->title }}">
    <meta name="twitter:description" content="{{ $videomarketing->og_description ?: $videomarketing->seo_description }}">
    <meta name="twitter:image" content="{{ $videomarketing->og_image ? asset('storage/' . $videomarketing->og_image) : ($videomarketing->custom_thumbnail ? asset('storage/' . $videomarketing->custom_thumbnail) : 'https://i.ytimg.com/vi/' . $videomarketing->video_id . '/maxresdefault.jpg') }}">

    <script type="application/ld+json">
        @php
            $video_ld = [
                "@context" => "https://schema.org",
                "@type" => "VideoObject",
                "name" => $videomarketing->seo_title ?: $videomarketing->title,
                "description" => $videomarketing->seo_description,
                "thumbnailUrl" => $videomarketing->custom_thumbnail ? asset('storage/' . $videomarketing->custom_thumbnail) : 'https://i.ytimg.com/vi/' . $videomarketing->video_id . '/maxresdefault.jpg',
                "uploadDate" => $videomarketing->created_at->toIso8601String(),
                "duration" => "PT" . str_replace(':', 'M', $videomarketing->video_duration ?? '0') . 'S',
                "embedUrl" => url()->current(),
                "interactionStatistic" => [
                    "@type" => "InteractionCounter",
                    "interactionType" => ["@type" => "http://schema.org/WatchAction"],
                    "userInteractionCount" => $videomarketing->view_count ?: 0
                ]
            ];

            if ($videomarketing->focus_keyphrase) {
                $video_ld['keywords'] = $videomarketing->focus_keyphrase;
            }

            // Nota: Asumimos que tendrás relaciones llamadas 'chapters' y 'transcript' en tu modelo Reproductor
            /*
            if ($videomarketing->chapters->isNotEmpty()) {
                $video_ld['hasPart'] = $videomarketing->chapters->map(function ($chapter) {
                    return [
                        "@type" => "Clip",
                        "name" => $chapter->titulo,
                        "startOffset" => $chapter->tiempo_inicio,
                        "url" => url()->current() . '#t=' . $chapter->tiempo_inicio
                    ];
                });
            }
            */
        @endphp
        {!! json_encode($video_ld, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    </script>


    <link rel="stylesheet" href="{{ asset('assets/css/player.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/animations.css') }}">
    <style>
        :root {
            --main-color: {{ $videomarketing->color_principal ?? '#0084ff' }};
            --controls-color: {{ $videomarketing->color_controles ?? '#ffffff' }};
            --bars-bg-color: {{ $videomarketing->color_barras ?? '#4a4e56' }};
        }
    </style>
</head>
<body>
    {{-- El controlador ya maneja el error 404 si no encuentra el video.
         Por lo tanto, no necesitamos un @if para el error.
         Simplemente mostramos el contenido. --}}
        <div class="main-wrapper">
            @if ($videomarketing->password_enabled)
                <div id="password-overlay" class="password-overlay">
                    <div class="password-form-container">
                        <h3>Contenido Protegido</h3>
                        <p>Este video está protegido. Por favor, ingresa la contraseña para continuar.</p>
                        <form id="password-form">
                            <input type="password" id="password-input" placeholder="Contraseña" required>
                            <button type="submit">Desbloquear</button>
                            <p id="password-error" class="password-error-message"></p>
                        </form>
                    </div>
                </div>
            @endif
            <div id="player-container">
                <div id="youtube-player"></div>
                <div class="logo-blocker"></div> </div>
            </div>

            {{-- La lógica para obtener los capítulos ahora debería estar en el controlador
                y pasarse a través de una relación en el modelo. --}}
            @if ($videomarketing->chapters && $videomarketing->chapters->isNotEmpty())
                <div class='chapters-section-cliente' style='max-width: 900px; margin: 20px auto; background-color: #24262d; border-radius: 8px; padding: 20px;'>
                    <h3 style='margin-top:0; color: #fff;'>En este video:</h3>
                    <ul class='chapters-list-cliente' style='list-style: none; padding: 0;'>

                        @foreach ($videomarketing->chapters as $chapter)
                            <li>
                                <a href='{{ url()->current() . '#t=' . $chapter->tiempo_inicio }}' class='chapter-link' data-time='{{ $chapter->tiempo_inicio }}'>
                                    <span class='chapter-time-cliente'>{{ gmdate("i:s", $chapter->tiempo_inicio) }}</span>
                                    <span class='chapter-title-cliente'>{{ $chapter->titulo }}</span>
                                </a>
                            </li>
                        @endforeach

                    </ul>
                </div>
            @endif

            <div id="external-cta-container" class="hidden">
                <?php // El botón se creará aquí con JavaScript ?>
            </div>
        </div>
        <script>
            const playerConfig = @json($videomarketing);

            // Detecta si la página está incrustada en un iframe
            if (window.self !== window.top) {
                document.body.classList.add('is-embedded'); // Añade clase si está incrustado
            } else {
                document.body.classList.add('is-standalone'); // Añade clase si se ve directamente
            }
        </script>
        <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
        <script src="{{ asset('assets/js/player.js') }}" defer></script>

        <script>
            document.addEventListener('DOMContentLoaded', () => {
                // Seleccionamos todos los enlaces de la lista de capítulos
                const chapterLinks = document.querySelectorAll('.chapters-section-cliente .chapter-link');

                chapterLinks.forEach(link => {
                    link.addEventListener('click', (event) => {
                        // 1. Prevenimos que el navegador recargue la página
                        event.preventDefault();

                        // 2. Comprobamos que el reproductor 'player' exista y esté listo
                        if (typeof player !== 'undefined' && typeof player.seekTo === 'function') {
                            const time = link.dataset.time; // Obtenemos el tiempo del atributo data-time
                            player.seekTo(time, true);     // Damos la orden al reproductor de saltar
                            player.playVideo();            // Opcional: El video continúa la reproducción
                        }
                    });
                });
            });
        </script>
    </body>
</html>

