// /video/assets/js/curso_player.js (VERSIÓN FINAL, CORREGIDA Y UNIFICADA)

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // === 1. DEFINICIONES GLOBALES ===
    // ======================================================
    const courseVideoIframe = document.getElementById('course-video-iframe');
    const playerLoadingOverlay = document.getElementById('player-loading-overlay');
    const lessonTitleDisplay = document.getElementById('lesson-description')?.querySelector('h2');
    const lessonDescriptionDisplay = document.getElementById('lesson-description')?.querySelector('p');
    const lessonItems = document.querySelectorAll('.lesson-item');

    const layoutContainer = document.querySelector('.course-layout-tres-columnas');
    const chaptersContainer = document.querySelector('.chapters-column');
    const chaptersList = document.querySelector('.chapters-list-cliente');
    
    // ======================================================
    // === 2. LÓGICA DE LA INTERFAZ (COLAPSAR, FAQ, ETC.) ===
    // ======================================================

    // --- Columna de Capítulos Colapsable ---
    const toggleBtn = document.getElementById('collapse-chapters-btn');
    if (toggleBtn && layoutContainer) {
        toggleBtn.addEventListener('click', () => {
            layoutContainer.classList.toggle('chapters-collapsed');
            toggleBtn.innerHTML = layoutContainer.classList.contains('chapters-collapsed') ? '&gt;' : '&lt;';
        });
    }

  // --- Clics en los Capítulos (Con Event Delegation) ---
    if (chaptersList) {
        chaptersList.addEventListener('click', function(e) {
            const link = e.target.closest('.chapter-link');
            if (!link) return;

            e.preventDefault();
            const time = parseInt(link.dataset.time, 10);
            
            // ===> LA ÚNICA LÍNEA QUE CAMBIA <===
            // Ahora enviamos la orden de forma clara y directa al iframe.
            if (courseVideoIframe && courseVideoIframe.contentWindow) {
                courseVideoIframe.contentWindow.postMessage({ type: 'seekTo', time: time }, '*');
            }
            
            // Marcar como activo
            chaptersList.querySelectorAll('.chapter-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    }

    async function updateLessonDetails(title, description, videoId) {
        // ... (El resto de la función se mantiene exactamente igual)
        if (lessonTitleDisplay) lessonTitleDisplay.textContent = title;
        if (lessonDescriptionDisplay) lessonDescriptionDisplay.textContent = description;
        document.title = `${title} - ${courseConfig.nombre_curso}`;
        if (typeof fbq === 'function') {
            fbq('track', 'ViewContent', { content_name: title, content_category: courseConfig.nombre_curso });
        }
        try {
            const response = await fetch(`cargar_capitulos.php?id_video=${videoId}`);
            const data = await response.json();
            if (chaptersList) chaptersList.innerHTML = '';
            if (data.success && data.chapters.length > 0) {
                data.chapters.forEach(chapter => {
                    const li = document.createElement('li');
                    const timeString = new Date(chapter.tiempo_inicio * 1000).toISOString().slice(14, 19);
                    li.innerHTML = ` <a href="#" class="chapter-link" data-time="${chapter.tiempo_inicio}"> <span class="chapter-time-cliente">${timeString}</span> <span class="chapter-title-cliente">${chapter.titulo}</span> </a> `;
                    if (chaptersList) chaptersList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.innerHTML = `<p style="padding: 20px; color: #a0a7b1; text-align: center; font-size: 14px;">No hay capítulos para este video.</p>`;
                if (chaptersList) chaptersList.appendChild(li);
            }
        } catch (error) {
            console.error("Error al cargar capítulos:", error);
            if (chaptersList) {
                chaptersList.innerHTML = `<li><p style="padding: 20px; color: #e74c3c;">Error al cargar capítulos.</p></li>`;
            }
        }
    }

    // --- Acordeón de Preguntas Frecuentes (FAQ) ---
    // (Tu código existente para el acordeón de FAQ, que ya funciona bien)
    // --- INICIO: LÓGICA PARA MÓDULOS COLAPSABLES DEL CURSO ---
    const sectionHeaders = document.querySelectorAll('.section-header-client');

    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sectionBlock = header.closest('.course-section-block');
            if (sectionBlock) {
                sectionBlock.classList.toggle('is-collapsed-client');
            }
        });
    });
    // --- FIN: LÓGICA PARA MÓDULOS COLAPSABLES DEL CURSO ---
    
    // ======================================================
    // === 3. LÓGICA DEL REPRODUCTOR Y LECCIONES (EL CEREBRO) ===
    // ======================================================
    
    function showLoadingOverlay() { if (playerLoadingOverlay) playerLoadingOverlay.classList.add('is-visible'); }
    function hideLoadingOverlay() { if (playerLoadingOverlay) playerLoadingOverlay.classList.remove('is-visible'); }

    function loadVideo(slug) {
        if (courseVideoIframe && slug) {
            showLoadingOverlay();
            const origin = encodeURIComponent(window.location.protocol + '//' + window.location.host);
            courseVideoIframe.src = `index.php?slug=${slug}&embedded=true&origin=${origin}`;
        }
    }

    function updateActiveLessonClass(activeItem) {
        lessonItems.forEach(li => li.classList.remove('active'));
        if (activeItem) activeItem.classList.add('active');
    }

    async function updateLessonDetails(title, description, videoId) {
    // Actualiza el contenido visual de la lección
    if (lessonTitleDisplay) lessonTitleDisplay.textContent = title;
    if (lessonDescriptionDisplay) lessonDescriptionDisplay.textContent = description;
    document.title = `${title} - ${courseConfig.nombre_curso}`;

    // Envía el evento de seguimiento a Facebook
    if (typeof fbq === 'function') {
        fbq('track', 'ViewContent', { content_name: title, content_category: courseConfig.nombre_curso });
    }

    // Lógica para actualizar los capítulos dinámicamente
    try {
        const response = await fetch(`cargar_capitulos.php?id_video=${videoId}`);
        const data = await response.json();

        // Siempre limpia la lista de capítulos anterior
        if (chaptersList) chaptersList.innerHTML = '';

        // Si la nueva lección tiene capítulos, los mostramos
        if (data.success && data.chapters.length > 0) {
            data.chapters.forEach(chapter => {
                const li = document.createElement('li');
                const timeString = new Date(chapter.tiempo_inicio * 1000).toISOString().slice(14, 19);
                li.innerHTML = `
                    <a href="#" class="chapter-link" data-time="${chapter.tiempo_inicio}">
                        <span class="chapter-time-cliente">${timeString}</span>
                        <span class="chapter-title-cliente">${chapter.titulo}</span>
                    </a>
                `;
                if (chaptersList) chaptersList.appendChild(li);
            });
        } else {
            // Si no hay capítulos, mostramos un mensaje informativo
            const li = document.createElement('li');
            li.innerHTML = `<p style="padding: 20px; color: #a0a7b1; text-align: center; font-size: 14px;">No hay capítulos para este video.</p>`;
            if (chaptersList) chaptersList.appendChild(li);
        }
    } catch (error) {
        console.error("Error al cargar capítulos:", error);
        // En caso de error, también mostramos un mensaje
        if (chaptersList) {
             chaptersList.innerHTML = `<li><p style="padding: 20px; color: #e74c3c;">Error al cargar capítulos.</p></li>`;
        }
    }
    }

    // --- EVENTOS Y CARGA INICIAL ---
    lessonItems.forEach(item => {
        item.addEventListener('click', () => {
            loadVideo(item.dataset.videoSlug);
            updateLessonDetails(item.dataset.lessonTitle, item.dataset.lessonDescription, item.dataset.videoId);
            updateActiveLessonClass(item);
        });
    });

    if (lessonItems.length > 0) {
        const firstLesson = lessonItems[0];
        updateActiveLessonClass(firstLesson);
        updateLessonDetails(firstLesson.dataset.lessonTitle, firstLesson.dataset.lessonDescription, firstLesson.dataset.videoId);
    } else {
        if (chaptersContainer) chaptersContainer.style.display = 'none';
    }

    if (courseVideoIframe) {
        courseVideoIframe.addEventListener('load', hideLoadingOverlay);
    }

    // window.addEventListener('message', (event) => {
    //     if (event.data && (event.data.type === 'youtube_player_ready' || event.data.type === 'videoLoaded')) {
    //         hideLoadingOverlay();
    //     }
    // });
     
    // ======================================================
    // === ESCUCHA ÓRDENES DESDE LA PÁGINA PRINCIPAL ===
    // ======================================================
    window.addEventListener('message', (event) => {
        // Escucha la orden para saltar a un tiempo específico
        if (event.data && event.data.type === 'seekTo') {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(event.data.time, true); // true para permitir el salto
                player.playVideo(); // Inicia la reproducción desde ese punto
            }
        }

        // Puedes añadir más escuchas para otras órdenes en el futuro aquí
    });

    // ======================================================
    // === ESCUCHA ÓRDENES DESDE LA PÁGINA PRINCIPAL ===
    // ======================================================
    window.addEventListener('message', (event) => {
        // Escucha la orden para saltar a un tiempo específico
        if (event.data && event.data.type === 'seekTo') {
            // ... (código existente para saltar en el video) ...
        }

        // --- INICIO DEL NUEVO CÓDIGO AÑADIDO ---
        // Si el mensaje es para mostrar el CTA
        if (event.data && event.data.type === 'show_cta') {
            const ctaConfig = event.data.cta_config;
            const ctaContainer = document.getElementById('external-cta-container');
            
            // Solo creamos el botón si el contenedor existe y está vacío
            if (ctaContainer && !ctaContainer.hasChildNodes()) { 
                const ctaButton = document.createElement('a');
                ctaButton.href = ctaConfig.url || '#';
                ctaButton.className = 'cta-externo-btn';
                ctaButton.target = '_blank';
                ctaButton.textContent = ctaConfig.text;
                ctaButton.style.backgroundColor = ctaConfig.bg_color;
                ctaButton.style.color = ctaConfig.text_color;
                
                ctaContainer.appendChild(ctaButton);
            }

            // Mostramos el contenedor
            if(ctaContainer) {
                ctaContainer.classList.remove('hidden');
            }
        }
        // --- FIN DEL NUEVO CÓDIGO AÑADIDO ---
    });

}); // <-- La línea final del bloque principal

// --- INICIO: LÓGICA PARA MARCAR VIDEOS COMO VISTOS ---

// Función para guardar un video como visto en la memoria del navegador
function saveWatchedVideo(slug) {
    if (!slug) return;
    // Obtenemos la lista de videos ya vistos
    let watched = JSON.parse(localStorage.getItem('watched_videos')) || [];
    // Añadimos el nuevo video solo si no estaba ya en la lista
    if (!watched.includes(slug)) {
        watched.push(slug);
        localStorage.setItem('watched_videos', JSON.stringify(watched));
    }
}

// Función para actualizar la apariencia de un video visto
function markLessonAsWatched(slug) {
    const lessonItem = document.querySelector(`.lesson-item[data-video-slug="${slug}"]`);
    if (lessonItem) {
        lessonItem.classList.add('watched');
    }
}

// Función que se ejecuta al cargar la página para marcar todos los videos que ya se habían visto
function loadWatchedStatus() {
    let watched = JSON.parse(localStorage.getItem('watched_videos')) || [];
    watched.forEach(slug => {
        markLessonAsWatched(slug);
    });
}

// Escuchamos los mensajes que vienen del reproductor (iframe)
window.addEventListener('message', (event) => {
    // Si el mensaje es del tipo 'video_ended'
    if (event.data && event.data.type === 'video_ended') {
        const slug = event.data.video_slug;
        saveWatchedVideo(slug);
        markLessonAsWatched(slug);
    }
});

// Al cargar la página, aplicamos el estado de "visto" a las lecciones correspondientes
document.addEventListener('DOMContentLoaded', () => {
    // Le damos un pequeño respiro para asegurar que todo esté cargado
    setTimeout(loadWatchedStatus, 500);
    
});

// --- FIN: LÓGICA PARA MARCAR VIDEOS COMO VISTOS ---