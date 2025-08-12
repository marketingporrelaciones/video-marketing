<?php

namespace App\Http\Controllers;

use App\Models\PlayerConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ReproductorController extends Controller
{
    /**
     * Muestra la lista de todos los videos.
     */
    public function index()
    {
        $reproductores = PlayerConfig::latest()->get();
        return view('videomarketing.index', compact('reproductores'));
    }

    /**
     * Muestra el formulario para crear un nuevo video.
     */
    public function create()
    {
        // Crearemos esta vista en el siguiente paso.
        return view('videomarketing.create');
    }

    /**
     * Guarda un nuevo reproductor en la base de datos.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'video_id' => 'required|string|max:255',
        ]);

        $reproductor = PlayerConfig::create([
            'title' => $request->title,
            'video_id' => $request->video_id,
            'slug' => Str::random(10),
        ]);

        return redirect()->route('videomarketing.edit', $reproductor->id)
            ->with('success', '¡Video creado con éxito! Ahora puedes personalizarlo.');
    }

    /**
     * Muestra el formulario para editar un reproductor.
     * ✅ CORREGIDO: Laravel ahora nos entrega el objeto PlayerConfig directamente.
     */
    public function edit(PlayerCodeConfig $config) // Cambiamos el nombre del parámetro
    {
        return view('editor.edit', [
            'config' => $config // Ahora coinciden
        ]);
    }

    /**
     * Actualiza un reproductor en la base de datos.
     * ✅ CORREGIDO: Usamos Route Model Binding aquí también.
     */
    public function update(Request $request, PlayerConfig $config)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $datosParaGuardar = $request->all();

        $checkboxes = [
            'ctrl_barra_progreso', 'ctrl_ajustes', 'ctrl_volumen', 'ctrl_fullscreen',
            'btn_mostrar', 'prev_automatica', 'password_enabled'
        ];

        foreach ($checkboxes as $checkbox) {
            if (!$request->has($checkbox)) {
                $datosParaGuardar[$checkbox] = 0;
            }
        }

        $config->update($datosParaGuardar);

        return redirect()->route('videomarketing.edit', $config->id)
            ->with('success', '¡Reproductor actualizado con éxito!');
    }

    /**
     * Elimina un reproductor de la base de datos.
     * ✅ CORREGIDO: Más limpio y seguro.
     */
    public function destroy(PlayerConfig $config) // Cambiado de $id a $config
    {
        $config->delete();
        return redirect()->route('videomarketing.index')
            ->with('success', 'Video eliminado correctamente.');
    }

    /**
     * Clona un reproductor existente.
     * ✅ CORREGIDO: Ahora funciona correctamente.
     */
    public function clone(PlayerConfig $config)
    {
        // $config ya es el objeto que queremos clonar, no necesitamos buscarlo.
        $clon = $config->replicate();

        $clon->title = $config->title . ' (Copia)';
        $clon->slug = Str::random(10);
        $clon->created_at = now(); // Actualizamos la fecha de creación
        $clon->updated_at = now();
        $clon->save(); // Usamos save() para un nuevo registro

        return redirect()->route('videomarketing.index')
            ->with('success', 'Video clonado con éxito.');
    }

    /**
     * Muestra la página pública del reproductor.
     */
    public function publicShow($slug)
    {
        $reproductor = PlayerConfig::where('slug', $slug)->firstOrFail();
        return view('videomarketing.show', compact('reproductor'));
    }



        // --- MÉTODOS PARA LAS PESTAÑAS AJAX ---

    /**
     * Devuelve la vista parcial de la pestaña SEO.
     */
    public function ajaxSeo(PlayerConfig $config)
    {
        // Pasamos la variable como 'config' porque la vista parcial espera ese nombre.
        return view('editor.partials.seo', ['config' => $config]);
    }

}
