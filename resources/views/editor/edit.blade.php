<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Editando: {{ $videomarketing->title }}</title>

    {{-- Cargamos los CSS necesarios directamente aquí --}}
    <link rel="stylesheet" href="{{ asset('assets/css/main.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/editor.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/animations.css') }}">
</head>
    <body class="editor-body">
    <div id="custom-notification" style="display:none; position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #333; color: white; padding: 10px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
        <span id="notification-message"></span>
    </div>

    <div class="editor-header">
        <div class="header-left">
            @if (isset($curso) && $curso)
                {{-- CASO 1: Estamos editando un video que pertenece a un curso --}}
                <a href="{{-- route('cursos.edit', $curso) --}}" class="btn-back">← Volver al Curso</a>
                <h3 class="header-video-id">CURSOS/VIDEOS/{{ $videomarketing->slug }}</h3>
        </div> {{-- Cierre del header-left para el CASO 1 --}}

        <div class="header-right">
                <a href="{{-- route('cursos.show', $curso) --}}" target="_blank" class="btn-action btn-view">Ver Página</a>
            @else
                {{-- CASO 2: Estamos editando un video individual desde Video Marketing --}}
                <a href="{{ route('videomarketing.index') }}" class="btn-back">← Volver a Video Marketing</a>
                <h3 class="header-video-id">VIDEOS/{{ $videomarketing->slug }}</h3>
        </div> {{-- Cierre del header-left para el CASO 2 --}}

        <div class="header-right">
                <a href="{{ route('videomarketing.show', ['videomarketing' => $videomarketing]) }}" target="_blank" class="btn-action btn-view">Ver Página</a>
            @endif

            {{-- Estos botones son comunes para ambos casos --}}
            <button class="btn-action btn-save">Guardar Cambios</button>
            <div class="dropdown-container">
                <button class="btn-action btn-options" id="options-menu-btn"><i data-feather="more-vertical"></i></button>
                <div class="dropdown-menu" id="options-dropdown">
                    <a href="#" id="embed-video-btn" class="dropdown-item"><i data-feather="code"></i> Insertar Video</a>
                    <a href="#" id="seo-code-btn" class="dropdown-item"><i data-feather="zap"></i> Código SEO</a>
                    <a href="#" id="share-video-btn" class="dropdown-item"><i data-feather="share-2"></i> Compartir</a>
                </div>
            </div>
        </div>
    </div>

    <div class="editor-container" id="editor-container" data-config="{{ $videomarketing->toJson() }}">

        <div class="player-column">
            <div id="player-container">
                <div id="youtube-player-preview"></div>
                <div id="player-container-overlay">

                    {{-- Se define la URL de la miniatura de YouTube como una opción de respaldo --}}
                    @php
                        $youtube_thumbnail = 'https://i.ytimg.com/vi/' . $videomarketing->video_id . '/maxresdefault.jpg';
                    @endphp

                    {{-- La lógica PHP se reemplaza con un operador ternario dentro de las llaves de Blade.
                        SI existe una miniatura personalizada, usa la ruta del 'asset'. SI NO, usa la de YouTube. --}}
                    <div class="preview-overlay" style="background-image: url('{{ $videomarketing->custom_thumbnail ? asset('storage/' . $videomarketing->custom_thumbnail) : $youtube_thumbnail }}');">
                        <div class="preview-content-wrapper">
                            <div id="big-play-button"><svg viewBox="0 0 100 100"><polygon points="40,30 70,50 40,70"></polygon></svg></div>
                            <div class="preview-overlay-text"></div>
                        </div>
                    </div>

                    {{-- El resto de los controles son HTML estático y se mantienen igual --}}
                    <div class="custom-controls-bar">
                        <div class="progress-bar-container"><div class="progress-bar"><div class="played-bar"></div><div class="progress-thumb"></div></div></div>
                        <div class="bottom-controls">
                            <div class="controls-left">
                                <button class="control-button skip-button" title="Retroceder 10 segundos"><i data-feather="rotate-ccw"></i><span>10</span></button>
                                <button class="control-button play-pause-button">
                                    <i data-feather="play" class="play-icon"></i>
                                    <i data-feather="pause" class="pause-icon" style="display: none;"></i>
                                </button>
                                <button class="control-button skip-button" title="Adelantar 10 segundos"><i data-feather="rotate-cw"></i><span>10</span></button>
                                <div class="volume-container"><button class="control-button volume-button"><i data-feather="volume-2"></i></button></div><div class="time-display">00:00 / 00:00</div>
                            </div>
                            <div class="controls-right"><button class="control-button settings-button"><i data-feather="settings"></i></button><button class="control-button fullscreen-button"><i data-feather="maximize"></i></button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="settings-column">
            <form id="configForm" method="POST" action="{{ route('videomarketing.update', $config->id) }}">
                @csrf
                @method('PUT')
                <div class="settings-content">
                    <div id="personalizar" class="tab-content">
                        {{-- SECCIÓN COLORES --}}
                        <div class="setting-section">
                            <h3 class="section-title">Colores</h3>
                            <div class="section-content">
                                <div class="form-group">
                                    <label for="color_controles">Color de Controles</label>
                                    <input type="color" id="color_controles" name="color_controles" value="{{ old('color_controles', $videomarketing->color_controles) }}">
                                </div>
                                <div class="form-group">
                                    <label for="color_barras">Color de Progreso</label>
                                    <input type="color" id="color_barras" name="color_barras" value="{{ old('color_barras', $videomarketing->color_barras) }}">
                                </div>
                            </div>
                        </div>

                        {{-- SECCIÓN CONTROLES VISIBLES --}}
                        <div class="setting-section">
                            <h3 class="section-title">Controles Visibles</h3>
                            <div class="section-content" data-columns="2">
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="ctrl_barra_progreso" name="ctrl_barra_progreso" value="1" @checked(old('ctrl_barra_progreso', $videomarketing->ctrl_barra_progreso))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="ctrl_barra_progreso" class="switch-label">Barra de Progreso</label>
                                </div>
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="ctrl_ajustes" name="ctrl_ajustes" value="1" @checked(old('ctrl_ajustes', $videomarketing->ctrl_ajustes))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="ctrl_ajustes" class="switch-label">Ajustes (Calidad)</label>
                                </div>
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="ctrl_volumen" name="ctrl_volumen" value="1" @checked(old('ctrl_volumen', $videomarketing->ctrl_volumen))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="ctrl_volumen" class="switch-label">Control de Volumen</label>
                                </div>
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="ctrl_fullscreen" name="ctrl_fullscreen" value="1" @checked(old('ctrl_fullscreen', $videomarketing->ctrl_fullscreen))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="ctrl_fullscreen" class="switch-label">Pantalla Completa</label>
                                </div>
                            </div>
                        </div>

                        {{-- SECCIÓN BOTÓN DE REPRODUCCIÓN --}}
                        <div class="setting-section">
                            <h3 class="section-title">Botón de Reproducción</h3>
                            <div class="section-content">
                                <div class="form-group">
                                    <label for="color_principal">Color Principal</label>
                                    <input type="color" id="color_principal" name="color_principal" value="{{ old('color_principal', $videomarketing->color_principal) }}">
                                </div>
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="btn_mostrar" name="btn_mostrar" value="1" @checked(old('btn_mostrar', $videomarketing->btn_mostrar))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="btn_mostrar" class="switch-label">Mostrar botón de reproducción</label>
                                </div>
                                <div class="form-group">
                                    <label for="texto_previsualizacion">Texto de Previsualización</label>
                                    <input type="text" id="texto_previsualizacion" name="texto_previsualizacion" value="{{ old('texto_previsualizacion', $videomarketing->texto_previsualizacion) }}" placeholder="Ej: Ver ahora...">
                                </div>
                            </div>
                        </div>

                        {{-- SECCIÓN PREVISUALIZACIÓN --}}
                        <div class="setting-section">
                            <h3 class="section-title">Previsualización</h3>
                            <div class="section-content">
                                <div class="form-group-checkbox">
                                    <label class="switch">
                                        <input type="checkbox" id="prev_automatica" name="prev_automatica" value="1" @checked(old('prev_automatica', $videomarketing->prev_automatica))>
                                        <span class="slider round"></span>
                                    </label>
                                    <label for="prev_automatica" class="switch-label">Previsualización Automática</label>
                                </div>
                            </div>
                        </div>
                        <div class="setting-section">
                            <h3 class="section-title">Animación</h3>
                            <div class="section-content">
                                <div class="form-group">
                                    <label for="animacion">Animación</label>
                                    <select id="animacion" name="animacion">
                                        <option value="none" @selected(old('animacion', $videomarketing->animacion) == 'none')>Ninguna</option>
                                        <option value="bounce" @selected(old('animacion', $videomarketing->animacion) == 'bounce')>bounce</option>
                                            <option value="flash" @selected(old('animacion', $videomarketing->animacion) == "flash")>flash</option>
                                            <option value="pulse"@selected(old('animacion', $videomarketing->animacion) == "pulse")>pulse</option>
                                            <option value="rubberBand"@selected(old('animacion', $videomarketing->animacion) == "rubberBand")>rubberBand</option>
                                            <option value="shakeX"@selected(old('animacion', $videomarketing->animacion) == "shakeX")>shakeX</option>
                                            <option value="shakeY"@selected(old('animacion', $videomarketing->animacion) == "shakeY")>shakeY</option>
                                            <option value="headShake"@selected(old('animacion', $videomarketing->animacion) == "headShake")>headShake</option>
                                            <option value="swing"@selected(old('animacion', $videomarketing->animacion) == "swing")>swing</option>
                                            <option value="tada"@selected(old('animacion', $videomarketing->animacion) == "tada")>tada</option>
                                            <option value="wobble"@selected(old('animacion', $videomarketing->animacion) == "wobble")>wobble</option>
                                            <option value="jello"@selected(old('animacion', $videomarketing->animacion) == "jello")>jello</option>
                                            <option value="heartBeat"@selected(old('animacion', $videomarketing->animacion) == "heartBeat")>heartBeat</option>
                                        </optgroup>
                                        <optgroup label="Back Entrances">
                                            <option value="backInDown"@selected(old('animacion', $videomarketing->animacion) == "backInDown")>backInDown</option>
                                            <option value="backInLeft"@selected(old('animacion', $videomarketing->animacion) == "backInLeft")>backInLeft</option>
                                            <option value="backInRight"@selected(old('animacion', $videomarketing->animacion) == "backInRight")>backInRight</option>
                                            <option value="backInUp"@selected(old('animacion', $videomarketing->animacion) == "backInUp")>backInUp</option>
                                        </optgroup>
                                        <optgroup label="Bouncing Entrances">
                                            <option value="bounceIn"@selected(old('animacion', $videomarketing->animacion) == "bounceIn")>bounceIn</option>
                                            <option value="bounceInDown"@selected(old('animacion', $videomarketing->animacion) == "bounceInDown")>bounceInDown</option>
                                            <option value="bounceInLeft"@selected(old('animacion', $videomarketing->animacion) == "bounceInLeft")>bounceInLeft</option>
                                            <option value="bounceInRight"@selected(old('animacion', $videomarketing->animacion) == "bounceInRight")>bounceInRight</option>
                                            <option value="bounceInUp"@selected(old('animacion', $videomarketing->animacion) == "bounceInUp")>bounceInUp</option>
                                        </optgroup>
                                        <optgroup label="Fading Entrances">
                                            <option value="fadeIn"@selected(old('animacion', $videomarketing->animacion) == "fadeIn")>fadeIn</option>
                                            <option value="fadeInDown"@selected(old('animacion', $videomarketing->animacion) == "fadeInDown")>fadeInDown</option>
                                            <option value="fadeInDownBig"@selected(old('animacion', $videomarketing->animacion) == "fadeInDownBig")>fadeInDownBig</option>
                                            <option value="fadeInLeft"@selected(old('animacion', $videomarketing->animacion) == "fadeInLeft")>fadeInLeft</option>
                                            <option value="fadeInLeftBig"@selected(old('animacion', $videomarketing->animacion) == "fadeInLeftBig")>fadeInLeftBig</option>
                                            <option value="fadeInRight"@selected(old('animacion', $videomarketing->animacion) == "fadeInRight")>fadeInRight</option>
                                            <option value="fadeInRightBig"@selected(old('animacion', $videomarketing->animacion) == "fadeInRightBig")>fadeInRightBig</option>
                                            <option value="fadeInUp"@selected(old('animacion', $videomarketing->animacion) == "fadeInUp")>fadeInUp</option>
                                            <option value="fadeInUpBig"@selected(old('animacion', $videomarketing->animacion) == "fadeInUpBig")>fadeInUpBig</option>
                                        </optgroup>
                                        <optgroup label="Flippers">
                                            <option value="flip"@selected(old('animacion', $videomarketing->animacion) == "flip")>flip</option>
                                            <option value="flipInX"@selected(old('animacion', $videomarketing->animacion) == "flipInX")>flipInX</option>
                                            <option value="flipInY"@selected(old('animacion', $videomarketing->animacion) == "flipInY")>flipInY</option>
                                        </optgroup>
                                        <optgroup label="Lightspeed">
                                            <option value="lightSpeedInRight"@selected(old('animacion', $videomarketing->animacion) == "lightSpeedInRight")>lightSpeedInRight</option>
                                            <option value="lightSpeedInLeft"@selected(old('animacion', $videomarketing->animacion) == "lightSpeedInLeft")>lightSpeedInLeft</option>
                                        </optgroup>
                                        <optgroup label="Rotating Entrances">
                                            <option value="rotateIn"@selected(old('animacion', $videomarketing->animacion) == "rotateIn")>rotateIn</option>
                                            <option value="rotateInDownLeft"@selected(old('animacion', $videomarketing->animacion) == "rotateInDownLeft")>rotateInDownLeft</option>
                                            <option value="rotateInDownRight"@selected(old('animacion', $videomarketing->animacion) == "rotateInDownRight")>rotateInDownRight</option>
                                            <option value="rotateInUpLeft"@selected(old('animacion', $videomarketing->animacion) == "rotateInUpLeft")>rotateInUpLeft</option>
                                            <option value="rotateInUpRight"@selected(old('animacion', $videomarketing->animacion) == "rotateInUpRight")>rotateInUpRight</option>
                                        </optgroup>
                                        <optgroup label="Zooming Entrances">
                                            <option value="zoomIn"@selected(old('animacion', $videomarketing->animacion) == "zoomIn")>zoomIn</option>
                                            <option value="zoomInDown"@selected(old('animacion', $videomarketing->animacion) == "zoomInDown")>zoomInDown</option>
                                            <option value="zoomInLeft"@selected(old('animacion', $videomarketing->animacion) == "zoomInLeft")>zoomInLeft</option>
                                            <option value="zoomInRight"@selected(old('animacion', $videomarketing->animacion) == "zoomInRight")>zoomInRight</option>
                                            <option value="zoomInUp"@selected(old('animacion', $videomarketing->animacion) == "zoomInUp")>zoomInUp</option>
                                        </optgroup>
                                        <optgroup label="Sliding Entrances">
                                            <option value="slideInDown"@selected(old('animacion', $videomarketing->animacion) == "slideInDown")>slideInDown</option>
                                            <option value="slideInLeft"@selected(old('animacion', $videomarketing->animacion) == "slideInLeft")>slideInLeft</option>
                                            <option value="slideInRight"@selected(old('animacion', $videomarketing->animacion) == "slideInRight")>slideInRight</option>
                                            <option value="slideInUp"@selected(old('animacion', $videomarketing->animacion) == "<slideInUp></slideInUp>")>slideInUp</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            <div class="setting-section">
                                <h3 class="section-title">Miniatura</h3>
                                <div class="section-content">
                                    <div class="form-group-vertical">
                                        <div class="thumbnail-header">
                                            <label for="custom_thumbnail">Personalizada</label>
                                            <button type="button" id="delete-thumbnail-btn" class="btn-delete-thumb" @if(empty($videomarketing->custom_thumbnail)) style="display: none;" @endif>Eliminar</button>
                                        </div>

                                        {{-- 1. La imagen de previsualización ahora es una etiqueta <img> --}}
                                        <img src="{{ $videomarketing->custom_thumbnail ? asset('storage/' . $videomarketing->custom_thumbnail) : 'https://i.ytimg.com/vi/' . $videomarketing->video_id . '/mqdefault.jpg' }}" id="thumbnail-preview" alt="Vista previa de la miniatura">

                                        {{-- 2. Los controles del formulario son hermanos de la imagen, no sus hijos --}}
                                        <input type="file" id="custom_thumbnail" name="custom_thumbnail" accept="image/jpeg, image/png, image/gif">
                                        <input type="hidden" name="delete_thumbnail" id="delete_thumbnail_input" value="0">
                                        <small>Recomendado: 1280x720px. Máx 1MB. Tipos: JPG, PNG.</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="dynamic-content-panel" class="tab-content-panel" style="display: none;"></div>
                        <div id="dynamic-content-container"></div>
                    </div>
            </form>
            <div class="settings-navbar">
                <div class="navbar-header"><button class="btn-toggle-navbar" id="toggle-navbar-btn" title="Ocultar menú"><i data-feather="chevron-right"></i></button></div>
                <div class="navbar-links">
                    <button class="tab-link active" data-tab="personalizar" data-target-type="static"><i data-feather="sliders"></i><span class="nav-text">Personalizar</span></button>

                    {{-- ✅ CORRECCIÓN: Cambiamos 'reproductor.ajax.*' por 'editor.ajax.*' para que coincida con web.php --}}
                    <button class="tab-link" data-tab="seo" data-target-type="ajax" data-source="{{ route('editor.ajax.seo', $videomarketing) }}"><i data-feather="bar-chart-2"></i><span class="nav-text">SEO</span></button>

                    {{-- He dejado las otras rutas como '#' para que no den error mientras las creamos. --}}
                    <button class="tab-link" data-tab="integracion" data-target-type="ajax" data-source="#"><i data-feather="share-2"></i><span class="nav-text">Integración</span></button>
                    <button class="tab-link" data-tab="capitulos" data-target-type="ajax" data-source="#"><i data-feather="list"></i><span class="nav-text">Capítulos</span></button>
                    <button class="tab-link" data-tab="ajustes" data-target-type="ajax" data-source="#"><i data-feather="settings"></i><span class="nav-text">Ajustes</span></button>
                </div>

            </div>
        </div>
    </div>
    <div id="embed-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 650px;">
            <span class="close-modal-btn">×</span>
            <h2>Insertar Video</h2>
            <p>Copia y pega este código para mostrar tu video en cualquier página web.</p>

            <div class="embed-section">
                <h4>Código Responsivo (Recomendado)</h4>
                <p class="embed-description">Este código se adapta a cualquier tamaño de pantalla, ideal para móviles.</p>
                <div class="code-box">
                    <pre><code id="responsive-embed-code"></code></pre>
                    <button class="copy-code-btn" data-target="responsive-embed-code">Copiar</button>
                </div>
            </div>

            <div class="embed-section">
                <h4>Código con Tamaño Fijo</h4>
                <div class="size-inputs">
                    <label>Ancho: <input type="number" id="embed-width" value="640">px</label>
                    <label>Alto: <input type="number" id="embed-height" value="360">px</label>
                </div>
                <div class="code-box">
                    <pre><code id="fixed-embed-code"></code></pre>
                    <button class="copy-code-btn" data-target="fixed-embed-code">Copiar</button>
                </div>
            </div>
        </div>
    </div>

    <div id="seo-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 650px;">
            <span class="close-modal-btn">×</span>
            <h2>Código SEO (JSON-LD) para Posicionamiento</h2>
            <p class="embed-description">Pega este código <u>dentro de (`&lt;head&gt;`)</u> de la página que quieres posicionar.</p>
            <div class="embed-warning">
                <p>⚠️ <strong>Guía Rápida de SEO para esta Página:</strong></p>
                <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 0.9em; color: #d1d5db;">
                    <li style="margin-bottom: 8px;"><strong>URL Canónica:</strong> Rellena este campo con la URL de la página principal que quieres posicionar.</li>
                    <li style="margin-bottom: 8px;"><strong>Permitir Indexación (index):</strong> Desactívalo (NO). Esto evita que Google indexe la página del video por duplicado.</li>
                    <li><strong>Permitir Seguimiento (follow):</strong> Mantenlo activado (SÍ). Esto permite que la "fuerza" del video pase a tu página principal.</li>
                </ul>
            </div>

            <div class="embed-section">
                <div class="code-box">
                    <pre><code id="seo-only-code"></code></pre>
                    <button class="copy-code-btn" data-target="seo-only-code">Copiar</button>
                </div>
            </div>
        </div>
    </div>
    <div id="share-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <span class="close-modal-btn">×</span>
            <h2>Compartir Video</h2>
            <p>Usa el siguiente enlace o el botón para compartir tu video.</p>

            <div class="share-section">
                <input type="text" id="share-link-input" readonly>
                <button class="copy-code-btn" id="copy-share-link-btn">Copiar Enlace</button>
            </div>

            <div class="share-section">
                <button class="btn-primary" id="native-share-btn" style="width: 100%;">
                    <i data-feather="share-2" style="margin-right: 8px;"></i> Compartir ahora...
                </button>
            </div>
        </div>
    </div>

{{-- Los scripts de CDNs externas se mantienen igual --}}

</body>

    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <script>
      feather.replace(); // Es importante ejecutar esto después de que el HTML exista
    </script>
    <script src="{{ asset('assets/js/editor.js') }}"></script>
    <script src="{{ asset('assets/js/ab_testing.js') }}"></script>
</body>
</html>
