// /video/assets/js/main.js

// --- CURSO: ESTRUCTURA CORRECTA DEL SCRIPT ---
// Este es el script principal para la página del Dashboard.
// Usamos 'DOMContentLoaded' para asegurarnos de que todo el HTML
// de la página se ha cargado antes de que nuestro JavaScript intente
// manipularlo. Esto previene errores de "elemento no encontrado".

document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: FUNCIONALIDAD PARA CREAR NUEVO VIDEO (EL MODAL) ---
    // Este es el código original que hace funcionar la ventana emergente.
    const modal = document.getElementById('newVideoModal');
    const openBtn = document.getElementById('openModalBtn');

    if (modal && openBtn) {
        const closeBtn = modal.querySelector('.close-modal-btn');

        // Al hacer clic en "Crear Nuevo Reproductor", muestra el modal.
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        // Si existe el botón de cerrar (la 'X'), le asignamos la función de ocultar el modal.
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
        }

        // Si el usuario hace clic fuera del contenido del modal, también se cierra.
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

     // --- INICIO: CÓDIGO DE DRAG & DROP RESTAURADO ---
    const playerGrid = document.querySelector('.player-grid');
    if (playerGrid && typeof Sortable !== 'undefined') {
        new Sortable(playerGrid, {
            animation: 150,
            handle: '.player-card', // El área arrastrable
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                const orderedItems = Array.from(playerGrid.children);
                const newOrderIds = orderedItems.map(item => item.dataset.id).filter(id => id);

                fetch('reordenar_videos_marketing.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_order: newOrderIds })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        alert('Error al guardar el nuevo orden.');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        });
    }

});
