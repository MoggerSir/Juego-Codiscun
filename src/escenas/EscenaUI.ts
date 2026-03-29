import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ContadorMonedas } from "@ui/ContadorMonedas";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";

export class EscenaUI extends Phaser.Scene {
  private uiMonedas!: ContadorMonedas;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    // Instancia el contador de monedas en la esquina superior izquierda
    this.uiMonedas = new ContadorMonedas(this, 20, 20, 0);

    // Escuchar cambios en la puntuación/monedas
    SistemaEventos.obtener().on(EVENTOS.PUNTUACION_CAMBIO, (data: { puntos: number, monedas: number }) => {
      this.uiMonedas.actualizar(data.monedas);
    });
  }
}
