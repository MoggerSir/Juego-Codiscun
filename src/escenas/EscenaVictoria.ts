import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { GestorNiveles } from "@niveles/GestorNiveles";
import type { DatosFinNivel } from "@tipos/tipos-nivel";
import "../ui/game-ui.css";

export class EscenaVictoria extends Phaser.Scene {
  private datosFinNivel!: DatosFinNivel;
  private uiElement: HTMLElement | null = null;

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
      this.limpiarUI();
    });
  }

  private createDOMUI(): void {
    const configNivel = GestorNiveles.obtenerConfig(this.datosFinNivel.idNivel);
    const siguienteId = configNivel.siguienteId;

    // Cálculos Senior de Tiempo y Bonificación
    const tiempoTotal = configNivel.tiempoLimite;
    const tiempoRestante = this.datosFinNivel.tiempoRestante;
    const tiempoTranscurrido = Math.max(0, tiempoTotal - tiempoRestante);
    const bonoTiempo = Math.floor(tiempoRestante * 0.2);
    const puntosTotales = this.datosFinNivel.puntos + bonoTiempo;

    const formatear = (seg: number) => {
      const min = Math.floor(seg / 60);
      const s = Math.floor(seg % 60);
      return `${min}:${s.toString().padStart(2, "0")}`;
    };

    const html = `
      <div id="victory-screen" class="ui-screen">
        <div class="glass-panel" id="panel-victoria" style="width: 90%; max-width: 550px; text-align: center; padding: clamp(0.5rem, 3vw, 2rem); margin: 0 auto;">
          <h2 style="color: var(--neon-gold); font-size: clamp(0.9rem, 4vw, 1.3rem); margin-bottom: 0.3rem; text-shadow: 4px 4px 0px #000;">¡MISIÓN ÉXITO!</h2>
          <p style="font-size: 0.5rem; color: #888; margin-bottom: clamp(0.5rem, 2vh, 1.5rem); letter-spacing: 2px;">${configNivel.nombreDisplay}</p>
          
          <div style="display: flex; flex-direction: column; gap: clamp(0.3rem, 1.5vh, 1rem); margin-bottom: clamp(0.5rem, 2vh, 1.5rem); text-align: left;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
              <span style="font-size: 0.6rem; color: #aaa;">PUNTOS BASE:</span>
              <span style="font-size: 0.7rem; color: #fff; font-family: 'Courier New', monospace;">${this.datosFinNivel.puntos.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
              <span style="font-size: 0.6rem; color: #aaa;">TIEMPO:</span>
              <span style="font-size: 0.7rem; color: var(--neon-cyan); font-family: 'Courier New', monospace;">${formatear(tiempoTranscurrido)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
              <span style="font-size: 0.6rem; color: #aaa;">BONO:</span>
              <span style="font-size: 0.7rem; color: var(--neon-gold); font-family: 'Courier New', monospace;">+${bonoTiempo.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding: 10px; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid var(--neon-gold);">
              <span style="font-size: 0.7rem; color: var(--neon-gold); font-weight: bold;">TOTAL:</span>
              <span style="font-size: 1rem; color: #fff; text-shadow: 0 0 10px var(--neon-gold); font-family: 'Courier New', monospace;">${puntosTotales.toLocaleString()}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${
              siguienteId
                ? `<button id="btn-siguiente" class="btn-neon" style="background: var(--neon-cyan); color: #000; font-weight: bold;">SIGUIENTE NIVEL</button>`
                : '<div style="color: var(--neon-gold); font-size: 0.7rem; margin: 0.5rem 0; font-weight: bold; text-shadow: 0 0 15px var(--neon-gold);">⭐ ¡LEYENDA! ⭐</div>'
            }
            <button id="btn-selector" class="btn-neon">REGRESAR AL MAPA</button>
          </div>
        </div>
      </div>
    `;

    // Inyección Nativa para CENTRADO PERFECTO
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();
    this.uiElement = tempDiv.firstChild as HTMLElement;
    document.body.appendChild(this.uiElement);

    // Eventos de botones
    const btnSiguiente = this.uiElement.querySelector("#btn-siguiente") as HTMLElement;
    const btnSelector = this.uiElement.querySelector("#btn-selector") as HTMLElement;

    if (btnSiguiente) {
      btnSiguiente.onclick = () => {
        this.limpiarUI();
        this.scene.start(ESCENAS.JUEGO, { idNivel: siguienteId });
      };
    }

    if (btnSelector) {
      btnSelector.onclick = () => {
        this.limpiarUI();
        this.scene.start(ESCENAS.NIVELES);
      };
    }
  }

  private limpiarUI(): void {
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement);
      this.uiElement = null;
    }
  }
}
