import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { GestorNiveles } from "@niveles/GestorNiveles";
import type { DatosFinNivel } from "@tipos/tipos-nivel";
import "../ui/game-ui.css";

export class EscenaVictoria extends Phaser.Scene {
  private datosFinNivel!: DatosFinNivel;
  private domUI!: Phaser.GameObjects.DOMElement;

  constructor() {
    super({ key: ESCENAS.VICTORIA });
  }

  init(datos: DatosFinNivel): void {
    this.datosFinNivel = datos || {
      idNivel: "nivel-1",
      puntos: 0,
      monedas: 0,
      tiempoRestante: 0,
    };
  }

  create(): void {
    // 1. Fondo (Podemos mantener un fondo sólido en Phaser)
    this.cameras.main.setBackgroundColor("#0a0a14");

    // 2. Crear UI DOM
    this.createDOMUI();

    // 3. Cleanup
    this.events.once("shutdown", () => {
      if (this.domUI) this.domUI.destroy();
    });
  }

  private createDOMUI(): void {
    const configNivel = GestorNiveles.obtenerConfig(this.datosFinNivel.idNivel);
    const siguienteId = configNivel.siguienteId;

    const html = `
      <div class="ui-screen">
        <div class="glass-panel" style="width: 500px; text-align: center;">
          <h2 style="color: var(--neon-gold); font-size: 1.2rem; margin-bottom: 1rem; text-shadow: 4px 4px 0px #000;">¡MISIÓN ÉXITO!</h2>
          <p style="font-size: 0.6rem; color: #888; margin-bottom: 3rem;">Nivel: ${configNivel.nombreDisplay}</p>
          
          <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem; text-align: left;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #444; padding-bottom: 10px;">
              <span style="font-size: 0.7rem;">PUNTOS:</span>
              <span style="font-size: 0.8rem; color: #fff;">${this.datosFinNivel.puntos.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #444; padding-bottom: 10px;">
              <span style="font-size: 0.7rem;">MONEDAS:</span>
              <span style="font-size: 0.8rem; color: var(--neon-gold);">${this.datosFinNivel.monedas}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${
              siguienteId
                ? `<button id="btn-siguiente" class="btn-neon" style="background: var(--neon-cyan); color: #000;">SIGUIENTE NIVEL</button>`
                : '<div style="color: var(--neon-gold); font-size: 0.8rem; margin: 1rem 0;">⭐ JUEGO COMPLETADO ⭐</div>'
            }
            <button id="btn-selector" class="btn-neon">MAPA DEL MUNDO</button>
          </div>
        </div>
      </div>
    `;

    this.domUI = this.add.dom(0, 0).setOrigin(0, 0).createFromHTML(html);

    // Eventos de botones
    const btnSiguiente = this.domUI.getChildByID(
      "btn-siguiente",
    ) as HTMLElement;
    const btnSelector = this.domUI.getChildByID("btn-selector") as HTMLElement;

    if (btnSiguiente) {
      btnSiguiente.onclick = () => {
        this.scene.start(ESCENAS.JUEGO, { idNivel: siguienteId });
      };
    }

    if (btnSelector) {
      btnSelector.onclick = () => {
        this.scene.start(ESCENAS.NIVELES);
      };
    }
  }
}
