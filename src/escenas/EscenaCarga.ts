import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { ESCENAS } from "@constantes/constantes-escenas";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { RegistryManager } from "../registry/RegistryManager";
import "../ui/game-ui.css"; // Estilos globales

export class EscenaCarga extends Phaser.Scene {
  private uiElement: HTMLElement | null = null;

  constructor() {
    super({ key: ESCENAS.CARGA });
  }

  preload(): void {
    // 1. Mostrar Pantalla de Carga Premium (DOM)
    this.createDOMLoader();

    // 2. Generar placeholders (Tileset, Jugador, Moneda, etc.)
    // Mantenemos la lógica de texturas dinámicas para no romper el renderizado
    this.generarTexturasBase();

    // 3. Centralización: Precarga modular vía Registry
    RegistryManager.preloadAll(this);

    // 4. Precarga dinámica de niveles
    GestorNiveles.obtenerTodos().forEach((config) => {
      this.load.tilemapTiledJSON(config.nombreMapa, config.rutaMapa);
    });

    // 5. Sincronización del DOM con Phaser Load Event
    this.load.on("progress", (progreso: number) => {
      if (!this.uiElement) return;
      const progressBar = this.uiElement.querySelector(
        "#progress-bar",
      ) as HTMLElement;
      const progressText = this.uiElement.querySelector(
        "#progress-text",
      ) as HTMLElement;
      if (progressBar) progressBar.style.width = `${progreso * 100}%`;
      if (progressText)
        progressText.innerText = `${Math.round(progreso * 100)}%`;
    });
  }

  create(): void {
    // Registro de Spritesheets desde Texturas generadas (Placeholders)
    this.registrarSpritesheets();

    // Centralización: Creación de animaciones modular (Incluye Moneda, Jugador, Enemigos)
    RegistryManager.createAnimations(this);

    // Pequeño delay para dejar que la animación de carga se complete visualmente
    this.time.delayedCall(500, () => {
      this.limpiarUI();
      this.scene.start(ESCENAS.NIVELES);
    });

    // Cleanup del DOM al salir
    this.events.once("shutdown", () => {
      this.limpiarUI();
    });
  }

  private createDOMLoader(): void {
    const html = `
      <div id="loader-screen" class="ui-screen">
        <div class="glass-panel" style="width: 90%; max-width: 500px; text-align: center; border-color: var(--neon-cyan);">
          <h1 style="font-size: clamp(1rem, 5vw, 1.5rem); color: #fff; margin-bottom: clamp(1.5rem, 5vh, 2.5rem); text-shadow: 4px 4px 0px #000;">Nintendo <span style="color: var(--neon-cyan);">Empresa</span></h1>
          
          <div style="border: 4px solid #fff; padding: 4px; background: #000; margin-bottom: 1.5rem; position: relative; height: 30px;">
            <div id="progress-bar" style="width: 0%; height: 100%; background: var(--neon-cyan); transition: width 0.1s steps(10);"></div>
          </div>
          
          <p id="progress-text" style="font-size: 0.8rem; letter-spacing: 2px; color: #fff;">LOAD 0%</p>
          
          <div style="margin-top: 3rem; font-size: 0.6rem; color: #555; text-transform: uppercase;">
             &copy; 2024 MARIO EMPRESA LTD.<br>
             LICENSED BY CODICUN
          </div>
        </div>
      </div>
    `;

    // Inyección Nativa
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html.trim();
    this.uiElement = tempDiv.firstChild as HTMLElement;
    document.body.appendChild(this.uiElement);
  }

  private limpiarUI(): void {
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement);
      this.uiElement = null;
    }
  }

  private generarTexturasBase(): void {
    // 1. Fallback Maestro (Spritesheet de 8 frames para animaciones rotas)
    const canvaFallback = this.textures.createCanvas('__FALLBACK_MASTER__', 64 * 8, 64);
    if (canvaFallback) {
      const ctx = canvaFallback.getContext();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ff00ff' : '#000000'; // Magenta/Negro (Clásico missing)
        ctx.fillRect(i * 64, 0, 64, 64);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(i * 64, 0, 64, 64);
        // Añadir el frame manualmente a la textura de Phaser
        canvaFallback.add(i, 0, i * 64, 0, 64, 64);
      }
      canvaFallback.refresh();
    }

    // Tileset Principal (Ajustado a 32x32 real para evitar warnings)
    const gTileset = this.make.graphics({ x: 0, y: 0 });
    gTileset.fillStyle(0x8b4513).fillRect(0, 0, 32, 32);
    gTileset.generateTexture(ASSETS.TILESET_PRINCIPAL, 32, 32);
    gTileset.destroy();

    // Bandera
    const gBandera = this.make.graphics({ x: 0, y: 0 });
    gBandera.fillStyle(0xffffff).fillRect(14, 0, 4, 64).fillStyle(0xff0000).fillRect(14, 0, 18, 20);
    gBandera.generateTexture(ASSETS.BANDERA_SPRITE, 32, 64);
    gBandera.destroy();
  }

  private registrarSpritesheets(): void {
    // Ya no es necesario registrar manualmente ya que usamos CanvasTexture con frames definidos
  }
}
