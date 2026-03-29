import Phaser from 'phaser';
import { ModoInput } from '../entidades/jugador/ControlJugador';
import { SistemaEventos } from '@sistemas/SistemaEventos';

/**
 * HUD táctil minimalista y moderno.
 * Muestra zonas de control semi-transparentes solo cuando el modo 'touch' está activo.
 */
export class VisualTouchHUD {
    private escena: Phaser.Scene;
    private contenedor: Phaser.GameObjects.Container;
    private zonaMov: Phaser.GameObjects.Rectangle;
    private zonaSalto: Phaser.GameObjects.Rectangle;
    private visible: boolean = false;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
        const { width, height } = escena.scale;

        this.contenedor = escena.add.container(0, 0);
        this.contenedor.setScrollFactor(0);
        this.contenedor.setDepth(1000); // Siempre encima de todo

        // Zona Izquierda: Movimiento (Sutil indicador)
        this.zonaMov = escena.add.rectangle(0, 0, width / 2, height, 0xffffff, 0.05);
        this.zonaMov.setOrigin(0, 0);
        
        // Zona Derecha: Acción/Salto
        this.zonaSalto = escena.add.rectangle(width / 2, 0, width / 2, height, 0x00ffff, 0.05);
        this.zonaSalto.setOrigin(0, 0);

        this.contenedor.add([this.zonaMov, this.zonaSalto]);
        this.contenedor.setAlpha(0); // Empezar oculto

        // Registrar escucha de cambio de modo (Uso de Bus Global)
        const bus = SistemaEventos.obtener();
        bus.on('input:modo-cambio', this.manejarCambioModo, this);
        bus.on('input:flash-zona', this.flashZona, this);
        
        // Limpieza
        this.escena.events.once('shutdown', () => {
            bus.off('input:modo-cambio', this.manejarCambioModo, this);
            bus.off('input:flash-zona', this.flashZona, this);
        });
    }

    private manejarCambioModo(modo: ModoInput): void {
        const esTouch = modo === 'touch';
        if (this.visible === esTouch) return;
        
        this.visible = esTouch;
        
        // Animación Fade suave Senior con easing
        this.escena.tweens.add({
            targets: this.contenedor,
            alpha: esTouch ? 1 : 0,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * Feedback visual rápido cuando se toca una zona.
     */
    public flashZona(lado: 'izq' | 'der'): void {
        if (!this.visible) return;
        
        const target = lado === 'izq' ? this.zonaMov : this.zonaSalto;
        
        this.escena.tweens.add({
            targets: target,
            fillAlpha: 0.2,
            duration: 100,
            yoyo: true
        });
    }
}
