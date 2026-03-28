import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { UI_Vidas } from "@ui/UI_Vidas";
import { ContadorMonedas } from "@ui/ContadorMonedas";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";

export class EscenaUI extends Phaser.Scene {
  private uiVidas!: UI_Vidas;
  private uiMonedas!: ContadorMonedas;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    // Instancia la UI de vidas en la esquina superior izquierda
    this.uiVidas = new UI_Vidas(this, 20, 20, 3);
    
    // Instancia el contador de monedas justo debajo de las vidas
    this.uiMonedas = new ContadorMonedas(this, 20, 50, 0);

    // Escuchar el evento global emitido por el ComponenteSalud
    this.game.events.on('salud:cambio', (data: { vidas: number }) => {
      this.uiVidas.actualizar(data.vidas);
    });

    // Escuchar cambios en la puntuación/monedas
    SistemaEventos.obtener().on(EVENTOS.PUNTUACION_CAMBIO, (data: { puntos: number, monedas: number }) => {
      this.uiMonedas.actualizar(data.monedas);
    });
  }
}
