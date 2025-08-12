{{-- Este es el contenido que se cargará dinámicamente en la pestaña de SEO --}}
<div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Optimización para Motores de Búsqueda (SEO)</h3>

    <div class="space-y-4">
        <!-- Título SEO -->
        <div>
            <label for="seo_title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título SEO</label>
            <input type="text" name="seo_title" id="seo_title" value="{{ old('seo_title', $config->seo_title) }}" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <p class="mt-2 text-xs text-gray-500">El título que aparecerá en los resultados de búsqueda. Recomendado: 50-60 caracteres.</p>
        </div>

        <!-- Meta Descripción -->
        <div>
            <label for="seo_description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Descripción</label>
            <textarea name="seo_description" id="seo_description" rows="3" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">{{ old('seo_description', $config->seo_description) }}</textarea>
            <p class="mt-2 text-xs text-gray-500">Un resumen corto del contenido del video. Recomendado: 150-160 caracteres.</p>
        </div>

        <!-- Focus Keyphrase -->
        <div>
            <label for="focus_keyphrase" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Palabra Clave Principal</label>
            <input type="text" name="focus_keyphrase" id="focus_keyphrase" value="{{ old('focus_keyphrase', $config->focus_keyphrase) }}" class="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <p class="mt-2 text-xs text-gray-500">La palabra o frase principal por la que quieres que este video se posicione.</p>
        </div>
    </div>
</div>
