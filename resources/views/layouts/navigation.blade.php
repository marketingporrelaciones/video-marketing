<aside class="app-sidebar">
    <div class="sidebar-header">
        <h2 class="sidebar-title">Player Pro</h2>
    </div>
    <nav class="sidebar-nav">
        <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">
            <i data-feather="home"></i>
            <span class="nav-text">Panel</span>
        </a>

        <a href="{{ route('videomarketing.index') }}" class="nav-link {{ request()->routeIs('videomarketing.*') ? 'active' : '' }}">
            <i data-feather="video"></i>
            <span class="nav-text">Video Marketing</span>
        </a>

        {{-- Descomenta estos enlaces cuando migremos los otros módulos --}}
        <a href="#" class="nav-link">
            <i data-feather="book-open"></i>
            <span class="nav-text">Cursos</span>
        </a>
        <a href="#" class="nav-link">
            <i data-feather="bar-chart-2"></i>
            <span class="nav-text">Analíticas</span>
        </a>
        <a href="#" class="nav-link">
            <i data-feather="mail"></i>
            <span class="nav-text">Correos</span>
        </a>
    </nav>
</aside>
