<?php
// Este archivo se cargará dinámicamente con AJAX.
// En el futuro, si necesitamos datos específicos para SEO, los cargaremos aquí.
?>

<div class="setting-section">
    <h3 class="section-title">Metadatos Principales</h3>
    <div class="section-content">

        <div class="form-group-vertical">
            <div class="label-container">
                <label for="seo_title">Título para SEO (Meta Título)</label>
                <span class="char-counter" id="title-char-counter">0 / 60</span>
            </div>
            <input type="text" id="seo_title" name="seo_title" placeholder="El titular para los buscadores">
        </div>

        <div class="form-group-vertical">
            <div class="label-container">
                <label for="seo_description">Descripción para SEO (Meta Descripción)</label>
                <span class="char-counter" id="desc-char-counter">0 / 160</span>
            </div>
            <textarea id="seo_description" name="seo_description" rows="3" placeholder="El párrafo que aparecerá en Google..."></textarea>
        </div>

        <!-- <div class="form-group-vertical">
            <label for="keywords-input">Palabras Clave</label>
            <div class="keywords-container" id="keywords-container">
                <input type="text" id="keywords-input" placeholder="Añade una palabra y presiona Enter...">
            </div>
            <input type="hidden" id="seo_keywords" name="seo_keywords">
            <small>Presiona Enter o escribe una coma (,) para añadir una etiqueta.</small>
        </div> -->
        <div class="form-group-vertical">
            <label for="focus_keyphrase">Frase Clave Objetivo</label>
            <input type="text" id="focus_keyphrase" name="focus_keyphrase" class="form-control" value="<?php echo htmlspecialchars($config['focus_keyphrase'] ?? ''); ?>" placeholder="Ej: cómo hacer tarta de manzana casera">
            <small class="form-text text-muted">Escribe la palabra o frase principal "Consultas de Búsqueda por Google".</small>

            <div id="keyphrase-analysis-results" style="margin-top: 15px;"></div>
        </div>
    </div>
</div>

<div class="setting-section">
    <h3 class="section-title">Datos Estructurados y Robots</h3>
    <div class="section-content">
        <div class="form-group">
            <label for="video_duration">Duración del Video</label>
            <input type="text" id="video_duration" name="video_duration" placeholder="MM:SS">
        </div>
        <div class="form-group-checkbox">
            <label class="switch"><input type="checkbox" id="meta_robots_index" name="meta_robots_index"><span class="slider round"></span></label>
            <label for="meta_robots_index" class="switch-label">Permitir Indexación (index)</label>
        </div>
        <div class="form-group-checkbox">
            <label class="switch"><input type="checkbox" id="meta_robots_follow" name="meta_robots_follow"><span class="slider round"></span></label>
            <label for="meta_robots_follow" class="switch-label">Permitir Seguimiento (follow)</label>
        </div>
        <div class="form-group-vertical">
            <label for="canonical_url">URL Canónica</label>
            <input type="text"id="canonical_url" name="canonical_url" placeholder="https//...(No agrega si no estás seguro)">
            <small>Evita contenido duplicado indicando la URL principal.</small>
        </div>
    </div>
    <div class="setting-section">
    <h3 class="section-title">Redes Sociales (Open Graph)</h3>
    <div class="section-content">
        <div class="form-group-vertical">
            <div class="label-container">
                <label for="og_title">Título para Redes Sociales</label>
                <span class="char-counter" id="og-title-counter">0 / 70</span>
            </div>
            <input type="text" id="og_title" name="og_title" placeholder="El titular para Facebook, WhatsApp, etc.">
            <small>Si se deja en blanco, se usará el Título SEO.</small>
        </div>
        <div class="form-group-vertical">
            <div class="label-container">
                <label for="og_description">Descripción para Redes Sociales</label>
                <span class="char-counter" id="og-desc-counter">0 / 200</span>
            </div>
            <textarea id="og_description" name="og_description" rows="3" placeholder="El texto que aparecerá al compartir el enlace."></textarea>
            <small>Si se deja en blanco, se usará la Descripción SEO.</small>
        </div>
        <div class="form-group-vertical">
            <div class="thumbnail-header">
                <label for="og_image">Imagen para Redes Sociales</label>
                <button type="button" id="delete-og-image-btn" class="btn-delete-thumb" style="display: none;">Eliminar</button>
            </div>
            <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" id="og-image-preview" alt="Vista previa de Redes Sociales" style="max-width: 100%; border-radius: 8px; border: 1px solid #4a4e56; margin-top: 5px; display: none;">
            <input type="file" id="og_image" name="og_image" accept="image/jpeg, image/png, image/gif">
            <input type="hidden" name="delete_og_image" id="delete_og_image_input" value="0">
            <small>Recomendado: 1200x630px. Si no se sube, se usará la miniatura principal.</small>
        </div>
    </div>
</div>
</div>
