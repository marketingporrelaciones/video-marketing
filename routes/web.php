<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ReproductorController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// web.php
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Para "Video Marketing" (Reproductores) - Un CRUD completo
    Route::resource('videomarketing', ReproductorController::class);

    // Grupo para las pestañas del editor (ya está protegido por el 'auth' de arriba)
    Route::prefix('reproductor/{videomarketing}/ajax')->name('reproductor.ajax.')->group(function () {
        Route::get('/seo', [ReproductorController::class, 'ajaxSeo'])->name('seo');
        Route::get('/integracion', [ReproductorController::class, 'ajaxIntegracion'])->name('integracion');
        Route::get('/capitulos', [ReproductorController::class, 'ajaxCapitulos'])->name('capitulos');
        Route::get('/ajustes', [ReproductorController::class, 'ajaxAjustes'])->name('ajustes');
    });
});

require __DIR__.'/auth.php';

// AÑADE ESTE CÓDIGO NUEVO
Route::middleware(['auth', 'isAdmin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('admin.dashboard');
});

