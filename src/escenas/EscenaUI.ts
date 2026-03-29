import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ContadorMonedas } from "@ui/ContadorMonedas";
import { ContadorTiempo } from "@ui/ContadorTiempo";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { EstadoSession } from "@sistemas/EstadoSession";

export class EscenaUI extends Phaser.Scene {
  private uiMonedas!: ContadorMonedas;
  private uiTiempo!: ContadorTiempo;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    const { width } = this.scale;

    // Esquina Superior Izquierda: Monedas
    this.uiMonedas = new ContadorMonedas(this, 20, 20, 0);

    // Esquina Superior Derecha: Temporizador Senior (Configurado por Nivel)
    const session = EstadoSession.obtener();
    const configNivel = GestorNiveles.obtenerConfig(session.getIdNivelActual());
    
    this.uiTiempo = new ContadorTiempo(this, width - 20, 20, configNivel.tiempoLimite);

    // Escuchar cambios globales
    const bus = SistemaEventos.obtener();
    
    bus.on(EVENTOS.PUNTUACION_CAMBIO, (data: { puntos: number, monedas: number }) => {
      this.uiMonedas.actualizar(data.monedas);
    });

    // Limpieza Senior
    this.events.once("shutdown", () => {
        bus.off(EVENTOS.PUNTUACION_CAMBIO);
    });
  }
}
