<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReproductorController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Aquí es donde puedes registrar las rutas web para tu aplicación.
| Este archivo es cargado por el RouteServiceProvider.
|
*/

// --- RUTA PÚBLICA PRINCIPAL ---
// Esta es la página de bienvenida que ven los visitantes.
Route::get('/', function () {
    return view('welcome');
});


// --- RUTAS DE AUTENTICACIÓN (LOGIN, REGISTRO, ETC.) ---
// Laravel se encarga de estas rutas automáticamente.
// Esto asume que tienes el sistema de autenticación de Laravel instalado (Breeze, Jetstream, etc.)
// Si no, lo podemos añadir más adelante.
// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth'])->name('dashboard');

// require __DIR__.'/auth.php';


// --- RUTAS PROTEGIDAS (SOLO PARA USUARIOS LOGUEADOS) ---
// Usamos un grupo de rutas con el middleware 'auth' para proteger
// todas las rutas de administración de videos. Nadie podrá acceder
// a ellas sin haber iniciado sesión.
Route::middleware(['auth'])->group(function () {

    // ✅ RUTA DE RECURSO PARA EL CRUD DE VIDEOMARKETING
    // Esta sola línea de código crea automáticamente las siguientes 7 rutas:
    //
    // - GET    /videomarketing             (index)   -> Ver todos los videos
    // - GET    /videomarketing/create      (create)  -> Mostrar formulario para crear
    // - POST   /videomarketing             (store)   -> Guardar el nuevo video
    // - GET    /videomarketing/{video}     (show)    -> Ver un video (lo usaremos para la vista pública)
    // - GET    /videomarketing/{video}/edit(edit)    -> Mostrar el editor para un video
    // - PUT/PATCH /videomarketing/{video}  (update)  -> Actualizar un video existente
    // - DELETE /videomarketing/{video}     (destroy) -> Eliminar un video
    //
    // Laravel es lo suficientemente inteligente como para pasar el {video} correcto a cada método.
    Route::resource('videomarketing', ReproductorController::class);

    // ✅ RUTA PERSONALIZADA PARA CLONAR
    // Como "clonar" no es una acción estándar de un CRUD, creamos una ruta propia.
    // Apuntará a un nuevo método llamado 'clone' en nuestro ReproductorController.
    Route::post('/videomarketing/{video}/clone', [ReproductorController::class, 'clone'])->name('videomarketing.clone');

});


// --- RUTA PÚBLICA PARA EL REPRODUCTOR ---
// Esta es la ruta que compartirás con tus usuarios para que vean el video.
// No lleva el middleware 'auth' para que cualquiera pueda acceder.
// La renombramos a 'play' para que sea más amigable.
// Por ejemplo: tudominio.com/play/nombre-amigable-del-video
Route::get('/play/{slug}', [ReproductorController::class, 'publicShow'])->name('videomarketing.public.show');

