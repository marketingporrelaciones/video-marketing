// /video/assets/js/player.js (VERSIÓN FINAL DEFINITIVA)

// -- Variables Globales --
let player;
let timeUpdater;
let controlsTimeout; // <-- AÑADE ESTA LÍNEA
let isFullPlayback = false;
let leadFormShown = false;
let analyticsSent = false;

// --- LÓGICA DE INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('password-form');
    const passwordOverlay = document.getElementById('password-overlay');
    const isVerified = sessionStorage.getItem('password_verified_' + playerConfig.id) === 'true';

    // 1. Decidimos si mostramos la pantalla de bloqueo o el reproductor
    if (playerConfig.password_enabled && !isVerified) {
        // Si el video tiene contraseña y no ha sido verificada, mostramos el overlay
        if(passwordOverlay) passwordOverlay.style.display = 'flex';
    } else {
        // Si no tiene contraseña o ya fue verificada, ocultamos el overlay e iniciamos el video
        if(passwordOverlay) passwordOverlay.style.display = 'none';
        loadYouTubeAPI();
    }

    // 2. Lógica para el formulario de la contraseña
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('password-input');
            const errorElement = document.getElementById('password-error');

            fetch('verificar_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: playerConfig.id,
                    password: passwordInput.value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    sessionStorage.setItem('password_verified_' + playerConfig.id, 'true');
                    window.location.reload();
                } else {
                    errorElement.textContent = data.message || 'Error de verificación.';
                    passwordInput.value = '';
                }
            })
            .catch(() => {
                errorElement.textContent = 'Error de conexión.';
            });
        });
    }
    // --- Escuchar mensajes del padre para saltar en el video ---
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'seekTo') {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(event.data.time, true); // true para permitir que salte
                player.playVideo(); // Opcional: auto-play al saltar
            }
        }
    });
});
// --- FUNCIONES DEL REPRODUCTOR DE YOUTUBE ---

function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Esta es la única función que la API de YouTube necesita. Se llamará sola.
window.onYouTubeIframeAPIReady = function() {
    if (typeof playerConfig === 'undefined') {
        return;
    }

    buildPlayerUI();

    // --- INICIO DE LA CORRECCIÓN CON IF/ELSE ---
    let shouldAutoplay = 0; // Por defecto, el video NO se reproducirá automáticamente.

    // SI (if) la opción "Previsualización Automática" está activada (es igual a 1)...
    if (playerConfig.prev_automatica == 1) {
        // ENTONCES, cambiamos nuestra decisión y le decimos que SÍ debe reproducirse.
        shouldAutoplay = 1;
    }
    // SI NO (else), la variable se queda en 0 y el video no se reproducirá solo.
    // --- FIN DE LA CORRECCIÓN ---

    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: playerConfig.video_id,
        playerVars: {
            'controls': 0,
            'rel': 0,
            'modestbranding': 1,
            'playsinline': 1,
            'mute': 1,
            'showinfo': 0,
            'iv_load_policy': 3,
            'autoplay': shouldAutoplay, // Usamos nuestra variable de decisión aquí
            'origin': window.location.origin // <-- AÑADE ESTA LÍNEA
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange
        }
    });
}

function buildPlayerUI() {
    const container = document.getElementById('player-container');
    if (!container) return;

    let thumbnailUrl = `https://i.ytimg.com/vi/${playerConfig.video_id}/maxresdefault.jpg`;
    if (playerConfig.custom_thumbnail && playerConfig.custom_thumbnail !== 'null') {
        thumbnailUrl = `uploads/${playerConfig.custom_thumbnail}`;
    }

    const hasText = playerConfig.texto_previsualizacion && playerConfig.texto_previsualizacion.trim() !== '';
    
    // --- INICIO DE LA CORRECCIÓN CON IF/ELSE ---
    // Aquí le damos la instrucción clara al programa.
    let bigPlayButtonHTML = ''; // Por defecto, no creamos ningún botón.

    // SI (if) la opción "Mostrar botón" está activada (es igual a 1)...
    if (playerConfig.btn_mostrar == 1) {
        // ENTONCES, construimos todo el código HTML para el botón.
        bigPlayButtonHTML = `
            <div class="preview-content-wrapper ${hasText ? 'has-text-bg' : ''}">
                <div id="big-play-button" class="animate--${playerConfig.animacion || 'none'}">
                    <svg viewBox="0 0 100 100"><polygon points="40,30 70,50 40,70"></polygon></svg>
                </div>
                ${hasText ? `<div class="preview-overlay-text">${playerConfig.texto_previsualizacion}</div>` : ''}
            </div>
        `;
    }
    // No necesitamos un "else" porque por defecto, la variable ya está vacía.
    // --- FIN DE LA CORRECCIÓN ---

    const uiHTML = `
        <div id="youtube-player"></div>
        <div class="preview-overlay" style="background-image: url('${thumbnailUrl}');">${bigPlayButtonHTML}</div>
        <div class="custom-controls-bar">
            <div class="progress-bar-container" ${playerConfig.ctrl_barra_progreso != 1 ? 'style="display: none;"' : ''}>
                <div class="progress-bar">
                    <div class="chapter-markers-container"></div>
                    <div class="played-bar"></div>
                    <div class="progress-thumb"></div>
                </div>
                <div class="progress-tooltip"></div>
            </div>
            <div class="bottom-controls">
                <div class="controls-left">
                    <button class="control-button skip-button" data-skip="-10" title="Retroceder 10 segundos">
                        <i data-feather="rotate-ccw"></i>
                        <span>10</span>
                    </button>
                    <button class="control-button play-pause-button"><i data-feather="play" class="play-icon"></i><i data-feather="pause" class="pause-icon" style="display: none;"></i></button>
                    <button class="control-button skip-button" data-skip="10" title="Adelantar 10 segundos">
                        <i data-feather="rotate-cw"></i>
                        <span>10</span>
                    </button>
                    <div class="volume-container" ${playerConfig.ctrl_volumen != 1 ? 'style="display: none;"' : ''}>
                    <button class="control-button volume-button"><i data-feather="volume-2" class="volume-on-icon"></i><i data-feather="volume-x" class="volume-off-icon" style="display: none;"></i></button><div class="volume-slider-container"><div class="volume-slider"><div class="volume-level"></div></div></div></div><div class="time-display">00:00 / 00:00</div></div>
                <div class="controls-right">
                    <div class="chapters-container">
                        <button class="control-button chapters-button" style="display: none;"><i data-feather="list"></i></button>
                        <div class="chapters-menu"></div>
                    </div>
                    <div class="settings-container"><button class="control-button settings-button" ${playerConfig.ctrl_ajustes != 1 ? 'style="display: none;"' : ''}><i data-feather="settings"></i></button></div>
                    <button class="control-button fullscreen-button" ${playerConfig.ctrl_fullscreen != 1 ? 'style="display: none;"' : ''}><i data-feather="maximize"></i></button>
                </div>
            </div>
        </div>`;
        
    let leadFormHTML = '';
    if (playerConfig.lead_form_enabled == 1) {
        const skipButtonHTML = playerConfig.lead_form_allow_skip == 1
            ? `<button type="button" class="lead-form-skip-btn">Saltar</button>`
            : '';

        leadFormHTML = `
            <div class="lead-form-overlay" id="lead-form-overlay">
                <div class="lead-form-container">
                    <form id="lead-form">
                        <h3>${playerConfig.lead_form_headline}</h3>
                        <p>${playerConfig.lead_form_description}</p>
                        <input type="email" name="email" placeholder="Escribe tu mejor email..." required>
                        <button type="submit" class="form-submit-btn">${playerConfig.lead_form_button_text || 'Continuar'}</button>
                        ${skipButtonHTML}
                    </form>
                </div>
            </div>
        `;
    }
    container.innerHTML = uiHTML + leadFormHTML;
    feather.replace();

    if (playerConfig.cta_externo_enabled == 1) {
        const ctaContainer = document.getElementById('external-cta-container');
        if (ctaContainer) {
            const ctaButton = document.createElement('a');
            ctaButton.href = playerConfig.cta_externo_url || '#';
            ctaButton.className = 'cta-externo-btn';
            ctaButton.target = '_blank'; 
            ctaButton.textContent = playerConfig.cta_externo_text;
            ctaButton.style.backgroundColor = playerConfig.cta_externo_bg_color;
            ctaButton.style.color = playerConfig.cta_externo_text_color;
            ctaContainer.appendChild(ctaButton);
        }
    }
}

function onPlayerReady(event) {
    attachEventListeners();
    updateTimeDisplay();
    updateVolumeDisplay();

    const isGifMode = playerConfig.prev_automatica == 1 && playerConfig.btn_mostrar == 1;
    const isNormalAutoplay = playerConfig.prev_automatica == 1 && playerConfig.btn_mostrar == 0;

    if (isGifMode) {
        document.querySelector('.preview-overlay')?.classList.add('gif-mode');
    }

    if (isNormalAutoplay) {
        document.querySelector('.preview-overlay')?.classList.add('hidden');
    }

    // --- INICIO DE LA MEJORA: SALTAR AL TIEMPO DESDE LA URL ---
    try {
        const hash = window.parent.location.hash;
        if (hash && hash.startsWith('#t=')) {
            const time = parseInt(hash.substring(3), 10);
            if (!isNaN(time)) {
                player.seekTo(time, true);
                player.playVideo();
                player.unMute();
                isFullPlayback = true;
            }
        }
    } catch (e) {
        console.warn('No se pudo acceder a la URL de la página principal para buscar el tiempo del capítulo.');
    }
    // --- FIN DE LA MEJORA ---

    // --- INICIO: REACTIVACIÓN DE LA LÓGICA DE CAPÍTULOS ---
    // Volvemos a llamar a las funciones para cargar y mostrar los capítulos.
    const duration = player.getDuration();
    if (playerConfig && playerConfig.id && duration) {
        loadAndDisplayChapters(playerConfig.id, duration);
        attachChapterTooltipEvents();
    }
    // --- FIN: REACTIVACIÓN DE LA LÓGICA DE CAPÍTULOS ---
}

function onPlayerStateChange(event) {
    const container = document.getElementById('player-container');
    const playIcon = container.querySelector('.play-icon');
    const pauseIcon = container.querySelector('.pause-icon');
    const previewOverlay = container.querySelector('.preview-overlay');

    if (event.data === YT.PlayerState.PLAYING) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        timeUpdater = setInterval(updateTimeDisplay, 250);
        container.classList.remove('paused');

        if (isFullPlayback) {
            previewOverlay?.classList.add('hidden');
        }

        // ¡AÑADIDO: Enviar mensaje al padre cuando el video empieza a reproducirse!
        if (window.parent) { // IF (si) esta ventana tiene un padre (está en un iframe)
            window.parent.postMessage({ // ENTONCES, enviamos un mensaje al padre
                type: 'youtube_player_ready', // Tipo de mensaje para identificarlo
                player_id: playerConfig.id,   // ID de nuestro reproductor (opcional, para identificar si tienes varios)
                video_id: playerConfig.video_id // ID del video de YouTube que se está reproduciendo
            }, '*'); // '*' es para cualquier origen, se puede refinar a 'http://localhost'
        }

    } else if (event.data === YT.PlayerState.ENDED) {
        isFullPlayback = false;
        player.seekTo(0);
        player.pauseVideo();
        const previewOverlay = container.querySelector('.preview-overlay');
        if (previewOverlay) {
            previewOverlay.classList.remove('hidden');
        }

        // --- INICIO DE LA MEJORA ---
        // Envía un mensaje a la página principal (curso.php) avisando que el video terminó.
        if (window.parent) {
            window.parent.postMessage({ type: 'video_ended', video_slug: playerConfig.slug }, '*');
        }
        // --- FIN DE LA MEJORA ---
    }
    else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        clearInterval(timeUpdater);
        container.classList.add('paused');

        if (isFullPlayback) {
             previewOverlay?.classList.remove('hidden');
        }
    }
}

function showTemporaryNotice(message) {
    const container = document.getElementById('player-container');
    if (!container) return;

    let notice = container.querySelector('.temporary-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.className = 'temporary-notice';
        container.appendChild(notice);
    }

    notice.textContent = message;
    notice.style.display = 'block';
    notice.style.opacity = '1';

    setTimeout(() => {
        if (notice) {
            notice.style.opacity = '0';
            setTimeout(() => { notice.style.display = 'none'; }, 300);
        }
    }, 2000);
}

function onPlaybackQualityChange(event) {
    const newQuality = event.data;
    const qualityLabel = getQualityLabel(newQuality);

    const container = document.getElementById('player-container');
    let qualityNotice = container.querySelector('.quality-notice');
    if (!qualityNotice) {
        qualityNotice = document.createElement('div');
        qualityNotice.className = 'quality-notice';
        container.appendChild(qualityNotice);
    }
    qualityNotice.textContent = qualityLabel;
    qualityNotice.style.display = 'block';
    
    setTimeout(() => {
        if(qualityNotice) qualityNotice.style.display = 'none';
    }, 2000);
}

function togglePlayPause() {
    if (!player || typeof player.getPlayerState !== 'function') return;

    if (!isFullPlayback) {
        isFullPlayback = true;
        const isGifMode = playerConfig.prev_automatica == 1 && playerConfig.btn_mostrar == 1;
        if(isGifMode) {
             player.stopVideo();
             player.seekTo(0);
        }
        player.unMute();
        const formData = new URLSearchParams();
        formData.append('player_id', playerConfig.id);
        formData.append('video_id', playerConfig.video_id);

        fetch('increment_view.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        player.playVideo();
    } else {
        if(player.getPlayerState() === YT.PlayerState.ENDED) {
            player.seekTo(0);
        }
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
}

function attachEventListeners() {
    // --- INICIO DEL BLOQUE A AÑADIR ---
    const playerContainer = document.getElementById('player-container');
    
    // Curso IF/ELSE: Esta lógica controla la visibilidad de la barra.
    playerContainer.addEventListener('mousemove', () => {
        // CADA VEZ que el mouse se mueve sobre el video...
        playerContainer.classList.add('controls-active'); // Muestra los controles.
        clearTimeout(controlsTimeout); // Reinicia el temporizador.

        // IF (SI) el video se está reproduciendo...
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            // ...ENTONCES, programa que los controles se oculten en 3 segundos.
            controlsTimeout = setTimeout(() => {
                playerContainer.classList.remove('controls-active');
            }, 3000);
        }
    });
    // --- FIN DEL BLOQUE A AÑADIR ---
    const container = document.getElementById('player-container');
    container.querySelector('.preview-overlay')?.addEventListener('click', togglePlayPause);
    container.querySelector('.play-pause-button')?.addEventListener('click', togglePlayPause);
    
    const skipButtons = container.querySelectorAll('.skip-button');
    skipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const skipTime = parseFloat(button.dataset.skip);
            const newTime = player.getCurrentTime() + skipTime;
            player.seekTo(newTime);
        });
    });
    
    const progressBar = container.querySelector('.progress-bar-container');
    if (progressBar) { progressBar.addEventListener('click', (e) => { if (isFullPlayback) { const rect = progressBar.getBoundingClientRect(); player.seekTo((e.clientX - rect.left) / rect.width * player.getDuration(), true); } }); }
    
    const fullscreenBtn = container.querySelector('.fullscreen-button');
    if (fullscreenBtn) { fullscreenBtn.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else container.requestFullscreen(); }); }

    const volumeButton = container.querySelector('.volume-button');
    if(volumeButton) {
        volumeButton.addEventListener('click', () => {
            if(player.isMuted()) {
                player.unMute();
            } else {
                player.mute();
            }
            updateVolumeDisplay();
        });
    }

    const volumeSlider = container.querySelector('.volume-slider');
    if (volumeSlider) {
        let isDraggingVolume = false;
        const setVolumeFromEvent = (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            let percentage = (e.clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            if (player.isMuted()) player.unMute();
            player.setVolume(percentage * 100);
        };
        volumeSlider.addEventListener('mousedown', (e) => { isDraggingVolume = true; setVolumeFromEvent(e); });
        window.addEventListener('mousemove', (e) => { if (isDraggingVolume) { setVolumeFromEvent(e); } });
        window.addEventListener('mouseup', () => { isDraggingVolume = false; });
        player.addEventListener('onVolumeChange', updateVolumeDisplay);
    }

    const settingsContainer = document.querySelector('.settings-container');
    const settingsBtn = document.querySelector('.settings-button');
    if (settingsBtn && settingsContainer) {
        settingsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const existingMenu = settingsContainer.querySelector('.settings-menu');
            if (existingMenu) {
                existingMenu.remove();
                return;
            }

            const availableQualities = player.getAvailableQualityLevels();
            const menu = document.createElement('div');
            menu.className = 'settings-menu';
            const qualitiesToShow = ['auto', ...availableQualities];
            
            qualitiesToShow.forEach(quality => {
                const qualityButton = document.createElement('button');
                qualityButton.textContent = quality === 'auto' ? 'Automático' : getQualityLabel(quality);
                
                if (quality === player.getPlaybackQuality()) {
                    qualityButton.classList.add('active');
                }

                qualityButton.addEventListener('click', () => {
                    showTemporaryNotice(`Solicitando ${getQualityLabel(quality)}...`);
                    player.setPlaybackQuality(quality);
                    setTimeout(() => {
                        const openMenu = settingsContainer.querySelector('.settings-menu');
                        if (openMenu) {
                            openMenu.remove();
                        }
                    }, 100);
                });
                menu.appendChild(qualityButton);
            });
            settingsContainer.appendChild(menu);
        });

        window.addEventListener('click', (e) => {
            if (!settingsContainer.contains(e.target)) {
                const openMenu = settingsContainer.querySelector('.settings-menu');
                if (openMenu) {
                    openMenu.remove();
                }
            }
        });
    }
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = event.target.email.value;
            const playerId = playerConfig.id;

            fetch('capturar_lead.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, player_id: playerId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (playerConfig.webhook_url && playerConfig.webhook_url.trim() !== '') {
                        const webhookPayload = {
                            email: email,
                            source_video_title: playerConfig.title,
                            source_video_id: playerConfig.video_id,
                            captured_at: new Date().toISOString()
                        };

                        fetch(playerConfig.webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(webhookPayload)
                        }).catch(error => console.error('Error de conexión al enviar al Webhook:', error));
                    }
                } else {
                    console.error('Error al guardar lead en la base de datos:', data.message);
                }
            })
            .catch(error => {
                console.error('Error de conexión al capturar lead:', error);
            })
            .finally(() => {
                document.getElementById('lead-form-overlay').style.display = 'none';
                player.playVideo();
            });
        });

        const skipButton = leadForm.querySelector('.lead-form-skip-btn');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                document.getElementById('lead-form-overlay').style.display = 'none';
                player.playVideo();
            });
        }
    }
    // --- INICIO: Lógica para el menú de capítulos ---
    const chaptersButton = document.querySelector('.chapters-button');
    const chaptersMenu = document.querySelector('.chapters-menu');
    const chaptersContainer = document.querySelector('.chapters-container');

    if (chaptersButton && chaptersMenu && chaptersContainer) {
        chaptersButton.addEventListener('click', (e) => {
            e.stopPropagation();
            chaptersMenu.classList.toggle('visible');
        });

        // Cierra el menú si se hace clic fuera de él
        window.addEventListener('click', (e) => {
            if (!chaptersContainer.contains(e.target)) {
                chaptersMenu.classList.remove('visible');
            }
        });
    }
    // --- FIN: Lógica para el menú de capítulos ---
}

function updateTimeDisplay() { 
    if (!player || typeof player.getCurrentTime !== 'function') return; 
    const currentTime = player.getCurrentTime(); 
    const duration = player.getDuration(); 
    const timeDisplay = document.querySelector('.time-display'); 
    if (timeDisplay) { timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration || 0)}`; } 
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0; 
    const playedBar = document.querySelector('.played-bar'); 
    if(playedBar) playedBar.style.width = `${percentage}%`; 
    const progressThumb = document.querySelector('.progress-thumb'); 
    if(progressThumb) progressThumb.style.left = `${percentage}%`; 
    
    if (
        playerConfig.lead_form_enabled == 1 &&
        !leadFormShown &&
        isFullPlayback == true &&
        player.getCurrentTime() >= playerConfig.lead_form_timestamp
    ) {
        player.pauseVideo();
        const leadFormOverlay = document.getElementById('lead-form-overlay');
        if (leadFormOverlay) {
            leadFormOverlay.style.display = 'flex';
        }
        leadFormShown = true;
    }
    
    // CÓDIGO NUEVO Y MEJORADO
    const ctaContainer = document.getElementById('external-cta-container');
    if (
        ctaContainer &&
        playerConfig.cta_externo_enabled == 1 &&
        isFullPlayback === true &&
        player.getCurrentTime() >= playerConfig.cta_externo_timestamp
    ) {
        // Verificamos si estamos dentro de un iframe
        const isEmbedded = window.self !== window.top;

        if (isEmbedded) {
            // Si estamos en un iframe, enviamos un mensaje a la página principal (curso.php)
            window.parent.postMessage({
                type: 'show_cta',
                cta_config: { // Enviamos toda la info del botón
                    url: playerConfig.cta_externo_url,
                    text: playerConfig.cta_externo_text,
                    bg_color: playerConfig.cta_externo_bg_color,
                    text_color: playerConfig.cta_externo_text_color
                }
            }, '*');
        } else {
            // Si no, mostramos el botón localmente (para cuando se visita index.php directamente)
            ctaContainer.classList.remove('hidden');
        }
    }
}

function updateVolumeDisplay() {
    if (!player || typeof player.getVolume !== 'function') return;
    const container = document.getElementById('player-container');
    const volumeLevel = container.querySelector('.volume-level');
    const volumeOnIcon = container.querySelector('.volume-on-icon');
    const volumeOffIcon = container.querySelector('.volume-off-icon');

    if (player.isMuted() || player.getVolume() === 0) {
        if(volumeLevel) volumeLevel.style.width = '0%';
        if(volumeOnIcon) volumeOnIcon.style.display = 'none';
        if(volumeOffIcon) volumeOffIcon.style.display = 'block';
    } else {
        if(volumeLevel) volumeLevel.style.width = `${player.getVolume()}%`;
        if(volumeOnIcon) volumeOnIcon.style.display = 'block';
        if(volumeOffIcon) volumeOffIcon.style.display = 'none';
    }
}

function formatTime(timeInSeconds) { const time = Math.round(timeInSeconds || 0); const minutes = String(Math.floor(time / 60)).padStart(2, '0'); const seconds = String(time % 60).padStart(2, '0'); return `${minutes}:${seconds}`; }
function getQualityLabel(quality) { const labels = { 'hd2160': '2160p 4K', 'hd1440': '1440p HD', 'hd1080': '1080p HD', 'hd720': '720p HD', 'large': '480p', 'medium': '360p', 'small': '240p', 'tiny': '144p' }; return labels[quality] || quality; }
// --- INICIO: NUEVA LÓGICA PARA CAPÍTULOS VISUALES ---

    async function loadAndDisplayChapters(videoId, duration) {
    const markersContainer = document.querySelector('.chapter-markers-container');
    const menuContainer = document.querySelector('.chapters-menu');
    const chaptersButton = document.querySelector('.chapters-button');

    if (!markersContainer || !menuContainer || !chaptersButton || !videoId || !duration) return;

    try {
        const response = await fetch(`cargar_capitulos.php?id_video=${videoId}`);
        const data = await response.json();

        markersContainer.innerHTML = ''; 
        menuContainer.innerHTML = '';

        if (data.success && data.chapters && data.chapters.length > 0) {
            // SI (IF) encontramos capítulos, procedemos.

            chaptersButton.style.display = 'none'; // ¡Cambiado! Oculta el botón permanentemente.
            window.videoChapters = data.chapters; 

            // Esta parte que dibuja los marcadores en la barra de progreso la dejamos como está,
            // porque es una funcionalidad que solo JavaScript puede hacer en tiempo real.
            data.chapters.forEach(chapter => {
                if (chapter.tiempo_inicio < duration) {
                    const marker = document.createElement('div');
                    marker.className = 'chapter-marker';
                    marker.style.left = `${(chapter.tiempo_inicio / duration) * 100}%`;
                    markersContainer.appendChild(marker);
                }
            });

            /*
            // --- INICIO DEL CÓDIGO COMENTADO ---
            // AHORA ESTA PARTE LA HACE PHP, POR LO QUE LA DESACTIVAMOS EN JAVASCRIPT
            // La "comentamos" en lugar de borrarla por si alguna vez quieres revertir el cambio.
            
            const chapterList = document.createElement('ul');
            const pageUrl = new URL(window.location.href);
            pageUrl.hash = '';

            data.chapters.forEach(chapter => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                const chapterUrl = new URL(pageUrl.href);
                chapterUrl.hash = `t=${chapter.tiempo_inicio}`;

                link.href = chapterUrl.href;
                link.className = 'chapter-menu-link';
                link.dataset.time = chapter.tiempo_inicio;
                link.innerHTML = `<span class="chapter-menu-time">${formatTime(chapter.tiempo_inicio)}</span> <span class="chapter-menu-title">${chapter.titulo}</span>`;

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    player.seekTo(chapter.tiempo_inicio, true);
                    menuContainer.classList.remove('visible');
                });

                listItem.appendChild(link);
                chapterList.appendChild(listItem);
            });
            menuContainer.appendChild(chapterList);
            // --- FIN DEL CÓDIGO COMENTADO ---
            */

        } else {
            // SI NO (ELSE), no hay capítulos.
            chaptersButton.style.display = 'none';
            window.videoChapters = []; 
        }
    } catch (error) {
        console.error("Error al cargar los capítulos:", error);
        window.videoChapters = [];
    }
}

function attachChapterTooltipEvents() {
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const tooltip = document.querySelector('.progress-tooltip');

    if (!progressBarContainer || !tooltip) return;

    progressBarContainer.addEventListener('mousemove', (e) => {
        if (!window.videoChapters || window.videoChapters.length === 0) return;

        const rect = progressBarContainer.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const hoverPercentage = hoverX / rect.width;
        const hoverTime = player.getDuration() * hoverPercentage;

        let currentChapterTitle = '';
        // Buscamos el capítulo que corresponde al tiempo sobre el que se pasa el ratón
        for (let i = window.videoChapters.length - 1; i >= 0; i--) {
            if (hoverTime >= window.videoChapters[i].tiempo_inicio) {
                currentChapterTitle = window.videoChapters[i].titulo;
                break;
            }
        }

        if (currentChapterTitle) {
            tooltip.textContent = currentChapterTitle;
            tooltip.style.left = `${hoverX}px`; // Posiciona el tooltip justo donde está el ratón
            tooltip.classList.add('visible');
        } else {
            tooltip.classList.remove('visible');
        }
    });

    progressBarContainer.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
}

// --- FIN: NUEVA LÓGICA PARA CAPÍTULOS VISUALES ---
