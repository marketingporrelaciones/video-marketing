<x-app-layout>
    {{-- ========= 1. CONTENIDO PRINCIPAL DE LA PÁGINA ========= --}}
    <div class="page-header">
        <h1>Mis Reproductores</h1>
        <button onclick="openModal()" class="btn-primary">Crear Nuevo Reproductor</button>
    </div>

    <div class="player-grid">
        {{-- Si la colección de reproductores NO está vacía, los mostramos --}}
        @if($reproductores->isNotEmpty())
            {{-- Recorremos cada reproductor con un bucle --}}
            @foreach ($reproductores as $reproductor)
                <div class="player-card" data-id="{{ $reproductor->id }}">
                    <a href="#" class="card-thumbnail">
                        {{-- Usamos la miniatura personalizada o la de YouTube por defecto --}}
                        <img src="{{ $reproductor->custom_thumbnail ? asset('storage/' . $reproductor->custom_thumbnail) : 'https://i.ytimg.com/vi/' . $reproductor->video_id . '/mqdefault.jpg' }}" alt="Miniatura">
                    </a>
                    <div class="card-body">
                        <h3 class="card-title">{{ $reproductor->title }}</h3>
                        <p class="card-video-id">ID: {{ $reproductor->video_id }}</p>
                    </div>
                    <div class="card-footer">
                        <a href="{{ route('videomarketing.edit', $reproductor) }}" class="card-action-btn edit-btn">Editar</a>

                        {{-- AÑADE ESTE ENLACE PARA EL BOTÓN CLONAR --}}
                        <a href="#" class="card-action-btn clone-btn">Clonar</a>

                        {{-- Formulario para eliminar de forma segura --}}
                        <form action="{{ route('videomarketing.destroy', $reproductor) }}" method="POST" onsubmit="return confirm('¿Estás seguro?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="card-action-btn delete-btn">Eliminar</button>
                        </form>
                    </div>
                </div>
            @endforeach
        @else
            {{-- Si la colección está vacía, mostramos un mensaje --}}
            <p class="empty-state">No has creado ningún reproductor todavía.</p>
        @endif
    </div>

    {{-- ========= 2. EL FORMULARIO EMERGENTE (MODAL) ========= --}}
    <div id="newVideoModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <span class="close-modal-btn" onclick="closeModal()">×</span>
            <h2>Añadir Nuevo Video</h2>
            <p>Pega una URL de YouTube para empezar.</p>

            <form action="{{ route('videomarketing.store') }}" method="POST">
                @csrf
                <label for="youtube_url">URL de YouTube</label>
                <input type="text" id="youtube_url" name="youtube_url" required>
                @error('youtube_url')
                    <div class="error-message">{{ $message }}</div>
                @enderror
                <button type="submit" class="btn-primary">Crear y Editar</button>
            </form>
        </div>
    </div>

    {{-- Scripts para manejar el modal --}}
    @push('scripts')
    <script>
        function openModal() { document.getElementById('newVideoModal').style.display = 'flex'; }
        function closeModal() { document.getElementById('newVideoModal').style.display = 'none'; }
    </script>
    @endpush
</x-app-layout>
