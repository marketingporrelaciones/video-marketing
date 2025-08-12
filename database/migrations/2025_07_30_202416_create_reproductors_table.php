<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('reproductores', function (Blueprint $table) {
        // Columnas básicas
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('title')->default('Nuevo Video (Editar Título)');
        $table->string('slug')->unique();
        $table->string('video_id');

        // Configuración del reproductor
        $table->text('ab_test_config')->nullable();
        $table->boolean('password_enabled')->default(false);
        $table->string('video_password')->nullable();
        $table->string('color_principal')->default('#0084ff');
        $table->string('color_controles')->default('#ffffff');
        $table->string('color_barras')->default('#0084ff');
        $table->boolean('ctrl_barra_progreso')->default(true);
        $table->boolean('ctrl_ajustes')->default(true);
        $table->boolean('ctrl_volumen')->default(true);
        $table->boolean('ctrl_fullscreen')->default(true);
        $table->boolean('btn_mostrar')->default(true);
        $table->string('texto_previsualizacion')->nullable();
        $table->boolean('prev_automatica')->default(false);
        $table->string('animacion')->default('bounce');
        $table->string('custom_thumbnail')->nullable();

        // SEO
        $table->string('seo_title')->nullable();
        $table->text('seo_description')->nullable();
        $table->string('focus_keyphrase')->nullable();
        $table->string('video_duration', 8)->nullable();
        $table->boolean('meta_robots_index')->default(true);
        $table->boolean('meta_robots_follow')->default(true);
        $table->string('canonical_url')->nullable();
        $table->string('og_title')->nullable();
        $table->text('og_description')->nullable();
        $table->string('og_image')->nullable();

        // Integración y Leads
        $table->boolean('lead_form_enabled')->default(false);
        $table->string('lead_form_headline')->nullable();
        $table->text('lead_form_description')->nullable();
        $table->string('lead_form_button_text')->nullable();
        $table->integer('lead_form_timestamp')->default(0);
        $table->boolean('lead_form_allow_skip')->default(false);
        $table->string('webhook_url')->nullable();
        $table->string('facebook_pixel_id')->nullable();
        $table->boolean('cta_externo_enabled')->default(false);
        $table->string('cta_externo_text')->nullable();
        $table->string('cta_externo_url')->nullable();
        $table->string('cta_externo_bg_color')->nullable();
        $table->string('cta_externo_text_color')->nullable();
        $table->integer('cta_externo_timestamp')->default(0);

        // Analíticas y Timestamps
        $table->integer('view_count')->default(0);
        $table->timestamps(); // Esto crea 'created_at' y 'updated_at'
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reproductors');
    }
};
