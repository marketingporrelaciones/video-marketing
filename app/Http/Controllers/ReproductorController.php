<?php

namespace App\Http\Controllers;

use App\Models\PlayerConfig; // Asegúrate de que el nombre del modelo sea correcto. Si lo llamaste Reproductor, cámbialo aquí.
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Para registrar errores si algo falla.

class ReproductorController extends Controller
{
    /**
     * Muestra el formulario para editar un reproductor específico.
     * Este método busca el reproductor por su ID y lo pasa a la vista.
     */
    public function edit($id)
    {
        // findOrFail() es muy útil: si no encuentra el ID, muestra una página de error 404 automáticamente.
        $config = PlayerConfig::findOrFail($id);

        // Retornamos la vista 'editor.edit' y le pasamos la variable $config.
        return view('editor.edit', [
            'config' => $config
        ]);
    }

    /**
     * ✅ MÉTODO NUEVO Y CORREGIDO
     * Actualiza un reproductor específico en la base de datos.
     * Este es el equivalente a tu antiguo 'actualizar_reproductor.php'.
     */
    public function update(Request $request, $id)
    {
        // 1. Buscamos el reproductor que vamos a actualizar.
        $config = PlayerConfig::findOrFail($id);

        // 2. VALIDACIÓN: Aquí definimos las reglas para los datos del formulario.
        // Es una buena práctica para asegurar la integridad de tus datos.
        // Por ahora validamos solo el título, pero podemos añadir más.
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            // Puedes añadir más reglas de validación aquí para otros campos.
        ]);

        try {
            // 3. ASIGNACIÓN DE DATOS: Tomamos todos los datos que llegaron del formulario.
            $datosParaGuardar = $request->all();

            // --- Lógica para los checkboxes ---
            // Los formularios HTML no envían los checkboxes si no están marcados.
            // Este bucle asegura que si un checkbox no se envía, se guarde como 0 (desactivado).
            $checkboxes = [
                'ctrl_barra_progreso', 'ctrl_ajustes', 'ctrl_volumen', 'ctrl_fullscreen',
                'btn_mostrar', 'prev_automatica', 'password_enabled'
            ];

            foreach ($checkboxes as $checkbox) {
                if (!$request->has($checkbox)) {
                    $datosParaGuardar[$checkbox] = 0;
                }
            }

            // 4. GUARDADO: Usamos el método update() para guardar los datos en la base de datos.
            // Esto funciona gracias a la propiedad '$fillable' que definimos en el Modelo.
            $config->update($datosParaGuardar);

            // 5. RESPUESTA: Redirigimos al usuario de vuelta a la página de edición.
            // El método with() adjunta un "mensaje flash" de éxito que podemos mostrar en la vista.
            return redirect()->route('videomarketing.edit', $config->id)
                ->with('success', '¡Reproductor actualizado con éxito!');

        } catch (\Exception $e) {
            // Si algo sale mal al guardar, lo registramos en los logs de Laravel
            // y redirigimos con un mensaje de error.
            Log::error('Error al actualizar el reproductor: ' . $e->getMessage());

            return redirect()->route('videomarketing.edit', $config->id)
                ->with('error', 'Hubo un problema al guardar los cambios.');
        }
    }
}
