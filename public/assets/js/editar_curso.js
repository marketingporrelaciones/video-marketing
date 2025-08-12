// /video/assets/js/editar_curso.js (VERSIÓN FINAL HÍBRIDA)

// Definición global de sectionsContainer
const sectionsContainer = document.querySelector('.sections-container');

// Función para guardar el estado de las secciones en localStorage
window.saveSectionStates = () => {
    if (!sectionsContainer) return; // Asegurarse de que sectionsContainer exista
    const collapsedSections = [];
    sectionsContainer.querySelectorAll('.section-block.is-collapsed').forEach(section => {
        collapsedSections.push(section.dataset.sectionId);
    });
    localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
};



// Función para restaurar el estado de las secciones desde localStorage
window.restoreSectionStates = () => {
    if (!sectionsContainer) return; // Asegurarse de que sectionsContainer exista
    const storedCollapsedSections = localStorage.getItem('collapsedSections');
    if (storedCollapsedSections) {
        const collapsedSections = JSON.parse(storedCollapsedSections);
        sectionsContainer.querySelectorAll('.section-block').forEach(section => {
            if (collapsedSections.includes(section.dataset.sectionId)) {
                section.classList.add('is-collapsed');
            } else {
                section.classList.remove('is-collapsed');
            }
        });
    } else {
        // Si no hay estado guardado, colapsar todas las secciones excepto la primera por defecto
        sectionsContainer.querySelectorAll('.section-block').forEach((section, index) => {
            if (index > 0) { // Colapsa todas excepto la primera
                section.classList.add('is-collapsed');
            }
        });
    }
};

// --- INICIO: Código para inicializar Sortable.js para la reordenación de lecciones ---

// Inicializar Sortable.js para lecciones directas (Modo Playlist)
// if (directLessonsGrid) -> IF (si el contenedor de lecciones directas existe)
const directLessonsGrid = document.getElementById('direct-lessons-grid');
if (directLessonsGrid) {
    new Sortable(directLessonsGrid, {
        animation: 150, // Animación suave al mover
        ghostClass: 'sortable-ghost', // Clase CSS para el "fantasma" que se ve al arrastrar
        handle: '.player-card', // El área de la tarjeta completa es arrastrable
        onEnd: function (evt) { // CUANDO (onEnd) se suelta un elemento arrastrado
            const itemEl = evt.item; // El elemento HTML arrastrado
            const sectionId = '0'; // Para lecciones directas, pasamos '0' a PHP (PHP lo interpreta como NULL)

            // Obtener el nuevo orden de los IDs de videos en el contenedor
            // Array.from(parentElement.children) -> crea un array con todos los hijos directos
            // .map(item => item.dataset.id) -> para cada hijo, obtenemos su data-id
            // .filter(id => id) -> filtramos si por alguna razón algún ID es vacío
            const newOrder = Array.from(directLessonsGrid.children)
                                .map(item => item.dataset.id)
                                .filter(id => id);

            // console.log -> PARA DEPURAR: muestra los datos en la consola del navegador
            console.log('--- Lecciones Directas Reordenadas ---');
            console.log('Video ID arrastrado:', itemEl.dataset.id);
            console.log('Nuevo Orden (IDs):', newOrder);
            console.log('ID de Sección (Directa):', sectionId);
            // Aquí llamaremos a una función para guardar el orden en la base de datos (próximo paso)
            saveNewLessonOrder(newOrder, sectionId); // (Comentado por ahora)
        }
    });
}

// Inicializar Sortable.js para lecciones dentro de cada sección
// if (sectionGrids) -> IF (si hay secciones)
const sectionGrids = document.querySelectorAll('.sections-container .player-grid');
sectionGrids.forEach(grid => { // PARA CADA (forEach) cuadrícula de sección
    new Sortable(grid, {
        animation: 150, // Animación suave
        ghostClass: 'sortable-ghost', // Clase CSS para el fantasma
        handle: '.player-card', // El área de la tarjeta es arrastrable
        onEnd: function (evt) { // CUANDO (onEnd) se suelta un elemento
            const itemEl = evt.item; // El elemento arrastrado
            // .closest('.section-block') -> busca el padre más cercano con esa clase (la sección)
            // .dataset.sectionId -> obtiene el ID de la sección
            const sectionId = itemEl.closest('.section-block').dataset.sectionId;

            // Obtener el nuevo orden de los IDs de videos en esta sección
            const newOrder = Array.from(grid.children)
                                .map(item => item.dataset.id)
                                .filter(id => id);

            // console.log -> PARA DEPURAR: muestra los datos en la consola
            console.log('--- Lecciones en Sección Reordenadas ---');
            console.log('Video ID arrastrado:', itemEl.dataset.id);
            console.log('Nuevo Orden (IDs):', newOrder);
            console.log('ID de Sección (Directa):', sectionId);
            // Aquí llamaremos a una función para guardar el orden en la base de datos (próximo paso)
            saveNewLessonOrder(newOrder, sectionId); // (Comentado por ahora)
        }
    });
});

// --- FIN: Código para inicializar Sortable.js para la reordenación de lecciones ---
// ===================================================================
// ================ FASE 1: FUNCIÓN MAESTRA DE BOTONES ===============
// ===================================================================
function actualizarVisibilidadBotones() {
    // Referencias a los botones principales
    const btnAnadirLeccion = document.getElementById('add-direct-lesson-btn');
    const btnCrearSeccion = document.getElementById('add-section-btn');

    if (!btnAnadirLeccion || !btnCrearSeccion) {
        return;
    }

    const numeroSecciones = document.querySelectorAll('.sections-container .section-block').length;
    const numeroLeccionesPlaylist = document.querySelectorAll('#direct-lessons-grid .player-card').length;

    if (numeroSecciones === 0 && numeroLeccionesPlaylist === 0) {
        btnAnadirLeccion.style.display = 'inline-flex';
        btnCrearSeccion.style.display = 'inline-flex';
    } 
    else if (numeroSecciones === 0 && numeroLeccionesPlaylist > 0) {
        btnAnadirLeccion.style.display = 'inline-flex';
        btnCrearSeccion.style.display = 'none';
    } 
    else {
        btnAnadirLeccion.style.display = 'none';
        btnCrearSeccion.style.display = 'inline-flex';
    }
}
// ===================================================================
// ================== FIN FUNCIÓN MAESTRA DE BOTONES =================
// ===================================================================

// --- FUNCIÓN PARA GUARDAR EL NUEVO ORDEN DE LECCIONES EN LA DB ---
/**
 * Envía el nuevo orden de las lecciones a un script PHP.
 * @param {Array<string>} newOrder - Array de IDs de video en el nuevo orden.
 * @param {string} sectionId - ID de la sección (o '0' para lecciones directas).
 */
function saveNewLessonOrder(newOrder, sectionId) {
    fetch('reordenar_lecciones.php', {
        method: 'POST', // Usamos POST para enviar datos
        headers: {
            'Content-Type': 'application/json', // Indicamos que el cuerpo de la solicitud es JSON
        },
        // Convertimos los datos a JSON string para enviarlos
        body: JSON.stringify({
            orden_videos: newOrder,
            id_seccion: sectionId
        }),
    })
    .then(response => response.json()) // Esperamos una respuesta JSON del servidor
    .then(data => {
        if (data.success) {
            console.log('Orden guardado con éxito:', data.message);
            // Opcional: Mostrar una notificación de éxito al usuario
            // alert('¡Orden de lecciones guardado!');
        } else {
            console.error('Error al guardar el orden:', data.message);
            // Opcional: Mostrar una notificación de error al usuario
            alert('Error al guardar el orden de las lecciones: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error de conexión o del servidor al guardar el orden:', error);
        alert('No se pudo conectar con el servidor para guardar el orden.');
    });
}
// --- FIN: FUNCIÓN PARA GUARDAR EL NUEVO ORDEN DE LECCIONES EN LA DB ---



// --- LÓGICA GENERAL DEL POP-UP (MODAL) ---
const addLessonModal = document.getElementById('newVideoModal');
const closeModalBtn = addLessonModal?.querySelector('.close-modal-btn');
const modalSectionIdInput = document.getElementById('modal-section-id-input');

// Función para cerrar el pop-up
if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (addLessonModal) addLessonModal.style.display = 'none';
    });

}
window.addEventListener('click', (event) => {
    if (event.target == addLessonModal) {
        addLessonModal.style.display = 'none';
    }
});


// --- LÓGICA PARA AÑADIR LECCIÓN A UNA SECCIÓN (MODO UDEMY) ---
// sectionsContainer ya está definido globalmente
if (sectionsContainer) {
    window.restoreSectionStates(); // Restaurar el estado al cargar la página
    sectionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-lesson-to-section-btn')) {
            const sectionBlock = e.target.closest('.section-block');
            const sectionId = sectionBlock.dataset.sectionId;

            if (modalSectionIdInput) modalSectionIdInput.value = sectionId;
            if (addLessonModal) addLessonModal.style.display = 'flex';
        }
    });
}

// --- LÓGICA PARA AÑADIR LECCIÓN DIRECTA (MODO PLAYLIST) ---
const addDirectLessonBtn = document.getElementById('add-direct-lesson-btn');
if(addDirectLessonBtn) {
    addDirectLessonBtn.addEventListener('click', () => {
        // Dejamos el valor de la sección vacío, porque es una lección directa.
        if (modalSectionIdInput) modalSectionIdInput.value = '';
        if (addLessonModal) addLessonModal.style.display = 'flex';
    });
}

// --- LÓGICA PARA CREAR UNA SECCIÓN NUEVA ---
const addSectionBtn = document.getElementById('add-section-btn');
if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => {
        const sectionName = prompt("Ingresa el nombre para la nueva sección:");
        if (sectionName && sectionName.trim() !== '') {
            const url = new URL(window.location.href);
            const cursoId = url.searchParams.get("id");

            fetch('crear_seccion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_curso: cursoId,
                    nombre_seccion: sectionName
                })
            })
            .then(async response => { // Marcamos la función como async para usar await
                const clonedResponse = response.clone(); // Clonamos la respuesta para depuración

                if (!response.ok) { // Si la respuesta HTTP no es 2xx (por ejemplo, 400, 500)
                    const errorText = await clonedResponse.text();
                    console.error("Error de la respuesta del servidor (HTTP no OK):", response.status, response.statusText, errorText);
                    throw new Error(`Error del servidor (HTTP ${response.status}): ${errorText.substring(0, 100)}...`);
                }

                try {
                    const data = await response.json(); // Intentamos parsear como JSON
                    return { data, originalResponse: clonedResponse }; // Devolvemos los datos y la respuesta original para el siguiente .then
                } catch (jsonError) {
                    const errorText = await clonedResponse.text(); // Si falla el parseo de JSON, leemos como texto
                    console.error("Error al parsear JSON:", jsonError);
                    console.error("Respuesta cruda que intentó ser JSON:", errorText);
                    throw new Error(`Error de formato de respuesta (JSON inválido): ${errorText.substring(0, 100)}...`);
                }
            })
            .then(({ data }) => { // Solo necesitamos `data` aquí
                if (data.success) {
                    alert('¡Sección creada con éxito!');
                    saveSectionStates(); // Guardar el estado antes de la recarga
                    location.reload(); // Esto debería forzar la recarga de la página
                } else {
                    // Esto se ejecuta si la respuesta JSON es {success: false}
                    alert('Error al crear la sección: ' + (data.message || 'Error desconocido del servidor.'));
                }
            })
            .catch(error => {
                // Este catch maneja errores de red, o los errores lanzados explícitamente en el .then anterior
                console.error("Error completo de la solicitud:", error);
                alert(`Fallo en la operación: ${error.message || 'Error de conexión al servidor.'}`);
            });
        }
    });
}


// ===================================================================
// ================== FIN DE LA NUEVA LÓGICA =======================
// ===================================================================

// --- LÓGICA PARA ELIMINAR UNA SECCIÓN ---
// sectionsContainer ya está definido globalmente
// --- LÓGICA PARA ELIMINAR UNA SECCIÓN ---
if (sectionsContainer) {
    sectionsContainer.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-section-btn'); // Buscamos el botón más cercano
        if (deleteButton) {
            const seccionAEliminar = deleteButton.closest('.section-block'); // Definimos la sección a eliminar
            const sectionId = deleteButton.dataset.sectionId;
            const sectionName = seccionAEliminar.querySelector('h3').textContent.trim();

            if (confirm(`¡ADVERTENCIA!\n\n¿Estás seguro de que quieres eliminar la sección "${sectionName}"?\nEsta acción borrará TODAS las lecciones que contiene de forma PERMANENTE.`)) {
                fetch('eliminar_seccion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_seccion: sectionId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        seccionAEliminar.remove();
                        alert('Sección eliminada con éxito.');
                        actualizarVisibilidadBotones(); // ¡LLAMADA A LA FUNCIÓN MAESTRA!
                    } else {
                        alert('Error al eliminar la sección: ' + (data.message || 'Error desconocido.'));
                    }
                })
                .catch(error => alert('Error de conexión.'));
            }
        }
    });
}

// --- LÓGICA PARA REORDENAR SECCIONES (DRAG & DROP) ---
const sectionsContainerSortable = document.querySelector('.sections-container');
if (sectionsContainerSortable && typeof Sortable !== 'undefined') {
    new Sortable(sectionsContainerSortable, {
        animation: 150,       // Animación suave al mover.
        handle: '.section-header', // Solo se puede arrastrar desde el encabezado de la sección.
        ghostClass: 'sortable-ghost-section', // Estilo para el "fantasma".
        onEnd: function (evt) {
            // Esta función se ejecuta cuando sueltas la sección.
            const sectionBlocks = sectionsContainerSortable.querySelectorAll('.section-block');
            const newOrder = Array.from(sectionBlocks).map(block => block.dataset.sectionId);

            // Enviamos el nuevo orden al servidor.
            fetch('reordenar_secciones.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orden_secciones: newOrder })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('Error al guardar el nuevo orden: ' + data.message);
                } else {
                    window.saveSectionStates(); // Guardar estado después de reordenar
                    console.log('Orden guardado con éxito.');
                }
            })
            .catch(error => alert('Error de conexión al reordenar.'));
        }
    });
}

// --- LÓGICA PARA RENOMBRAR UNA SECCIÓN ---
// sectionsContainer ya está definido globalmente
if (sectionsContainer) {
    sectionsContainer.addEventListener('click', async (e) => {
        const renameButton = e.target.closest('.rename-section-btn');
        if (renameButton) {
            const sectionId = renameButton.dataset.sectionId;
            const sectionTitleSpan = document.getElementById(`section-title-display-${sectionId}`);
            const currentName = sectionTitleSpan ? sectionTitleSpan.textContent.trim() : '';

            const newName = prompt("Ingresa el nuevo nombre para la sección:", currentName);

            if (newName !== null && newName.trim() !== '' && newName.trim() !== currentName) {
                try {
                    const response = await fetch('renombrar_seccion.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_seccion: sectionId,
                            nuevo_nombre: newName.trim()
                        })
                    });
                    const data = await response.json();

                    if (data.success) {
                        if (sectionTitleSpan) {
                            sectionTitleSpan.textContent = data.newName;
                        }
                        console.log('Sección renombrada con éxito.');
                        alert('¡Sección renombrada con éxito!');
                    } else {
                        alert('Error al renombrar la sección: ' + (data.message || 'Error desconocido.'));
                    }
                } catch (error) {
                    alert('Error de conexión al servidor al renombrar la sección.');
                }
            }
        }
    });
}



// --- LÓGICA PARA COMPRIMIR/EXPANDIR Y PERSISTIR ESTADO DE SECCIONES ---
if (sectionsContainer) {
    // Función para guardar el estado de las secciones en localStorage
    const saveSectionStates = () => {
        const collapsedSections = [];
        sectionsContainer.querySelectorAll('.section-block.is-collapsed').forEach(section => {
            collapsedSections.push(section.dataset.sectionId);
        });
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    };

    // Función para restaurar el estado de las secciones desde localStorage
    const restoreSectionStates = () => {
        const storedCollapsedSections = localStorage.getItem('collapsedSections');
        if (storedCollapsedSections) {
            const collapsedSections = JSON.parse(storedCollapsedSections);
            sectionsContainer.querySelectorAll('.section-block').forEach(section => {
                if (collapsedSections.includes(section.dataset.sectionId)) {
                    section.classList.add('is-collapsed');
                } else {
                    section.classList.remove('is-collapsed');
                }
            });
        } else {
            // Si no hay estado guardado, colapsar todas las secciones excepto la primera por defecto
            // Opcional: Puede ajustar esta lógica si prefiere que todas estén expandidas por defecto
            sectionsContainer.querySelectorAll('.section-block').forEach((section, index) => {
                if (index > 0) { // Colapsa todas excepto la primera
                    section.classList.add('is-collapsed');
                }
            });
        }
    };

    // Restaurar el estado al cargar la página
    restoreSectionStates();

    // Guardar el estado cuando una sección se expande/contrae
    sectionsContainer.addEventListener('click', (e) => {
        const toggleButton = e.target.closest('.toggle-section-btn');
        if (toggleButton) {
            const sectionBlock = toggleButton.closest('.section-block');
            sectionBlock.classList.toggle('is-collapsed');
            saveSectionStates(); // Guardar el nuevo estado después del cambio
        }
    });

    // Guardar el estado antes de la recarga de la página (por ejemplo, al añadir nueva sección/lección)
    window.addEventListener('beforeunload', saveSectionStates);

    // Si tienes eventos que causan recargas (como la creación de secciones o lecciones),
    // asegúrate de que antes de `location.reload()` se llame a `saveSectionStates()`.
    // Por ejemplo, en la lógica de 'crear_seccion.php':
    // .then(data => {
    //     if (data.success) {
    //         alert('¡Sección creada con éxito!');
    //         saveSectionStates(); // Asegúrate de guardar antes de recargar
    //         location.reload();
    //     }
    // })

    // Y similarmente para la lógica de clonar lecciones (si causa recarga)
}











// ===================================================================
// ==================== LÓGICA FINAL Y ÚNICA DEL MODAL =====================
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA EDITAR TÍTULO/DESCRIPCIÓN DEL CURSO ---
    const editModal = document.getElementById('editCourseModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editCourseForm = document.getElementById('editCourseForm');
    const renameCourseBtn = document.getElementById('rename-course-btn');

    if (editModal && renameCourseBtn && closeEditModalBtn && editCourseForm) {
        renameCourseBtn.addEventListener('click', function() {
            const cursoId = this.dataset.id;
            const currentTitle = document.getElementById('course-title-display').textContent.trim();
            const currentDescription = document.getElementById('course-description-display').textContent.trim();

            document.getElementById('edit_id_curso').value = cursoId;
            document.getElementById('edit_nombre_curso').value = currentTitle;
            document.getElementById('edit_descripcion_curso').value = currentDescription;

            editModal.style.display = 'block';
        });

        const closeEditModal = () => { editModal.style.display = 'none'; };
        closeEditModalBtn.addEventListener('click', closeEditModal);
        window.addEventListener('click', (event) => {
            if (event.target == editModal) closeEditModal();
        });

        editCourseForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Guardando...';
            submitButton.disabled = true;

            const formData = new FormData(this);
            const dataToSend = Object.fromEntries(formData.entries());

            fetch('renombrar_curso.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('course-title-display').textContent = data.newName;
                    document.getElementById('course-description-display').textContent = data.newDescription;
                    alert('¡Curso actualizado con éxito!');
                    closeEditModal();
                } else {
                    alert('Error: ' + (data.message || 'Error desconocido.'));
                }
            })
            .catch(error => {
                console.error('Error de red:', error);
                alert('Ocurrió un error de conexión.');
            })
            .finally(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

    // ... aquí continúa el resto de la lógica que ya tenías dentro de tu DOMContentLoaded ...
    // ... por ejemplo, el código para el modal de FAQ.
    const faqModal = document.getElementById('faq-modal');
    // ... etc.


    // ===================================================================
    // ============ FASE 2.1: MANEJADOR DE ELIMINACIÓN DE LECCIONES Y SECCIONES =========
    // ===================================================================

    // Usamos el contenedor principal de la página para escuchar todos los clics.
    const mainContentContainer = document.querySelector('.app-main-content');

    if (mainContentContainer) {
        mainContentContainer.addEventListener('click', (event) => {
            const target = event.target;

            // ----- Lógica para ELIMINAR UNA LECCIÓN (botón .delete-btn) -----
            if (target.classList.contains('delete-btn')) {
                const tarjetaAEliminar = target.closest('.player-card');
                const idVideo = target.dataset.id;

                if (!idVideo || !tarjetaAEliminar) return;

                if (confirm('¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer.')) {
                    // Usamos el script existente 'eliminar_reproductor.php' que borra la "caja de video"
                    fetch('eliminar_reproductor.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `id=${idVideo}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            tarjetaAEliminar.remove(); // Elimina la tarjeta visualmente
                            alert('Lección eliminada.');
                            actualizarVisibilidadBotones(); // ¡LLAMADA A LA FUNCIÓN MAESTRA!
                        } else {
                            alert('Error al eliminar la lección: ' + (data.message || 'Error desconocido.'));
                        }
                    })
                    .catch(error => console.error('Error de red:', error));
                }
            }
        });
    }
});