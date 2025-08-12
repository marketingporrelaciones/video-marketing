<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Reproductor extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla que este modelo representa.
     */
    protected $table = 'reproductores';

    /**
     * Permite que TODAS las columnas se puedan rellenar masivamente.
     * Esto es seguro porque validaremos los datos en el Controlador.
     * Es la clave para que el user_id se guarde automáticamente.
     */
    protected $guarded = [];

    /**
     * Esta función se ejecuta automáticamente cuando se crea un nuevo reproductor.
     * Su única misión es generar un 'slug' (URL amigable) único si no se ha proporcionado uno.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reproductor) {
            if (empty($reproductor->slug)) {
                $reproductor->slug = Str::random(8);
            }
        });
    }
}
