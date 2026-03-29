import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { EstadoSession } from "@sistemas/EstadoSession";
import "../ui/game-ui.css";

export class EscenaGameOver extends Phaser.Scene {
  private puntosFinal: number = 0;
  private idNivelActual: string = "nivel-1";
  private domUI!: Phaser.GameObjects.DOMElement;

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
      if (this.domUI) this.domUI.destroy();
    });
  }

  private createDOMUI(): void {
    const html = `
      <div class="ui-screen" style="background: #1a0000;">
        <div class="glass-panel" style="width: 500px; text-align: center; border-color: var(--neon-red); background: rgba(0,0,0,0.8);">
          <h1 style="color: var(--neon-red); font-size: 1.8rem; text-shadow: 6px 6px 0px #000; margin-bottom: 2rem; animation: textFlicker 0.2s infinite alternate;">GAME OVER</h1>
          
          <div style="margin: 3rem 0; color: #fff;">
            <p style="font-size: 0.6rem; color: #888; margin-bottom: 1rem;">PLAYER 1 SCORE</p>
            <div style="font-size: 1.5rem; color: #fff;">${this.puntosFinal.toLocaleString().padStart(7, '0')}</div>
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
    this.domUI = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(html);

    // Eventos
    const btnReintentar = this.domUI.getChildByID("btn-reintentar") as HTMLElement;
    const btnSelector = this.domUI.getChildByID("btn-selector") as HTMLElement;

    btnReintentar.onclick = () => {
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.JUEGO, { idNivel: this.idNivelActual }); 
    };

    btnSelector.onclick = () => {
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.NIVELES);
    };

    // Soporte para tecla Espacio (Reintentar nivel actual)
    this.input.keyboard?.once("keydown-SPACE", () => {
      EstadoSession.obtener().resetTotal();
      this.scene.start(ESCENAS.JUEGO, { idNivel: this.idNivelActual });
    });
  }
}
