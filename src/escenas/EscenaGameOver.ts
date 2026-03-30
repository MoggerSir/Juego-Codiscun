import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { EstadoSession } from "@sistemas/EstadoSession";
import "../ui/game-ui.css";

export class EscenaGameOver extends Phaser.Scene {
  private puntosFinal: number = 0;
  private idNivelActual: string = "nivel-1";
  private uiElement: HTMLElement | null = null;

  constructor() {
    super({ key: ESCENAS.GAME_OVER });
  }

  init(data: { puntos: number; idNivel: string }): void {
    this.puntosFinal = data.puntos || 0;
    this.idNivelActual = data.idNivel || "nivel-1";
  }

  create(): void {
    // 1. Fondo Oscuro con tinte rojo (Phaser)
    this.cameras.main.setBackgroundColor("#1a0505");

    // 2. Crear UI DOM
    this.createDOMUI();

    // 3. Cleanup
    this.events.once("shutdown", () => {
      this.limpiarUI();
    });

    // 4. Soporte para tecla Espacio (Reintentar nivel actual)
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.limpiarUI();
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.JUEGO, { idNivel: this.idNivelActual });
    });
  }

  private createDOMUI(): void {
    const html = `
      <div id="gameover-screen" class="ui-screen" style="background: rgba(26, 0, 0, 0.9);">
        <div class="glass-panel" style="width: 90%; max-width: 500px; text-align: center; border-color: var(--neon-red); background: rgba(0,0,0,0.8);">
          <h1 style="color: var(--neon-red); font-size: clamp(1.2rem, 6vw, 1.8rem); text-shadow: 4px 4px 0px #000; margin-bottom: 2rem; animation: textFlicker 0.2s infinite alternate;">GAME OVER</h1>
          
          <div style="margin: 2rem 0; color: #fff;">
            <p style="font-size: 0.6rem; color: #888; margin-bottom: 0.5rem;">PLAYER 1 SCORE</p>
            <div style="font-size: clamp(1rem, 5vw, 1.5rem); color: #fff;">${this.puntosFinal.toLocaleString().padStart(7, '0')}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button id="btn-reintentar" class="btn-neon" style="background: var(--neon-red); color: #fff;">REINTENTAR</button>
            <button id="btn-selector" class="btn-neon" style="font-size: 0.6rem; opacity: 0.7;">MAPA DEL MUNDO</button>
          </div>

          <p style="margin-top: 3rem; font-size: 0.5rem; color: #444; animation: textFlash 1s infinite;">PRESS SPACE TO RETRY</p>
        </div>

        <style>
          @keyframes textFlicker {
            0% { opacity: 1; filter: contrast(1); }
            100% { opacity: 0.9; filter: contrast(1.5) brightness(1.2); }
          }
        </style>
      </div>
    `;

    // Inyección Nativa para CENTRADO PERFECTO
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    this.uiElement = tempDiv.firstChild as HTMLElement;
    document.body.appendChild(this.uiElement);

    // Eventos
    const btnReintentar = this.uiElement.querySelector("#btn-reintentar") as HTMLElement;
    const btnSelector = this.uiElement.querySelector("#btn-selector") as HTMLElement;

    btnReintentar.onclick = () => {
      this.limpiarUI();
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.JUEGO, { idNivel: this.idNivelActual }); 
    };

    btnSelector.onclick = () => {
      this.limpiarUI();
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.NIVELES);
    };
  }

  private limpiarUI(): void {
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement);
      this.uiElement = null;
    }
  }
}
