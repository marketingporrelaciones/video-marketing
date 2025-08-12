<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Video Marketing') }}
            </h2>
            <a href="{{ route('videomarketing.create') }}" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150">
                {{ __('Crear Nuevo Video') }}
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">

                    <!-- Mensajes de éxito o error -->
                    @if (session('success'))
                        <div class="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                            {{ session('success') }}
                        </div>
                    @endif

                    <!-- Tabla de Reproductores -->
                    <div class="overflow-x-auto relative shadow-md sm:rounded-lg">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="py-3 px-6">
                                        Título del Video
                                    </th>
                                    <th scope="col" class="py-3 px-6">
                                        Fecha de Creación
                                    </th>
                                    <th scope="col" class="py-3 px-6 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($reproductores as $reproductor)
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {{ $reproductor->title }}
                                        </th>
                                        <td class="py-4 px-6">
                                            {{ $reproductor->created_at->format('d/m/Y H:i') }}
                                        </td>
                                        <td class="py-4 px-6 text-right space-x-2">
                                            <!-- Botón Editar -->
                                            <a href="{{ route('videomarketing.edit', $reproductor->id) }}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</a>

                                            <!-- Botón Clonar (usa un formulario para la seguridad) -->
                                            <form action="{{ route('videomarketing.clone', $reproductor->id) }}" method="POST" class="inline-block" onsubmit="return confirm('¿Estás seguro de que quieres clonar este video?');">
                                                @csrf
                                                <button type="submit" class="font-medium text-green-600 dark:text-green-500 hover:underline">Clonar</button>
                                            </form>

                                            <!-- Botón Eliminar (usa un formulario para la seguridad) -->
                                            <form action="{{ route('videomarketing.destroy', $reproductor->id) }}" method="POST" class="inline-block" onsubmit="return confirm('¿Estás seguro de que quieres eliminar este video? Esta acción no se puede deshacer.');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="font-medium text-red-600 dark:text-red-500 hover:underline">Eliminar</button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td colspan="3" class="py-4 px-6 text-center">
                                            No se encontraron videos. ¡Crea uno nuevo para empezar!
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
