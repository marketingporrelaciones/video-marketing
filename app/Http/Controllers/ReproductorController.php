<?php

namespace App\Http\Controllers;

use App\Models\Reproductor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ReproductorController extends Controller
{
    /**
     * Muestra la lista de reproductores.
     */
    public function index(Request $request)
    {
        $reproductores = $request->user()->reproductores()->latest()->get();
        return view('videomarketing.index', compact('reproductores'));
    }

    /**
     * Guarda un nuevo reproductor.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'youtube_url' => 'required|string',
        ]);

        preg_match('/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/', $validated['youtube_url'], $matches);
        $videoId = $matches[1] ?? null;

        if (!$videoId) {
            return back()->withErrors(['youtube_url' => 'La URL de YouTube no es válida.']);
        }

        $reproductor = $request->user()->reproductores()->create([
            'video_id' => $videoId,
            'title' => 'Nuevo Video (Editar Título)',
            'slug' => Str::random(8)
        ]);

        return redirect()->route('videomarketing.edit', $reproductor)->with('success', '¡Reproductor creado!');
    }

    /**
     * Muestra la página pública de un reproductor.
     */
    public function show(Reproductor $videomarketing)
    {
        $cacheKey = 'reproductor-' . $videomarketing->id;
        $view = Cache::remember($cacheKey, 3600, function () use ($videomarketing) {
            return view('videomarketing.show', ['videomarketing' => $videomarketing])->render();
        });
        return $view;
    }

    /**
     * Muestra la página para editar un reproductor.
     */
    public function edit(Reproductor $videomarketing)
    {
        return view('editor.edit', ['videomarketing' => $videomarketing]);
    }

    /**
     * Actualiza un reproductor existente.
     */
    public function update(Request $request, Reproductor $videomarketing)
    {
        // 1. Validamos todos los campos que SÍ queremos guardar en la BD.
        $validatedData = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:reproductores,slug,' . $videomarketing->id,
            'color_principal' => 'sometimes|string|max:7',
            'color_controles' => 'sometimes|string|max:7',
            'color_barras' => 'sometimes|string|max:7',
            'ctrl_barra_progreso' => 'sometimes|boolean',
            'ctrl_ajustes' => 'sometimes|boolean',
            'ctrl_volumen' => 'sometimes|boolean',
            'ctrl_fullscreen' => 'sometimes|boolean',
            'btn_mostrar' => 'sometimes|boolean',
            'texto_previsualizacion' => 'nullable|string|max:255',
            'prev_automatica' => 'sometimes|boolean',
            'animacion' => 'sometimes|string',
        ]);

        // 2. Lógica para manejar la miniatura por separado.
        if ($request->input('delete_thumbnail') == '1') {
            if ($videomarketing->custom_thumbnail) {
                Storage::disk('public')->delete($videomarketing->custom_thumbnail);
                $videomarketing->custom_thumbnail = null;
            }
        } elseif ($request->hasFile('custom_thumbnail')) {
            if ($videomarketing->custom_thumbnail) {
                Storage::disk('public')->delete($videomarketing->custom_thumbnail);
            }
            $path = $request->file('custom_thumbnail')->store('thumbnails', 'public');
            $videomarketing->custom_thumbnail = $path;
        }

        // 3. Preparamos los datos booleanos (checkboxes).
        $booleanFields = ['ctrl_barra_progreso', 'ctrl_ajustes', 'ctrl_volumen', 'ctrl_fullscreen', 'btn_mostrar', 'prev_automatica'];
        foreach ($booleanFields as $field) {
            if ($request->has($field)) {
                $validatedData[$field] = $request->input($field);
            } else {
                 // Si el checkbox no se envió, significa que está desactivado (valor 0).
                $validatedData[$field] = 0;
            }
        }

        // 4. Actualizamos el modelo SOLO con los datos validados y preparados.
        $videomarketing->update($validatedData);
        $videomarketing->save(); // Guardamos los cambios de la miniatura

        // 5. Invalidamos el caché.
        Cache::forget('reproductor-' . $videomarketing->id);

        // 6. Devolvemos la respuesta JSON de éxito.
        return response()->json([
            'success' => true,
            'message' => '¡Ajustes guardados correctamente!',
            'updated_data' => $videomarketing->fresh()
        ]);
    }

    /**
     * Elimina un reproductor.
     */
    public function destroy(Reproductor $videomarketing)
    {
        if ($videomarketing->custom_thumbnail) {
            Storage::disk('public')->delete($videomarketing->custom_thumbnail);
        }
        $videomarketing->delete();
        return redirect()->route('videomarketing.index')->with('success', 'Reproductor eliminado.');
    }

    // --- MÉTODOS PARA LAS PESTAÑAS AJAX ---

    public function ajaxSeo(Reproductor $videomarketing)
    {
        return view('editor.partials.seo', ['videomarketing' => $videomarketing]);
    }

    public function ajaxIntegracion(Reproductor $videomarketing)
    {
        return view('editor.partials.integracion', ['videomarketing' => $videomarketing]);
    }

    public function ajaxCapitulos(Reproductor $videomarketing)
    {
        return view('editor.partials.capitulos', ['videomarketing' => $videomarketing]);
    }

    public function ajaxAjustes(Reproductor $videomarketing)
    {
        return view('editor.partials.ajustes', ['videomarketing' => $videomarketing]);
    }
}
