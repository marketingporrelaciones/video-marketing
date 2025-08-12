<?php
// /video/integracion.php
?>

<div class="setting-section">
    <h3 class="section-title">Captura de Correos (Formulario en Video)</h3>
    <div class="section-content">
        <div class="form-group-checkbox">
            <label for="lead_form_enabled" class="switch-label">Activar formulario de captura</label>
            <label class="switch">
                <input type="checkbox" id="lead_form_enabled" name="lead_form_enabled">
                <span class="slider round"></span>
            </label>
        </div>
    </div>

    <div class="section-content">
        <div class="form-group-vertical">
            <label for="lead_form_headline">Título del formulario</label>
            <input type="text" id="lead_form_headline" name="lead_form_headline">
        </div>
        <div class="form-group-vertical">
            <label for="lead_form_description">Descripción del formulario</label>
            <textarea id="lead_form_description" name="lead_form_description" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label for="lead_form_timestamp">Mostrar en el segundo</label>
            <input type="number" id="lead_form_timestamp" name="lead_form_timestamp" min="0" placeholder="Ej: 5">
        </div>
        <div class="form-group">
            <label for="lead_form_button_text">Texto del botón</label>
            <input type="text" id="lead_form_button_text" name="lead_form_button_text" placeholder="Ej: Continuar Viendo">
        </div>
        <div class="form-group-checkbox">
            <label for="lead_form_allow_skip" class="switch-label">Permitir al usuario saltar el formulario</label>
            <label class="switch">
                <input type="checkbox" id="lead_form_allow_skip" name="lead_form_allow_skip">
                <span class="slider round"></span>
            </label>
        </div>
    </div>
</div>

<div class="setting-section">
    <h3 class="section-title">Conexión (Webhook)</h3>
    <div class="section-content">
        <div class="form-group-vertical">
            <label for="webhook_url">URL del Webhook (Opcional)</label>
            <input type="text" id="webhook_url" name="webhook_url" placeholder="https://...">
            <small>Pega aquí la URL para enviar los datos de los correos a otro servicio (ej: Zapier).</small>
        </div>
    </div>
</div>
<div class="setting-section">
    <h3 class="section-title">Seguimiento y Analítica</h3>
    <div class="form-group-vertical">
        <label for="facebook_pixel_id">ID del Píxel de Facebook</label>
        <input type="text" id="facebook_pixel_id" name="facebook_pixel_id" placeholder="Pega aquí solo el número de ID">
        <small>Permite rastrear eventos para tus campañas en Facebook e Instagram.</small>
    </div>
</div>
<div class="setting-section">
    <h3 class="section-title">CTA Externo (Debajo del Reproductor)</h3>
    <div class="section-content">
        <div class="form-group-checkbox">
            <label for="cta_externo_enabled" class="switch-label">Activar Boton Externo</label>
            <label class="switch">
                <input type="checkbox" id="cta_externo_enabled" name="cta_externo_enabled">
                <span class="slider round"></span>
            </label>
        </div>
        <small>Aparecerá boton debajo del video.</small>

        <div class="form-group">
            <label for="cta_externo_text">Texto del botón</label>
            <input type="text" id="cta_externo_text" name="cta_externo_text" placeholder="Ej: Comprar Ahora">
        </div>

        <div class="form-group">
            <label for="cta_externo_url">URL de Destino</label>
            <input type="text" id="cta_externo_url" name="cta_externo_url" placeholder="https://...">
        </div>

        <div class="form-group" style="gap: 10px;">
            <label>Tiempo de aparición</label>
            <div style="display: flex; align-items: center; gap: 5px; width: 55%;">
                <input type="number" id="cta_externo_timestamp_mm" style="width: 100%;" min="0" placeholder="MM">
                <span>:</span>
                <input type="number" id="cta_externo_timestamp_ss" style="width: 100%;" min="0" max="59" placeholder="SS">
            </div>
        </div>
    </div>
</div>
<div class="setting-section">
    <h3 class="section-title">boton</h3>
    <div class="form-group">
        <label for="cta_externo_bg_color">Color de fondo</label>
        <input type="color" id="cta_externo_bg_color" name="cta_externo_bg_color">
    </div>

    <div class="form-group">
        <label for="cta_externo_text_color">Color de texto</label>
        <input type="color" id="cta_externo_text_color" name="cta_externo_text_color">
        </div>
</div>
