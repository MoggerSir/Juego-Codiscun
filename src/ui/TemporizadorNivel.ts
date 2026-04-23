import Phaser from 'phaser';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';
import { EstadoSession, EstadoJuego } from '@sistemas/EstadoSession';
import { ASSETS } from '@constantes/constantes-assets';
import { CONFIG_AUDIO } from '@constantes/config-audio';

export enum EstadoTimer {
    ACTIVO,
    DETENIDO,
    AGOTADO
}

/**
 * Controlador Lógico del Tiempo (Senior High-Precision Pattern).
 * Evita el drift acumulado usando delta time y protege el ciclo de vida.
 */
export class TemporizadorNivel {
    private escena: Phaser.Scene;
    private tiempoRestante: number;
    private estado: EstadoTimer = EstadoTimer.DETENIDO;
    private acumuladorMS: number = 0;
    private ultimoSegundoEmitido: number;
    private alertaEmitida: boolean = false;

    constructor(escena: Phaser.Scene, segundosIniciales: number) {
        this.escena = escena;
        this.tiempoRestante = segundosIniciales;
        this.ultimoSegundoEmitido = Math.ceil(segundosIniciales);

        // Registro en el update de la escena para precisión milimétrica
        this.escena.events.on('update', this.update, this);
        
        // Limpieza automática preventiva
        this.escena.events.once('shutdown', this.destruir, this);
    }

    public iniciar(): void {
        if (this.tiempoRestante <= 0) return;
        this.estado = EstadoTimer.ACTIVO;
        console.log(`[Timer] Iniciado con ${this.tiempoRestante}s`);
    }

    public detener(): void {
        this.estado = EstadoTimer.DETENIDO;
    }

    private update(_time: number, delta: number): void {
        if (this.estado !== EstadoTimer.ACTIVO) return;

        // 1. Guard Clause Global: Solo descontar si el juego está en marcha
        if (EstadoSession.obtener().getEstado() !== EstadoJuego.JUGANDO) {
            return;
        }

        // 2. Acumulación de alta precisión (Anti-Drift)
        this.acumuladorMS += delta;

        if (this.acumuladorMS >= 1000) {
            this.tiempoRestante -= 1;
            this.acumuladorMS -= 1000;

            // Emitir evento de cambio cada segundo entero
            const segundoActual = Math.ceil(this.tiempoRestante);
            if (segundoActual !== this.ultimoSegundoEmitido) {
                this.ultimoSegundoEmitido = segundoActual;
                this.emitirCambio();

                // Notificación sonora de "Hurry Up" a los 60 segundos
                if (segundoActual === 60 && !this.alertaEmitida) {
                    this.alertaEmitida = true;
                    if (this.escena.cache.audio.exists(ASSETS.SFX_TIEMPO_ALERTA)) {
                        this.escena.sound.play(ASSETS.SFX_TIEMPO_ALERTA, { 
                            volume: CONFIG_AUDIO.obtenerVolumen(ASSETS.SFX_TIEMPO_ALERTA) 
                        });
                    }
                }
            }

            // 3. Control de Agotamiento (Atomic Guard)
            if (this.tiempoRestante <= 0) {
                this.tiempoRestante = 0;
                this.estado = EstadoTimer.AGOTADO;
                this.finalizar();
            }
        }
    }

    private emitirCambio(): void {
        SistemaEventos.obtener().emit(EVENTOS.TIEMPO_CAMBIO, {
            segundos: Math.max(0, this.ultimoSegundoEmitido)
        });
    }

    private finalizar(): void {
        console.warn("[Timer] ¡TIEMPO AGOTADO!");
        this.emitirCambio(); // Asegurar que el HUD llegue a 0
        SistemaEventos.obtener().emit(EVENTOS.TIEMPO_AGOTADO);
    }

    public obtenerTiempoRestante(): number {
        return Math.max(0, this.tiempoRestante);
    }

    public destruir(): void {
        this.estado = EstadoTimer.DETENIDO;
        this.escena.events.off('update', this.update, this);
        console.log("[Timer] Recolectado por el colector de basura.");
    }
}
