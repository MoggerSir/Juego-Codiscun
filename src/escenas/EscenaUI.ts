import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { UI_Vidas } from "@entidades/jugador/VidasJugador";

export class EscenaUI extends Phaser.Scene {
  private uiVidas!: UI_Vidas;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    // Instancia la UI con un valor inicial de 3 vidas
    this.uiVidas = new UI_Vidas(this, 3);

    // MEJORA: Escuchar un evento global para actualizar las vidas visualmente
    this.registry.events.on('actualizar-vidas', (vidas: number) => {
      this.uiVidas.actualizar(vidas);
    });
  }
}
