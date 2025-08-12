<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // ===== REEMPLAZA CON ESTE CÓDIGO =====

        // Después de que el usuario inicie sesión, revisamos su rol.
        if ($request->user()->role === 'admin') {
            // Si es 'admin', lo enviamos a la ruta del panel de administrador.
            return redirect()->route('admin.dashboard');
        }

        // Si no es 'admin', lo enviamos al panel de cliente normal (usando tu sintaxis original).
        return redirect()->intended(route('dashboard', absolute: false));

        // ===== FIN DEL CÓDIGO DE REEMPLAZO =====
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
