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
    private iconoIzq!: Phaser.GameObjects.Container;
    private iconoDer!: Phaser.GameObjects.Container;
    private iconoSalto!: Phaser.GameObjects.Container;
    private visible: boolean = false;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
        const { width, height } = escena.scale;

        this.contenedor = escena.add.container(0, 0);
        this.contenedor.setScrollFactor(0);
        this.contenedor.setDepth(1000); // Siempre encima de todo

        // Fondo de Zonas (Sutileza extrema pero visible)
        this.zonaMov = escena.add.rectangle(0, 0, width / 2, height, 0x000000, 0.05); // Ligeramente oscuro para dar contraste
        this.zonaMov.setOrigin(0, 0);
        this.zonaSalto = escena.add.rectangle(width / 2, 0, width / 2, height, 0x00ffff, 0.05);
        this.zonaSalto.setOrigin(0, 0);

        // --- ICONOS DE CRISTAL ---
        const paddingBottom = height * 0.25; // Subimos un poco más para ergonomía
        const iconY = height - paddingBottom;
        const iconSize = height * 0.15; // Proporcional al alto (Aprox 90px en 600h)

        // 1. Icono Izquierda (Puntero en 11% aprox)
        this.iconoIzq = this.crearIconoFlecha(width * 0.11, iconY, iconSize, true);
        
        // 2. Icono Derecha (Puntero en 39% aprox)
        this.iconoDer = this.crearIconoFlecha(width * 0.39, iconY, iconSize, false);

        // 3. Icono Salto (Puntero en 75% aprox)
        this.iconoSalto = this.crearIconoSalto(width * 0.75, iconY, iconSize + 10);

        this.contenedor.add([this.zonaMov, this.zonaSalto, this.iconoIzq, this.iconoDer, this.iconoSalto]);
        // Lógica de visibilidad inicial Pro: Si el dispositivo es touch, empezamos visibles
        const inicialmenteTouch = navigator.maxTouchPoints > 0;
        this.visible = inicialmenteTouch;
        this.contenedor.setAlpha(inicialmenteTouch ? 1 : 0);
        
        console.log(`[VisualTouchHUD] Inicializado. Modo inicial: ${inicialmenteTouch ? 'touch' : 'PC'}`);

        // Registrar escucha de cambio de modo (Uso de Bus Global)
        const bus = SistemaEventos.obtener();
        bus.on('input:modo-cambio', this.manejarCambioModo, this);
        bus.on('input:flash-zona', this.flashInput, this);
        
        // Limpieza
        this.escena.events.once('shutdown', () => {
            bus.off('input:modo-cambio', this.manejarCambioModo, this);
            bus.off('input:flash-zona', this.flashInput, this);
        });
    }

    private crearIconoFlecha(x: number, y: number, size: number, invertida: boolean): Phaser.GameObjects.Container {
        const container = this.escena.add.container(x, y);
        const g = this.escena.add.graphics();
        
        // Círculo de fondo translúcido (Glassmorphism)
        g.fillStyle(0xffffff, 0.1);
        g.fillCircle(0, 0, size / 2);
        g.lineStyle(2, 0xffffff, 0.3);
        g.strokeCircle(0, 0, size / 2);

        // Triángulo (Flecha)
        g.fillStyle(0xffffff, 0.8);
        const s = size * 0.4;
        const pts = invertida 
            ? [{ x: -s/2, y: 0 }, { x: s/2, y: -s/2 }, { x: s/2, y: s/2 }]
            : [{ x: s/2, y: 0 }, { x: -s/2, y: -s/2 }, { x: -s/2, y: s/2 }];
        
        g.fillPoints(pts, true);
        
        container.add(g);
        return container;
    }

    private crearIconoSalto(x: number, y: number, size: number): Phaser.GameObjects.Container {
        const container = this.escena.add.container(x, y);
        const g = this.escena.add.graphics();
        
        // Círculo de fondo cian (Glassmorphism)
        g.fillStyle(0x00ffff, 0.15);
        g.fillCircle(0, 0, size / 2);
        g.lineStyle(3, 0x00ffff, 0.4);
        g.strokeCircle(0, 0, size / 2);

        // Icono de Salto (Flecha arriba)
        g.fillStyle(0xffffff, 0.9);
        const s = size * 0.35;
        g.fillPoints([{ x: 0, y: -s/2 }, { x: -s/2, y: s/2 }, { x: s/2, y: s/2 }], true);
        
        container.add(g);
        return container;
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
    public flashInput(lado: 'mov_izq' | 'mov_der' | 'jump'): void {
        if (!this.visible) return;
        
        // Mapeo inteligente de eventos a iconos
        let target: Phaser.GameObjects.Container | null = null;

        switch(lado) {
            case 'mov_izq': target = this.iconoIzq; break;
            case 'mov_der': target = this.iconoDer; break;
            case 'jump':    target = this.iconoSalto; break;
        }
        
        if (target) {
            this.animarPulsacion(target);
        }
    }

    private animarPulsacion(target: Phaser.GameObjects.Container): void {
        this.escena.tweens.add({
            targets: target,
            scale: 0.85,
            alpha: 1,
            duration: 80,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Reajusta dinámicamente el HUD táctil al cambiar el tamaño de la pantalla.
     */
    public reposicionar(width: number, height: number): void {
        const paddingBottom = height * 0.25;
        const iconY = height - paddingBottom;
        const iconSize = height * 0.15;

        // 1. Reajustar Zonas de Interacción
        this.zonaMov.setSize(width / 2, height);
        this.zonaSalto.setPosition(width / 2, 0);
        this.zonaSalto.setSize(width / 2, height);

        // 2. Reposicionar Iconos (D-Pad Izquierda)
        this.iconoIzq.setPosition(width * 0.11, iconY);
        this.iconoDer.setPosition(width * 0.39, iconY);

        // 3. Reposicionar Icono de Salto (Derecha)
        this.iconoSalto.setPosition(width * 0.75, iconY);

        console.log(`[VisualTouchHUD] HUD Reposicionado: ${width}x${height}`);
    }
}
