// /video/assets/js/editor.js (VERSIÓN FINAL, COMPLETA Y CORRECTA)

document.addEventListener('DOMContentLoaded', () => {
    // CURSO: Nuestra "caja de memoria" para todos los cambios no guardados.
    window.unsavedChanges = {};
    // CURSO: Aquí creamos nuestra "caja de memoria" global. Es un objeto vacío
    // llamado tempImageFiles que vivirá mientras la página del editor esté abierta.
    // Usamos window. para asegurarnos de que sea accesible desde cualquier parte del script.
    window.tempImageFiles = {};

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.previewPlayer = null;

    const editorContainer = document.getElementById('editor-container');
    const configForm = document.getElementById('configForm');
    if (!editorContainer || !configForm) return;

    // Función para construir una URL de visualización estándar de YouTube
    window.buildYouTubeDisplayUrl = function(videoId) {
        if (!videoId) return '';
        return `https://www.youtube.com/watch?v=${videoId}`;
    };

    // Función para extraer el ID de cualquier formato de URL de YouTube.
    window.getYouTubeID = function(url) {
        if (!url) return '';
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : url;
    };

    window.configData = JSON.parse(editorContainer.dataset.config);

    const playerContainerOverlay = document.getElementById('player-container-overlay');

    function setupImagePreview(inputId, previewId, deleteBtnId, deleteInputId, imageUrl) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const deleteBtn = document.getElementById(deleteBtnId);
        const deleteInput = document.getElementById(deleteInputId);
        if (!input || !preview || !deleteBtn || !deleteInput) return;

        // CURSO (Lógica IF/ELSE): Primero, revisamos nuestra "caja de memoria".
        // IF (Si existe un archivo temporal para este input)...
        if (window.tempImageFiles[inputId]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                deleteBtn.style.display = 'inline-block';
            };
            reader.readAsDataURL(window.tempImageFiles[inputId]);
        // ELSE IF (Si no hay archivo temporal, pero sí hay una URL guardada en la base de datos)...
        } else if (imageUrl) {
            preview.src = imageUrl + '?t=' + new Date().getTime();
            preview.style.display = 'block';
            deleteBtn.style.display = 'inline-block';
        // ELSE (Si no hay ni archivo temporal ni URL guardada)...
        } else {
            preview.src = '';
            preview.style.display = 'none';
            deleteBtn.style.display = 'none';
        }

        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                // CURSO: ¡La clave! Cuando el usuario elige un archivo, lo guardamos en
                // nuestra "caja de memoria" global (window.tempImageFiles).
                window.tempImageFiles[inputId] = file;

                deleteInput.value = '0';
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    deleteBtn.style.display = 'inline-block';
                    if (inputId === 'custom_thumbnail') {
                         document.querySelector('#player-container-overlay .preview-overlay').style.backgroundImage = `url('${e.target.result}')`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        deleteBtn.addEventListener('click', () => {
            // CURSO: Al borrar, también vaciamos nuestra "caja de memoria" para este input.
            delete window.tempImageFiles[inputId];

            deleteInput.value = '1';
            input.value = '';
            preview.src = '';
            preview.style.display = 'none';
            deleteBtn.style.display = 'none';
            if (inputId === 'custom_thumbnail') {
                 const defaultThumbUrl = `https://i.ytimg.com/vi/${window.configData.video_id}/maxresdefault.jpg`;
                 document.querySelector('#player-container-overlay .preview-overlay').style.backgroundImage = `url('${defaultThumbUrl}')`;
            }
            showCustomNotification('La imagen se eliminará cuando guardes los cambios.');
        });
    }

    function loadDataIntoForm(data) {
        window.configData = data;

        // CURSO: Función auxiliar para decidir qué valor usar.
        // Revisa la "caja de memoria" (unsavedChanges) primero. Si no hay nada, usa el valor de la BD (defaultValue).
        const getValue = (fieldName, defaultValue, isCheckbox = false) => {
            if (window.unsavedChanges.hasOwnProperty(fieldName)) {
                return window.unsavedChanges[fieldName];
            }
            return isCheckbox ? (defaultValue == 1) : (defaultValue || '');
        };

        // Para cada campo del formulario, ahora usamos nuestra función auxiliar `getValue`.
        const videoIdField = document.getElementById('video_id');
        if (videoIdField) {
            videoIdField.value = window.buildYouTubeDisplayUrl(getValue('video_id', window.configData.video_id));
        }
        const titleField = document.getElementById('title');
        if (titleField) {
            titleField.value = getValue('title', window.configData.title);
        }
        const slugField = document.getElementById('slug');
        if (slugField) {
            slugField.value = getValue('slug', window.configData.slug);
        }
        const colorPrincipalField = document.getElementById('color_principal');
        if (colorPrincipalField) {
            colorPrincipalField.value = getValue('color_principal', window.configData.color_principal);
        }
        const colorControlesField = document.getElementById('color_controles');
        if (colorControlesField) {
            colorControlesField.value = getValue('color_controles', window.configData.color_controles);
        }
        const colorBarrasField = document.getElementById('color_barras');
        if (colorBarrasField) {
            colorBarrasField.value = getValue('color_barras', window.configData.color_barras);
        }
        const ctrlProgressBar = document.getElementById('ctrl_barra_progreso');
        if (ctrlProgressBar) {
            ctrlProgressBar.checked = getValue('ctrl_barra_progreso', window.configData.ctrl_barra_progreso, true);
        }
        const ctrlAjustes = document.getElementById('ctrl_ajustes');
        if (ctrlAjustes) {
            ctrlAjustes.checked = getValue('ctrl_ajustes', window.configData.ctrl_ajustes, true);
        }
        const ctrlVolumen = document.getElementById('ctrl_volumen');
        if (ctrlVolumen) {
            ctrlVolumen.checked = getValue('ctrl_volumen', window.configData.ctrl_volumen, true);
        }
        const ctrlFullscreen = document.getElementById('ctrl_fullscreen');
        if (ctrlFullscreen) {
            ctrlFullscreen.checked = getValue('ctrl_fullscreen', window.configData.ctrl_fullscreen, true);
        }
        const btnMostrar = document.getElementById('btn_mostrar');
        if (btnMostrar) {
            btnMostrar.checked = getValue('btn_mostrar', window.configData.btn_mostrar, true);
        }
        const textoPrevisualizacion = document.getElementById('texto_previsualizacion');
        if (textoPrevisualizacion) {
            textoPrevisualizacion.value = getValue('texto_previsualizacion', window.configData.texto_previsualizacion);
        }
        const prevAutomatica = document.getElementById('prev_automatica');
        if (prevAutomatica) {
            prevAutomatica.checked = getValue('prev_automatica', window.configData.prev_automatica, true);
        }
        const animacionSelect = document.getElementById('animacion');
        if (animacionSelect) {
            animacionSelect.value = getValue('animacion', window.configData.animacion);
        }

        const customThumbPath = window.configData.custom_thumbnail ? `/storage/${window.configData.custom_thumbnail}` : null;
        setupImagePreview('custom_thumbnail', 'thumbnail-preview', 'delete-thumbnail-btn', 'delete_thumbnail_input', customThumbPath);

        const ogImagePath = window.configData.og_image && window.configData.og_image !== 'null' ? `uploads/${window.configData.og_image}` : null;
        if(document.getElementById('og_image')) {
            setupImagePreview('og_image', 'og-image-preview', 'delete-og-image-btn', 'delete_og_image_input', ogImagePath);
        }

        const seoTitle = document.getElementById('seo_title');
        if (seoTitle) { seoTitle.value = getValue('seo_title', window.configData.seo_title); }
        const seoDescription = document.getElementById('seo_description');
        if (seoDescription) { seoDescription.value = getValue('seo_description', window.configData.seo_description); }

        const focusKeyphrase = document.getElementById('focus_keyphrase');
        if (focusKeyphrase) { focusKeyphrase.value = getValue('focus_keyphrase', window.configData.focus_keyphrase); }

        const videoDuration = document.getElementById('video_duration');
        if (videoDuration) { videoDuration.value = getValue('video_duration', window.configData.video_duration); }
        const metaRobotsIndex = document.getElementById('meta_robots_index');
        if (metaRobotsIndex) { metaRobotsIndex.checked = getValue('meta_robots_index', window.configData.meta_robots_index, true); }
        const metaRobotsFollow = document.getElementById('meta_robots_follow');
        if (metaRobotsFollow) { metaRobotsFollow.checked = getValue('meta_robots_follow', window.configData.meta_robots_follow, true); }
        const canonicalUrl = document.getElementById('canonical_url');
        if (canonicalUrl) { canonicalUrl.value = getValue('canonical_url', window.configData.canonical_url); }
        const ogTitle = document.getElementById('og_title');
        if (ogTitle) { ogTitle.value = getValue('og_title', window.configData.og_title); }
        const ogDescription = document.getElementById('og_description');
        if (ogDescription) { ogDescription.value = getValue('og_description', window.configData.og_description); }

        const leadFormHeadline = document.getElementById('lead_form_headline');
        if (leadFormHeadline) { leadFormHeadline.value = getValue('lead_form_headline', window.configData.lead_form_headline); }
        // --- CURSO: AÑADE ESTE BLOQUE PARA LA DESCRIPCIÓN ---
        const leadFormDescription = document.getElementById('lead_form_description');
        if (leadFormDescription) {
            leadFormDescription.value = getValue('lead_form_description', window.configData.lead_form_description);
        }
        // --- FIN DEL BLOQUE AÑADIDO ---
        const leadFormButtonText = document.getElementById('lead_form_button_text');
        if (leadFormButtonText) { leadFormButtonText.value = getValue('lead_form_button_text', window.configData.lead_form_button_text); }
        const leadFormTimestamp = document.getElementById('lead_form_timestamp');
        if (leadFormTimestamp) { leadFormTimestamp.value = getValue('lead_form_timestamp', window.configData.lead_form_timestamp); }
        const leadFormEnabled = document.getElementById('lead_form_enabled');
        if (leadFormEnabled) { leadFormEnabled.checked = getValue('lead_form_enabled', window.configData.lead_form_enabled, true); }
        const leadFormAllowSkip = document.getElementById('lead_form_allow_skip');
        if (leadFormAllowSkip) { leadFormAllowSkip.checked = getValue('lead_form_allow_skip', window.configData.lead_form_allow_skip, true); }
        const webhookUrl = document.getElementById('webhook_url');
        if (webhookUrl) { webhookUrl.value = getValue('webhook_url', window.configData.webhook_url); }
        const ctaExternoEnabled = document.getElementById('cta_externo_enabled');
        if (ctaExternoEnabled) { ctaExternoEnabled.checked = getValue('cta_externo_enabled', window.configData.cta_externo_enabled, true); }

        const ctaExternoText = document.getElementById('cta_externo_text');
        if (ctaExternoText) { ctaExternoText.value = getValue('cta_externo_text', window.configData.cta_externo_text); }
        const ctaExternoUrl = document.getElementById('cta_externo_url');
        if (ctaExternoUrl) { ctaExternoUrl.value = getValue('cta_externo_url', window.configData.cta_externo_url); }
        const ctaExternoBgColor = document.getElementById('cta_externo_bg_color');
        if (ctaExternoBgColor) { ctaExternoBgColor.value = getValue('cta_externo_bg_color', window.configData.cta_externo_bg_color); }
        const ctaExternoTextColor = document.getElementById('cta_externo_text_color');
        if (ctaExternoTextColor) { ctaExternoTextColor.value = getValue('cta_externo_text_color', window.configData.cta_externo_text_color); }

        const ctaTimestamp = getValue('cta_externo_timestamp', window.configData.cta_externo_timestamp);
        const ctaMinutesInput = document.getElementById('cta_externo_timestamp_mm');
        const ctaSecondsInput = document.getElementById('cta_externo_timestamp_ss');
        if (ctaTimestamp !== undefined && (ctaMinutesInput || ctaSecondsInput)) {
            const totalSeconds = parseInt(ctaTimestamp, 10);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            if (ctaMinutesInput) ctaMinutesInput.value = minutes;
            if (ctaSecondsInput) ctaSecondsInput.value = seconds;
        }
        // ===> AÑADE ESTE BLOQUE DE CÓDIGO AQUÍ <===
        const facebookPixelId = document.getElementById('facebook_pixel_id');
        if (facebookPixelId) {
            facebookPixelId.value = getValue('facebook_pixel_id', window.configData.facebook_pixel_id);
        }
        // ===> FIN DEL BLOQUE AÑADIDO <===

        updatePreviewColors();
        updatePlayerState();

        // --- Lógica para cargar los nuevos campos de contraseña ---
        const passwordEnabled = document.getElementById('password_enabled');
        if (passwordEnabled) {
            passwordEnabled.checked = getValue('password_enabled', window.configData.password_enabled, true);
        }
        const videoPassword = document.getElementById('video_password');
        if (videoPassword) {
            videoPassword.value = getValue('video_password', window.configData.video_password);
            // Deshabilitamos el campo si el interruptor está apagado
            videoPassword.disabled = !passwordEnabled.checked;
        }
    }

    function updatePlayerState() {
        if (!playerContainerOverlay || !configForm) return;

        const bigPlayButton = playerContainerOverlay.querySelector('#big-play-button');
        if(bigPlayButton) {
            const selectedAnimation = configForm.elements['animacion'].value;
            const lastAnimation = bigPlayButton.dataset.lastAnimation;
            if (lastAnimation && lastAnimation !== 'none') {
                bigPlayButton.classList.remove(`animate--${lastAnimation}`);
            }
            if (selectedAnimation && selectedAnimation !== 'none') {
                bigPlayButton.classList.add(`animate--${selectedAnimation}`);
            }
            bigPlayButton.dataset.lastAnimation = selectedAnimation;
        }

        const isAutoplay = configForm.elements['prev_automatica'].checked;
        const showBigPlayButton = configForm.elements['btn_mostrar'].checked;
        const youtubePlayerElement = document.getElementById('youtube-player-preview');
        const overlayElement = playerContainerOverlay.querySelector('.preview-overlay');

        if (isAutoplay) {
            if(youtubePlayerElement) youtubePlayerElement.style.display = 'block';
            if(overlayElement) overlayElement.classList.add('playing');
            if (window.previewPlayer && typeof window.previewPlayer.playVideo === 'function') {
                window.previewPlayer.playVideo();
            }
        } else {
            if(youtubePlayerElement) youtubePlayerElement.style.display = 'none';
            if(overlayElement) overlayElement.classList.remove('playing');
            if (window.previewPlayer && typeof window.previewPlayer.pauseVideo === 'function') {
                window.previewPlayer.pauseVideo();
            }
        }
        if(bigPlayButton) bigPlayButton.style.display = showBigPlayButton ? '' : 'none';

        const controlsMap = {
            'ctrl_barra_progreso': '.progress-bar-container',
            'ctrl_ajustes': '.settings-button',
            'ctrl_volumen': '.volume-container',
            'ctrl_fullscreen': '.fullscreen-button'
        };
        for (const name in controlsMap) {
            const el = playerContainerOverlay.querySelector(controlsMap[name]);
            if (el) el.style.display = configForm.elements[name].checked ? '' : 'none';
        }

        const previewTextElement = playerContainerOverlay.querySelector('.preview-overlay-text');
        const previewText = configForm.elements['texto_previsualizacion'].value;
        if (previewTextElement) previewTextElement.textContent = previewText;

        const contentWrapper = playerContainerOverlay.querySelector('.preview-content-wrapper');
        if(contentWrapper) {
             if (previewText && previewText.trim() !== '') {
                contentWrapper.classList.add('text-bg-active');
            } else {
                contentWrapper.classList.remove('text-bg-active');
            }
        }

        // --- Lógica para el interruptor de contraseña ---
        const passwordEnabledSwitch = document.getElementById('password_enabled');
        const passwordField = document.getElementById('video_password');
        if (passwordEnabledSwitch && passwordField) {
            passwordField.disabled = !passwordEnabledSwitch.checked;
        }
    }

    function updatePreviewColors() {
        if (!playerContainerOverlay || !configForm.elements['color_principal']) return;
        playerContainerOverlay.style.setProperty('--main-color', configForm.elements['color_principal'].value);
        playerContainerOverlay.style.setProperty('--controls-color', configForm.elements['color_controles'].value);
        playerContainerOverlay.style.setProperty('--bars-bg-color', configForm.elements['color_barras'].value);
    }

    const dynamicPanel = document.getElementById('dynamic-content-panel');

    // CURSO: Esta función se activa cada vez que se cambia cualquier control.
    function recordChange(event) {
        const field = event.target;
        if (field.name) {
            const value = field.type === 'checkbox' ? field.checked : field.value;
            window.unsavedChanges[field.name] = value;
        }

        // Manejo especial para los campos de tiempo del CTA
        if (field.id === 'cta_externo_timestamp_mm' || field.id === 'cta_externo_timestamp_ss') {
            const minutes = document.getElementById('cta_externo_timestamp_mm').value || 0;
            const seconds = document.getElementById('cta_externo_timestamp_ss').value || 0;
            window.unsavedChanges['cta_externo_timestamp'] = parseInt(minutes) * 60 + parseInt(seconds);
        }
    }

    // /video/assets/js/editor.js

    // --- CÓDIGO DE REEMPLAZO (EL VIGILANTE MAESTRO) ---

    // Este único "vigilante" escucha cambios en CUALQUIER LUGAR, tanto
    // en el formulario principal (`configForm`) como en el panel dinámico (`dynamicPanel`).
    // Esto es gracias a que ambos están dentro del `editor-container`.
    document.getElementById('editor-container').addEventListener('input', (event) => {

        // --- 1. Primero, siempre registramos el cambio para el botón "Guardar" ---
        recordChange(event);

        // --- 2. Ahora, decidimos qué acción visual tomar EN TIEMPO REAL, sin conflictos ---

        // IF (SI) el cambio ocurrió en el campo de la URL del video...
        if (event.target.id === 'video_id') {
            // ...ENTONCES, nuestra única misión es actualizar la vista previa del video.
            const newUrl = event.target.value;
            const newVideoId = window.getYouTubeID(newUrl); // Extrae el ID

            if (newVideoId && window.previewPlayer) {
                window.previewPlayer.loadVideoById(newVideoId);
            }
            // --- CURSO: INICIO DE LA MEJORA VISUAL ---
            // Con este bloque, actualizamos las miniaturas que el usuario ve.

            // a) Construimos la URL de la nueva miniatura de YouTube en alta calidad.
            const newThumbUrl = `https://i.ytimg.com/vi/${newVideoId}/maxresdefault.jpg`;

            // b) Buscamos el 'overlay' del reproductor grande.
            const previewOverlay = document.querySelector('#player-container-overlay .preview-overlay');

            // c) Actualizamos su imagen de fondo, SOLO si no hay una miniatura personalizada.
            if (previewOverlay && !window.tempImageFiles['custom_thumbnail']) {
                previewOverlay.style.backgroundImage = `url('${newThumbUrl}')`;
            }

            // d) Buscamos la miniatura pequeña en el panel de ajustes.
            const thumbnailPreviewImg = document.getElementById('thumbnail-preview');

            // e) Actualizamos su imagen y su fuente por defecto, SOLO si no hay miniatura personalizada.
            if (thumbnailPreviewImg && !window.tempImageFiles['custom_thumbnail']) {
                 const newDefaultSrc = `https://i.ytimg.com/vi/${newVideoId}/mqdefault.jpg`;
                 thumbnailPreviewImg.src = newDefaultSrc;
                 thumbnailPreviewImg.dataset.defaultSrc = newDefaultSrc;
            }
            // --- CURSO: FIN DE LA MEJORA VISUAL ---
            // También actualizamos el campo correspondiente en la pestaña de Pruebas A/B.
            const originalVariantInput = document.querySelector('.variant-row.is-original input[name="ab_variant_url[]"]');
            if (originalVariantInput) {
                originalVariantInput.value = newUrl;
            }
        }
        // ELSE IF (SI NO, y SI el cambio fue en un selector de color...)
        else if (event.target.type === 'color') {
            // ...ENTONCES, nuestra única misión es actualizar los colores de la vista previa.
            updatePreviewColors();
        }
        // ELSE (PARA CUALQUIER OTRO cambio en cualquier otro control...)
        else {
            // ...ENTONCES, actualizamos el resto de elementos visuales (botones, animaciones, etc.).
            updatePlayerState();
        }
    });
    // --- FIN DEL CÓDIGO DE REEMPLAZO ---

    const tabLinks = document.querySelectorAll('.tab-link');
    const staticPanel = document.getElementById('personalizar');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetType = link.dataset.targetType;
            const sourceFile = link.dataset.source;
            tabLinks.forEach(innerLink => innerLink.classList.remove('active'));
            link.classList.add('active');
            staticPanel.style.display = 'none';
            dynamicPanel.style.display = 'none';
            if (targetType === 'static') {
                staticPanel.style.display = 'block';
            } else if (targetType === 'ajax' && sourceFile) {
                dynamicPanel.style.display = 'block';
                if (dynamicPanel.dataset.loadedSource === sourceFile) {
                    // CURSO: Si la pestaña ya estaba cargada, forzamos una recarga de los datos
                    // para que la lógica de setupImagePreview se vuelva a ejecutar
                    // y revise nuestra "caja de memoria".
                    loadDataIntoForm(window.configData);
                    return;
                }
                dynamicPanel.innerHTML = '<p>Cargando...</p>';
                fetch(sourceFile)
                .then(response => response.ok ? response.text() : Promise.reject('Error al cargar.'))
                // --- CURSO: REEMPLAZA CON ESTE BLOQUE CORREGIDO ---
                .then(html => {
                    dynamicPanel.innerHTML = html;
                    dynamicPanel.dataset.loadedSource = sourceFile;
                    loadDataIntoForm(window.configData);

                    // --- LÓGICA CORREGIDA ---
                    // Ahora cada `if` está separado y comprueba el archivo correcto.

                    // SI (if) se cargó la pestaña de SEO...
                    if (sourceFile === 'seo.php') {
                        // ...ENTONCES, activamos los contadores.
                        // Usamos los IDs que tú mismo pusiste en seo.php, ¡están perfectos!
                        initCharCounter('seo_title', 'title-char-counter', 60);
                        initCharCounter('seo_description', 'desc-char-counter', 160);
                        initKeywordsInput();
                        // --- CURSO: AÑADE ESTAS DOS LÍNEAS AL FINAL DEL BLOQUE 'IF' ---
                        initOgFieldSync('seo_title', 'og_title', 'El titular para Facebook, WhatsApp, etc.');
                        initOgFieldSync('seo_description', 'og_description', 'El texto que aparecerá al compartir el enlace.');
                        // --- CURSO: AÑADE ESTAS DOS LÍNEAS PARA LOS NUEVOS CONTADORES ---
                        initCharCounter('og_title', 'og-title-counter', 70);
                        initCharCounter('og_description', 'og-desc-counter', 200);
                    }

                    // SI (if) se cargó la pestaña de Ajustes...
                    if (sourceFile === 'ajustes.php') {
                        // ...ENTONCES, disparamos el evento para las pruebas A/B.
                        document.dispatchEvent(new CustomEvent('abPanelLoaded'));
                    }
                    // =====> AÑADE ESTE NUEVO BLOQUE 'IF' AQUÍ <=====
                    // SI (if) se cargó la pestaña de Capítulos...
                    if (sourceFile === 'capitulos.php') {
                        // ...ENTONCES, disparamos el evento para el editor de capítulos.
                        document.dispatchEvent(new CustomEvent('chaptersPanelLoaded'));
                    }
                })
                // --- FIN DEL BLOQUE CORREGIDO ---
                .catch(error => { dynamicPanel.innerHTML = `<p style="color: red;">${error}</p>`; });
            }
        });
    });


    const saveButton = document.querySelector('.btn-save');
    saveButton.addEventListener('click', () => {
        saveButton.textContent = 'Guardando...';
        saveButton.disabled = true;

        // --- CURSO: LA SOLUCIÓN DEFINITIVA Y ESCALABLE ---
        // 1. Creamos una caja de datos (FormData) vacía.
        const formData = new FormData();
        // 2. Le añadimos la ID del reproductor, que es fundamental y no está en un campo de formulario.
        formData.append('id', window.configData.id);

        // 3. Buscamos TODOS los campos (inputs, selects, textareas) en TODAS las pestañas.
        // Esto incluye el formulario principal Y el panel dinámico que carga las otras pestañas.
        const allFields = document.querySelectorAll('#configForm input, #configForm select, #configForm textarea, #dynamic-content-panel input, #dynamic-content-panel select, #dynamic-content-panel textarea');

        // 4. Recorremos cada campo encontrado para meter su valor en nuestra caja de datos.
        allFields.forEach(field => {
            // Ignoramos campos sin nombre, ya que no se deben enviar.
            if (!field.name) return;

            // --- CURSO: Lógica IF / ELSE para cada tipo de campo ---

            // SI (if) el campo es un checkbox (interruptor)...
            if (field.type === 'checkbox') {
                // ...metemos '1' si está marcado, o '0' si no lo está.
                // Usamos .set() para asegurarnos de que solo haya un valor para este campo.
                formData.set(field.name, field.checked ? '1' : '0');
            }
            // SI NO (else), y el campo NO es de tipo archivo...
            // (Los archivos los manejaremos por separado con nuestra "caja de memoria").
            else if (field.type !== 'file') {
                // ...simplemente metemos su valor actual en la caja.
                formData.set(field.name, field.value);
            }
        });

        // 5. Ahora, manejamos los archivos de imagen usando nuestra "caja de memoria".
        // Esto asegura que las imágenes recién seleccionadas (y aún no guardadas) se incluyan.
        for (const inputId in window.tempImageFiles) {
            if (window.tempImageFiles.hasOwnProperty(inputId)) {
                formData.append(inputId, window.tempImageFiles[inputId]);
            }
        }

        // /video/assets/js/editor.js

        // --- CÓDIGO DE REEMPLAZO ---
        // Curso: A partir de ahora, SIEMPRE intentaremos recopilar los datos
        // de las pruebas A/B, sin importar si la pestaña está visible o no.

        // Primero, limpiamos cualquier dato A/B que pudiera existir en el FormData.
        formData.delete('ab_variant_url[]');
        formData.delete('ab_variant_percentage[]');
        // NOTA: No borramos 'ab_variant_is_original[]', ya que no se envía desde el formulario.

        // Luego, buscamos las filas de variantes A/B en el documento.
        document.querySelectorAll('#ab-variants-container .variant-row').forEach(row => {
            // Para cada fila, extraemos sus datos.
            const urlInput = row.querySelector('input[name="ab_variant_url[]"]');
            const percentageSelect = row.querySelector('select[name="ab_variant_percentage[]"]');

            // IF (SI) el input de URL o el selector de porcentaje existen...
            if (urlInput && percentageSelect) {
                // ...ENTONCES, los añadimos al FormData que se enviará al servidor.
                // Esto asegura que si las filas existen (aunque estén ocultas), sus datos se envíen.
                formData.append('ab_variant_url[]', urlInput.value);
                formData.append('ab_variant_percentage[]', percentageSelect.value);
            }
        });
        // --- FIN DEL CÓDIGO DE REEMPLAZO ---

        const ctaMinutesInput = document.getElementById('cta_externo_timestamp_mm');
        const ctaSecondsInput = document.getElementById('cta_externo_timestamp_ss');
        if (ctaMinutesInput || ctaSecondsInput) {
            const totalSeconds = (parseInt(ctaMinutesInput.value, 10) || 0) * 60 + (parseInt(ctaSecondsInput.value, 10) || 0);
            formData.set('cta_externo_timestamp', totalSeconds);
        }

        const deleteThumbInput = document.getElementById('delete_thumbnail_input');
        if (deleteThumbInput) formData.set('delete_thumbnail_input', deleteThumbInput.value);

        const deleteOgImageInput = document.getElementById('delete_og_image_input');
        if (deleteOgImageInput) formData.set('delete_og_image_input', deleteOgImageInput.value);

        // Laravel, para actualizar, espera un método PUT. Lo simulamos así:
        formData.append('_method', 'PUT');

        // La nueva URL apunta a la ruta de Laravel, no a un archivo .php
        fetch(`/videomarketing/${window.configData.id}`, {
            method: 'POST', // El método real es POST, pero el _method le dice a Laravel que lo trate como PUT
            body: formData,
            headers: {
                // Le enviamos el token de seguridad que pusimos en el <head>
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                // Pedimos una respuesta en formato JSON
                'Accept': 'application/json',
            }
        })
        .then(response => {
            // Esta parte no cambia, ya está bien hecha
            if (!response.ok) {
                return response.text().then(text => { throw new Error('Error de red: ' + text) });
            }
            return response.json();
        })
        .then(data => {
            const videoUrlWasChanged = window.unsavedChanges.hasOwnProperty('video_id');
            if (!data.success) {
                throw new Error(data.message || 'Error desconocido al guardar.');
            }

            // CURSO: ¡Éxito! Vaciamos nuestras "cajas de memoria" porque los
            // cambios ya están seguros en la base de datos.
            window.unsavedChanges = {};
            window.tempImageFiles = {};

            loadDataIntoForm(data.updated_data);
            // IF (SI) nuestro recordatorio 'videoUrlWasChanged' es verdadero...
            if (videoUrlWasChanged) {
                // ...ENTONCES, la única acción es recargar la página.
                // Esto asegura que el nuevo video se muestre, sin errores.
                window.location.reload();
            }

            saveButton.classList.add('success');
            showCustomNotification('¡Ajustes guardados correctamente!');
        })
        .catch(err => {
            showCustomNotification('Error al guardar: ' + err.message, true);
        })
        .finally(() => {
            setTimeout(() => {
                saveButton.textContent = 'Guardar Cambios';
                saveButton.classList.remove('success');
                saveButton.disabled = false;
            }, 2000);
        });
    });

    window.onYouTubeIframeAPIReady = function() {
        if (!window.configData || !window.configData.video_id) {
             return;
        }
        window.previewPlayer = new YT.Player('youtube-player-preview', {
        height: '100%', width: '100%', videoId: window.configData.video_id,
        playerVars: {
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'playsinline': 1,
            'autoplay': 0,
            'mute': 1,
            'loop': 1,
            'playlist': window.configData.video_id,
            'origin': window.location.origin // <-- AÑADE ESTA LÍNEA
        },
        events: {
                'onReady': () => {
                    loadDataIntoForm(window.configData);
                }
            }
        });
    };

    if (tabLinks.length > 0) tabLinks[0].click();
    feather.replace();

    // --- INICIO: NUEVA LÓGICA PARA EL MENÚ COLAPSABLE ---
    const toggleNavbarBtn = document.getElementById('toggle-navbar-btn');
    const settingsNavbar = document.querySelector('.settings-navbar');

    if (toggleNavbarBtn && settingsNavbar) {
        toggleNavbarBtn.addEventListener('click', () => {
            // Aplica la clase directamente a la barra de navegación
            settingsNavbar.classList.toggle('menu-expanded');
        });
    }
    // --- FIN: NUEVA LÓGICA PARA EL MENÚ COLAPSABLE ---

    function showCustomNotification(message, isError = false) {
        const notification = document.getElementById('custom-notification');
        const notificationMessage = document.getElementById('notification-message');
        if (!notification || !notificationMessage) return;

        notificationMessage.textContent = message;
        notification.className = 'custom-notification';
        if(isError) notification.classList.add('error');

        notification.style.display = 'block';
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', function handler() {
                notification.style.display = 'none';
                notification.removeEventListener('transitionend', handler);
            });
        }, 3000);
    }
    // --- CURSO: AÑADE ESTE BLOQUE DE CÓDIGO ---

    // Función para inicializar un contador de caracteres
    function initCharCounter(inputId, counterId, maxLength) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);

        if (!input || !counter) {
            return; // No hacer nada si los elementos no existen
        }

        const updateCounter = () => {
            const length = input.value.length;
            counter.textContent = `${length} / ${maxLength}`;

            // Lógica de colores con if/else
            counter.classList.remove('good', 'warning', 'error'); // Limpia colores previos
            if (length > maxLength) {
                counter.classList.add('error'); // Rojo si te pasas
            } else if (length >= maxLength * 0.9) {
                counter.classList.add('warning'); // Amarillo cuando estás cerca del límite
            } else if (length > 0) {
                counter.classList.add('good'); // Verde si has escrito algo
            }
        };

        input.addEventListener('input', updateCounter);
        updateCounter(); // Llama una vez al inicio para establecer el estado correcto
    }
    // --- CURSO: AÑADE ESTA NUEVA FUNCIÓN PARA LAS ETIQUETAS ---
    function initKeywordsInput() {
        const container = document.getElementById('keywords-container');
        const input = document.getElementById('keywords-input');
        const hiddenInput = document.getElementById('seo_keywords');

        if (!container || !input || !hiddenInput) return;

        let keywords = [];

        const updateHiddenInput = () => {
            hiddenInput.value = keywords.join(',');
            // Registra el cambio para que el botón de guardar se active
            recordChange({ target: hiddenInput });
        };

        const createTag = (label) => {
            const tag = document.createElement('span');
            tag.classList.add('keyword-tag');
            tag.innerHTML = `<span>${label}</span><i class="remove-tag" title="Eliminar">&times;</i>`;
            return tag;
        };

        const addKeyword = (keyword) => {
            const cleanKeyword = keyword.trim();
            if (cleanKeyword.length > 0 && !keywords.includes(cleanKeyword)) {
                keywords.push(cleanKeyword);
                const tag = createTag(cleanKeyword);
                container.insertBefore(tag, input);
                updateHiddenInput();
            }
            input.value = '';
        };

        // Cargar las palabras clave existentes al abrir la pestaña
        if (hiddenInput.value) {
            keywords = hiddenInput.value.split(',').filter(k => k);
            keywords.forEach(keyword => {
                const tag = createTag(keyword);
                container.insertBefore(tag, input);
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addKeyword(input.value);
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                const tagText = e.target.previousElementSibling.textContent;
                keywords = keywords.filter(k => k !== tagText);
                e.target.parentElement.remove();
                updateHiddenInput();
            }
        });
    }
    // --- CURSO: AÑADE ESTA NUEVA FUNCIÓN PARA SINCRONIZAR CAMPOS ---
    function initOgFieldSync(sourceId, targetId, defaultPlaceholder) {
        const sourceInput = document.getElementById(sourceId);
        const targetInput = document.getElementById(targetId);

        if (!sourceInput || !targetInput) return;

        const syncPlaceholders = () => {
            const sourceValue = sourceInput.value.trim();
            const targetValue = targetInput.value.trim();

            // Lógica IF/ELSE para el placeholder
            // SI (if) el campo de redes sociales está vacío...
            if (targetValue === '') {
                // ...Y SI (if) el campo SEO tiene texto...
                if (sourceValue !== '') {
                    // ...ENTONCES, usamos el texto SEO como placeholder.
                    targetInput.placeholder = sourceValue;
                } else {
                    // ...SI NO, usamos el placeholder por defecto.
                    targetInput.placeholder = defaultPlaceholder;
                }
            }
        };

        // Activamos la sincronización cuando se escribe en CUALQUIERA de los dos campos
        sourceInput.addEventListener('input', syncPlaceholders);
        targetInput.addEventListener('input', syncPlaceholders);

        // Hacemos una sincronización inicial al cargar la pestaña
        syncPlaceholders();
    }
    // --- FIN DEL BLOQUE AÑADIDO ---







    // --- LÓGICA CORREGIDA PARA EL MENÚ Y LOS POP-UPS ---

    // LÓGICA PARA EL MENÚ DESPLEGABLE DE 3 PUNTOS
    const optionsMenuBtn = document.getElementById('options-menu-btn');
    const optionsDropdown = document.getElementById('options-dropdown');
    if (optionsMenuBtn && optionsDropdown) {
        optionsMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsDropdown.parentElement.classList.toggle('active');
        });
        window.addEventListener('click', (e) => {
            if (!optionsMenuBtn.contains(e.target)) {
                optionsDropdown.parentElement.classList.remove('active');
            }
        });
    }

    // --- LÓGICA CORREGIDA PARA TODOS LOS POP-UPS ---

    // Función reutilizable para copiar código al portapapeles
    function copyCode(button) {
        const targetId = button.dataset.target;
        const codeToCopy = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(codeToCopy).then(() => {
            const originalText = button.textContent;
            button.textContent = '¡Copiado!';
            setTimeout(() => { button.textContent = originalText; }, 2000);
        });
    }

    // Lógica para el pop-up de "Insertar Video"
    const embedModal = document.getElementById('embed-modal');
    const embedBtn = document.getElementById('embed-video-btn');
    if (embedModal && embedBtn) {
        const closeBtn = embedModal.querySelector('.close-modal-btn');
        const generateEmbedCodes = () => {
            const slug = window.configData.slug;
            if (!slug) return;
            const baseUrl = window.location.origin;
            const videoPageUrl = `${baseUrl}/video/index.php?slug=${slug}`;
            const width = document.getElementById('embed-width').value || 640;
            const height = document.getElementById('embed-height').value || 360;
            const fixedCode = `<iframe src="${videoPageUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen allow="autoplay" scrolling="no"></iframe>`;
            document.getElementById('fixed-embed-code').textContent = fixedCode;
            const responsiveCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe src="${videoPageUrl}" frameborder="0" allowfullscreen allow="autoplay" scrolling="no" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>`;
            document.getElementById('responsive-embed-code').textContent = responsiveCode;
        };
        embedBtn.addEventListener('click', (e) => { e.preventDefault(); generateEmbedCodes(); embedModal.style.display = 'flex'; });
        closeBtn.addEventListener('click', () => { embedModal.style.display = 'none'; });
        document.getElementById('embed-width').addEventListener('input', generateEmbedCodes);
        document.getElementById('embed-height').addEventListener('input', generateEmbedCodes);
        embedModal.querySelectorAll('.copy-code-btn').forEach(btn => btn.addEventListener('click', () => copyCode(btn)));
    }




    // --- CURSO: AÑADE ESTA LÓGICA PARA EL POP-UP DE "CÓDIGO SEO" ---
    const seoModal = document.getElementById('seo-modal');
    const seoCodeBtn = document.getElementById('seo-code-btn');
    if (seoModal && seoCodeBtn) {
        const closeBtn = seoModal.querySelector('.close-modal-btn');
        const generateSeoOnlyCode = () => {
            const slug = window.configData.slug;
            if (!slug) return;
            const baseUrl = window.location.origin;
            const videoPageUrl = `${baseUrl}/video/index.php?slug=${slug}`;
            const seoData = {
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": window.configData.seo_title || window.configData.title,
                "description": window.configData.seo_description || '',
                "thumbnailUrl": `https://i.ytimg.com/vi/${window.configData.video_id}/maxresdefault.jpg`,
                "uploadDate": window.configData.created_at,
                "duration": `PT${(window.configData.video_duration || '0:00').replace(':', 'M')}S`,
                "embedUrl": videoPageUrl
            };
            if (window.configData.canonical_url) {
                seoData.url = window.configData.canonical_url;
            }
            const seoCode = `<script type="application/ld+json">\n${JSON.stringify(seoData, null, 2)}\n<` + `/script>`;
            document.getElementById('seo-only-code').textContent = seoCode;
        };
        seoCodeBtn.addEventListener('click', (e) => { e.preventDefault(); generateSeoOnlyCode(); seoModal.style.display = 'flex'; });
        closeBtn.addEventListener('click', () => { seoModal.style.display = 'none'; });

        // Lógica para el botón de copiar de este modal
        const copySeoBtn = seoModal.querySelector('.copy-code-btn');
        if (copySeoBtn) {
            copySeoBtn.addEventListener('click', () => copyCode(copySeoBtn));
        }
    }


    // --- LÓGICA PARA EL POP-UP DE COMPARTIR ---
    const shareModal = document.getElementById('share-modal');
    const shareBtn = document.getElementById('share-video-btn');
    if (shareModal && shareBtn) {
        const closeBtn = shareModal.querySelector('.close-modal-btn');
        const shareLinkInput = document.getElementById('share-link-input');
        const nativeShareBtn = document.getElementById('native-share-btn');
        const copyLinkBtn = document.getElementById('copy-share-link-btn');

        // Función para preparar y abrir el pop-up
        const openShareModal = () => {
            const slug = window.configData.slug;
            const videoPageUrl = `${window.location.origin}/video/index.php?slug=${slug}`;
            shareLinkInput.value = videoPageUrl;

            // Comprobamos si el navegador soporta la función de compartir nativa
            if (navigator.share) {
                nativeShareBtn.style.display = 'flex';
            } else {
                nativeShareBtn.style.display = 'none'; // Si no, ocultamos el botón
            }

            shareModal.style.display = 'flex';
        };

        shareBtn.addEventListener('click', (e) => { e.preventDefault(); openShareModal(); });
        closeBtn.addEventListener('click', () => { shareModal.style.display = 'none'; });

        // Lógica para el botón de compartir nativo
        nativeShareBtn.addEventListener('click', () => {
            navigator.share({
                title: window.configData.title,
                url: shareLinkInput.value
            }).catch(error => console.log('Error al compartir', error));
        });

        // Lógica para el botón de copiar enlace
        copyLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                copyLinkBtn.textContent = '¡Copiado!';
                setTimeout(() => { copyLinkBtn.textContent = 'Copiar Enlace'; }, 2000);
            });
        });
    }

    // ======================================================
    // === LÓGICA PARA EL EDITOR DE CAPÍTULOS (MOMENTOS CLAVE) ===
    // ======================================================

    // Escuchamos el evento personalizado que disparamos en el Paso 1
    document.addEventListener('chaptersPanelLoaded', () => {

        const videoId = window.configData.id;
        const chaptersList = document.getElementById('chapters-list');
        const addBtn = document.getElementById('add-chapter-btn');
        const tiempoInput = document.getElementById('chapter-tiempo');
        const tituloInput = document.getElementById('chapter-titulo');

        function formatTime(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        async function loadChapters() {
            if (!chaptersList) return;
            try {
                const response = await fetch(`cargar_capitulos.php?id_video=${videoId}`);
                const data = await response.json();
                chaptersList.innerHTML = '';
                if (data.success && data.chapters) {
                    data.chapters.forEach(chapter => {
                        const div = document.createElement('div');
                        div.className = 'chapter-item';
                        div.dataset.id = chapter.id;
                        div.innerHTML = `
                            <span class="chapter-time">${formatTime(chapter.tiempo_inicio)}</span>
                            <span class="chapter-title">${chapter.titulo}</span>
                            <button class="btn-delete-chapter" title="Eliminar capítulo">×</button>
                        `;
                        chaptersList.appendChild(div);
                    });
                }
            } catch (error) { console.error("Error al cargar capítulos:", error); }
        }

        loadChapters();

        addBtn.addEventListener('click', async () => {
            const tiempo = tiempoInput.value.trim();
            const titulo = tituloInput.value.trim();

            if (!tiempo.match(/^\d{1,3}:\d{2}$/) || !titulo) {
                alert('Por favor, completa el tiempo (en formato MM:SS) y el título.');
                return;
            }
            try {
                const response = await fetch('guardar_capitulo.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_video: videoId, tiempo_inicio: tiempo, titulo: titulo })
                });
                const result = await response.json();
                if (result.success) {
                    loadChapters();
                    tiempoInput.value = '';
                    tituloInput.value = '';
                } else { alert('Error al guardar: ' + (result.message || 'Error')); }
            } catch (error) { alert('Error de conexión.'); }
        });

            chaptersList.addEventListener('click', async (e) => {
            const chapterItem = e.target.closest('.chapter-item');
            if (!chapterItem) return;

            // Si ya estamos editando otra fila, no hacemos nada para evitar conflictos.
            if (document.querySelector('.chapter-item.is-editing')) return;

            // --- Lógica para ELIMINAR un capítulo ---
            if (e.target.classList.contains('btn-delete-chapter')) {
                const chapterId = chapterItem.dataset.id;
                if (confirm('¿Eliminar este capítulo?')) {
                    try {
                        const response = await fetch('eliminar_capitulo.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: chapterId })
                        });
                        const result = await response.json();
                        if (result.success) { loadChapters(); }
                        else { alert('Error al eliminar.'); }
                    } catch (error) { alert('Error de conexión.'); }
                }
            }
            // --- Lógica para INICIAR LA EDICIÓN de un capítulo ---
            else if (e.target.classList.contains('chapter-time') || e.target.classList.contains('chapter-title')) {
                chapterItem.classList.add('is-editing');
                const timeSpan = chapterItem.querySelector('.chapter-time');
                const titleSpan = chapterItem.querySelector('.chapter-title');

                // Guardamos los valores originales por si el usuario cancela
                const originalTime = timeSpan.textContent;
                const originalTitle = titleSpan.textContent;

                // Transformamos los spans en inputs
                chapterItem.innerHTML = `
                    <input type="text" class="chapter-input-time" value="${originalTime}">
                    <input type="text" class="chapter-input-title" value="${originalTitle}">
                    <button class="btn-save-chapter" title="Guardar cambios">✔</button>
                    <button class="btn-cancel-chapter" title="Cancelar">×</button>
                `;

                // --- Lógica para GUARDAR los cambios ---
                chapterItem.querySelector('.btn-save-chapter').addEventListener('click', async () => {
                    const newTime = chapterItem.querySelector('.chapter-input-time').value;
                    const newTitle = chapterItem.querySelector('.chapter-input-title').value;
                    const chapterId = chapterItem.dataset.id;

                    try {
                        const response = await fetch('guardar_capitulo.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id_chapter: chapterId, // Enviamos el ID para que PHP sepa que es una ACTUALIZACIÓN
                                id_video: videoId,
                                tiempo_inicio: newTime,
                                titulo: newTitle
                            })
                        });
                        const result = await response.json();
                        if (result.success) {
                            loadChapters(); // Recargamos la lista para ver los cambios
                        } else {
                            alert('Error al guardar: ' + (result.message || 'Error desconocido'));
                            loadChapters(); // Recargamos para restaurar el estado original
                        }
                    } catch (error) {
                        alert('Error de conexión.');
                        loadChapters();
                    }
                });

                // --- Lógica para CANCELAR la edición ---
                chapterItem.querySelector('.btn-cancel-chapter').addEventListener('click', () => {
                    loadChapters(); // Simplemente recargamos la lista para descartar los cambios
                });
            }
        });
    });

// Pega el código justo antes de esta línea:
});
























