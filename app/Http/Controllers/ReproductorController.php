<?php

namespace App\Http\Controllers;

use App\Models\PlayerConfig; // O App\Models\Reproductor si lo llamaste así. ¡Asegúrate de que el nombre coincida!
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ReproductorController extends Controller
{
    /**
     * Muestra la lista de todos los videos del usuario.
     * Equivalente a tu antiguo 'videomarketing.php'.
     */
    public function index()
    {
        // Buscamos todos los reproductores y los pasamos a la vista.
        // Más adelante, filtraremos por usuario.
        $reproductores = PlayerConfig::latest()->get();

        return view('videomarketing.index', compact('reproductores'));
    }

    /**
     * Muestra el formulario para crear un nuevo video.
     * Aún no hemos creado esta vista, lo haremos en el siguiente paso.
     */
    public function create()
    {
        // Por ahora, esta ruta es un marcador de posición.
        // En el siguiente paso crearemos la vista 'videomarketing.create'.
        return view('videomarketing.create');
    }

    /**
     * Guarda un nuevo reproductor en la base de datos.
     * Equivalente a la lógica de tu 'crear_reproductor.php'.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'video_id' => 'required|string|max:255', // Asumimos que el video_id se provee directamente
        ]);

        $reproductor = PlayerConfig::create([
            'title' => $request->title,
            'video_id' => $request->video_id,
            'slug' => Str::random(10), // Genera un slug aleatorio y único
            // Aquí puedes añadir valores por defecto para otras columnas si es necesario
        ]);

        // Redirigimos al usuario directamente al editor del nuevo video.
        return redirect()->route('videomarketing.edit', $reproductor->id)
            ->with('success', '¡Video creado con éxito! Ahora puedes personalizarlo.');
    }


    /**
     * Muestra el formulario para editar un reproductor específico.
     * (Este método ya lo tenías)
     */
    public function edit($id)
    {
        $reproductor = PlayerConfig::findOrFail($id);
        return view('editor.edit', [
            'config' => $reproductor // La vista espera una variable 'config'
        ]);
    }

    /**
     * Actualiza un reproductor específico en la base de datos.
     * (Este método ya lo tenías)
     */
    public function update(Request $request, $id)
    {
        $reproductor = PlayerConfig::findOrFail($id);

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

        $reproductor->update($datosParaGuardar);

        return redirect()->route('videomarketing.edit', $reproductor->id)
            ->with('success', '¡Reproductor actualizado con éxito!');
    }

    /**
     * Elimina un reproductor de la base de datos.
     * Equivalente a tu 'eliminar_reproductor.php'.
     */
    public function destroy($id)
    {
        $reproductor = PlayerConfig::findOrFail($id);
        $reproductor->delete();

        // Redirigimos al usuario a la lista de videos con un mensaje de éxito.
        return redirect()->route('videomarketing.index')
            ->with('success', 'Video eliminado correctamente.');
    }

    /**
     * Clona un reproductor existente.
     * Equivalente a tu 'clonar_reproductor.php'.
     */
    public function clone($id)
    {
        $original = PlayerConfig::findOrFail($id);

        // replicate() crea una copia del modelo en memoria sin guardarla.
        $clon = $original->replicate();

        // Modificamos el título y el slug para evitar duplicados.
        $clon->title = $original->title . ' (Copia)';
        $clon->slug = Str::random(10);
        $clon->push(); // push() guarda el nuevo modelo en la base de datos.

        return redirect()->route('videomarketing.index')
            ->with('success', 'Video clonado con éxito.');
    }

    /**
     * Muestra la página pública del reproductor.
     * Equivalente a tu 'reproductor.php'.
     */
    public function publicShow($slug)
    {
        // Buscamos el video por su 'slug' amigable.
        $reproductor = PlayerConfig::where('slug', $slug)->firstOrFail();

        // Pasamos los datos a una vista pública que crearemos más adelante.
        return view('videomarketing.show', compact('reproductor'));
    }
}
