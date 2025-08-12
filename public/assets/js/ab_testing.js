// video/assets/js/ab_testing.js

// Variables que se inicializarán cuando el panel de A/B esté cargado
let abVariantsContainer;
let addAbVariantBtn;
let totalPercentageSpan;
let variantCounter = 0; // Para dar IDs únicas a cada variante
const MAX_AB_VARIANTS = 3; // 1 original + 2 variantes

// Función para añadir una nueva fila de variante
function addVariantRow(videoId = '', percentage = 0, isOriginal = false) {
    const variantId = `variant-${variantCounter++}`;
    const isOriginalClass = isOriginal ? 'is-original' : '';
    const variantRow = document.createElement('div');
    variantRow.className = `variant-row form-group-vertical ${isOriginalClass}`;
    variantRow.setAttribute('id', variantId);
    if (isOriginal) {
        variantRow.dataset.isOriginal = 'true';
    }

    variantRow.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
            <div style="flex-grow: 1;">
                <label for="${variantId}-url">URL del Video ${isOriginal ? '(Original)' : ''}</label>
                <input type="text" id="${variantId}-url" name="ab_variant_url[]" placeholder="URL de YouTube" value="${videoId}" ${isOriginal ? 'readonly' : ''}>
            </div>
            <div style="width: 80px;">
                <label for="${variantId}-percentage">%</label>
                <select id="${variantId}-percentage" name="ab_variant_percentage[]" style="width: 100%;">
                    <option value="25" ${percentage === 25 ? 'selected' : ''}>25%</option>
                    <option value="50" ${percentage === 50 ? 'selected' : ''}>50%</option>
                    <option value="75" ${percentage === 75 ? 'selected' : ''}>75%</option>
                </select>
            </div>
            ${!isOriginal ? `<button type="button" class="remove-variant-btn" data-variant-id="${variantId}"><i data-feather="x"></i></button>` : ''}
        </div>
        <small style="color: #a0a7b1;">${isOriginal ? 'Este es tu video principal. Se sincroniza con el campo "URL del Video de YouTube" de arriba.' : 'Pega la URL de tu video variante.'}</small>
    `;
    abVariantsContainer.appendChild(variantRow);
    
    feather.replace(); 

    const percentageInput = variantRow.querySelector(`#${variantId}-percentage`);
    if (percentageInput) {
        percentageInput.addEventListener('input', calculateTotalPercentage);
    }

    const removeBtn = variantRow.querySelector(`.remove-variant-btn`);
    if (removeBtn) {
        removeBtn.addEventListener('click', (event) => {
            event.currentTarget.closest('.variant-row').remove();
            calculateTotalPercentage();
        });
    }
}

// Función para calcular y mostrar el total de porcentajes
function calculateTotalPercentage() {
    let total = 0;
    const currentVariantCount = document.querySelectorAll('.variant-row').length;

    document.querySelectorAll('select[name="ab_variant_percentage[]"]').forEach(select => {
        total += parseInt(select.value) || 0;
    });
    totalPercentageSpan.textContent = `${total}%`;
    totalPercentageSpan.style.color = (total === 100) ? '#28a745' : '#e74c3c';

    if (currentVariantCount >= MAX_AB_VARIANTS) {
        addAbVariantBtn.style.display = 'none';
    } else {
        addAbVariantBtn.style.display = '';
    }
}

// Listener que se dispara cuando el panel de ajustes (con la interfaz A/B) se carga.
document.addEventListener('abPanelLoaded', () => {
    abVariantsContainer = document.getElementById('ab-variants-container');
    addAbVariantBtn = document.getElementById('add-ab-variant-btn');
    totalPercentageSpan = document.getElementById('total-percentage');

    if (!abVariantsContainer || !addAbVariantBtn || !totalPercentageSpan) {
        console.error("Error: Elementos de la interfaz A/B no encontrados.");
        return;
    }

    abVariantsContainer.innerHTML = '';
    variantCounter = 0; 

    if (addAbVariantBtn && !addAbVariantBtn._hasClickListener) {
        addAbVariantBtn.addEventListener('click', () => {
            addVariantRow();
            calculateTotalPercentage();
        });
        addAbVariantBtn._hasClickListener = true;
    }

    

    let abConfig = [];
    try {
        const rawConfig = window.configData?.ab_test_config;
        if (rawConfig && rawConfig !== "null" && rawConfig.trim() !== "") {
            abConfig = JSON.parse(rawConfig);
            if (!Array.isArray(abConfig)) abConfig = [];
        }
    } catch (e) {
        console.error("Error al parsear ab_test_config JSON:", e);
        abConfig = [];
    }

    const currentMainVideoId = window.getYouTubeID(window.configData?.video_id ?? '');
    let newAbConfig = [];
    let originalVariantLoaded = false;

    abConfig.forEach(variant => {
        const variantVideoId = window.getYouTubeID(variant.video_id);
        if (variant.is_original && variantVideoId === currentMainVideoId && !originalVariantLoaded) {
            newAbConfig.push({
                video_id: currentMainVideoId,
                percentage: variant.percentage,
                is_original: true
            });
            originalVariantLoaded = true;
        } else if (variantVideoId.trim() !== '' && variantVideoId !== currentMainVideoId) {
            newAbConfig.push({
                video_id: variantVideoId,
                percentage: variant.percentage,
                is_original: false
            });
        }
    });

    if (!originalVariantLoaded) {
        newAbConfig.unshift({
            video_id: currentMainVideoId,
            percentage: 100,
            is_original: true
        });
    }
    
    window.configData.ab_test_config = JSON.stringify(newAbConfig);
    abVariantsContainer.innerHTML = '';
    variantCounter = 0;

    newAbConfig.forEach(variant => {
        const displayUrl = window.buildYouTubeDisplayUrl(variant.video_id);
        addVariantRow(displayUrl, variant.percentage, variant.is_original);
    });

    calculateTotalPercentage();
});