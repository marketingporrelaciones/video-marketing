{{-- /resources/views/editor/partials/ajustes.blade.php --}}

<div class="setting-section">
    <h3 class="section-title">Fuente del Video</h3>
    <div class="section-content">
        <div class="form-group-vertical">
            <label for="video_id">URL del Video de YouTube</label>
            {{-- Usamos la variable $videomarketing para mostrar la URL actual --}}
            <input type="text" id="video_id" name="video_id" value="https://www.youtube.com/watch?v={{ $videomarketing->video_id }}" placeholder="Pega la URL completa de YouTube">
            <small>Pega aquí la URL completa del video para cambiar la fuente.</small>
        </div>
    </div>
</div>

<div class="setting-section">
    <h3 class="section-title">Información y URL SEO</h3>
    <div class="section-content">
        <div class="form-group-vertical">
            <label for="title">Nombre Interno (Tu referencia)</label>
            <input type="text" id="title" name="title" value="{{ old('title', $videomarketing->title) }}" placeholder="Ej: Video Campaña Verano 2025">
        </div>
        <div class="form-group-vertical">
            <label for="slug">URL Amigable (Slug)</label>
            <input type="text" id="slug" name="slug" value="{{ old('slug', $videomarketing->slug) }}" placeholder="Ej: mi-lanzamiento-exitoso">
            <small>Solo letras minúsculas, números y guiones. Debe ser único.</small>
        </div>
    </div>
</div>

<div class="setting-section">
    <h3 class="section-title">Pruebas Divididas A/B</h3>
    <div class="section-content">
        <div id="ab-variants-container">
            {{-- El contenido de las variantes se genera con JavaScript --}}
        </div>

        <div class="form-group-vertical" style="margin-top: 20px;">
            <button type="button" id="add-ab-variant-btn" class="btn-primary" style="width: 100%;">
                <i data-feather="plus" style="margin-right: 5px;"></i> Añadir Variante de Video
            </button>
            <small style="text-align: center; color: #a0a7b1;">Añade videos adicionales para tu prueba A/B.</small>
        </div>

        <div class="form-group" style="margin-top: 20px; border-top: 1px solid #30323a; padding-top: 20px;">
            <label>Total de Porcentaje:</label>
            <span id="total-percentage" style="font-weight: bold; color: #0084ff;">0%</span>
        </div>
        <small style="text-align: center; color: #a0a7b1;">Siempre, asegúrate de que la suma sea 100%.</small>
    </div>
</div>

<div class="setting-section">
    <h3 class="section-title">Seguridad y Privacidad</h3>
    <div class="section-content">
        <div class="form-group-checkbox">
            <label for="password_enabled" class="switch-label">Activar contraseña</label>
            <label class="switch">
                {{-- Usamos la directiva @checked de Blade para marcar el checkbox si el valor es true/1 --}}
                <input type="checkbox" id="password_enabled" name="password_enabled" value="1" @checked(old('password_enabled', $videomarketing->password_enabled))>
                <span class="slider round"></span>
            </label>
        </div>
        <div class="form-group-vertical">
            <label for="video_password">Contraseña del video</label>
            <input type="password" id="video_password" name="video_password" placeholder="Escribe una contraseña segura">
            <small>Si la protección está activada, se pedirá esta contraseña para ver el video.</small>
        </div>
    </div>
</div>
