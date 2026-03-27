import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { UI_Vidas } from "@ui/UI_Vidas";

export class EscenaUI extends Phaser.Scene {
  private uiVidas!: UI_Vidas;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    // Instancia la UI de vidas en la esquina superior izquierda
    this.uiVidas = new UI_Vidas(this, 20, 20, 3);

    // Escuchar el evento global emitido por el ComponenteSalud
    this.game.events.on('salud:cambio', (data: { vidas: number }) => {
      this.uiVidas.actualizar(data.vidas);
    });
  }
}
