import Phaser from "phaser";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";

/**
 * Representación visual del temporizador (HUD).
 * Maneja cambios de color dinámicos según la urgencia.
 */
export class ContadorTiempo {
  private texto: Phaser.GameObjects.Text;
  private escena: Phaser.Scene;
  private valorPrevio: number;

  constructor(scene: Phaser.Scene, x: number, y: number, tiempoInicial: number = 0) {
    this.escena = scene;
    this.valorPrevio = tiempoInicial;

    this.texto = scene.add.text(x, y, `TIEMPO: ${this.formatear(tiempoInicial)}`, {
      fontSize: "20px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: { blur: 5, color: "#000", fill: true },
    });

    this.texto.setScrollFactor(0).setOrigin(1, 0); // Alineado a la derecha
    
    this.registrarEscuchas();
  }

  private registrarEscuchas(): void {
    const bus = SistemaEventos.obtener();
    bus.on(EVENTOS.TIEMPO_CAMBIO, this.actualizar, this);

    this.escena.events.once("shutdown", () => {
      bus.off(EVENTOS.TIEMPO_CAMBIO, this.actualizar, this);
    });
  }

  public actualizar(data: { segundos: number }): void {
    if (!this.texto || !this.texto.active) return;

    const segundos = data.segundos;
    if (segundos === this.valorPrevio) return;
    
    this.valorPrevio = segundos;
    this.texto.setText(`TIEMPO: ${this.formatear(segundos)}`);

    // Lógica Senior de Colores de Alerta
    if (segundos <= 10) {
      this.texto.setColor("#ff0000"); // Rojo crítico
      this.aplicarSacudida();
      // TODO: Añadir beep sound aquí cuando existan los assets
    } else if (segundos <= 30) {
      this.texto.setColor("#ffff00"); // Amarillo advertencia
    } else {
      this.texto.setColor("#ffffff"); // Normal
    }
  }

  private aplicarSacudida(): void {
    this.escena.tweens.add({
      targets: this.texto,
      x: this.texto.x + 2,
      duration: 50,
      yoyo: true,
      repeat: 2
    });
  }

  private formatear(segundos: number): string {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  }
}
