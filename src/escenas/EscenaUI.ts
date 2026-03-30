import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ContadorMonedas } from "@ui/ContadorMonedas";
import { ContadorTiempo } from "@ui/ContadorTiempo";
import { VisualTouchHUD } from "@ui/VisualTouchHUD";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { EstadoSession } from "@sistemas/EstadoSession";

export class EscenaUI extends Phaser.Scene {
  private uiMonedas!: ContadorMonedas;
  private uiTiempo!: ContadorTiempo;
  private visualTouch!: VisualTouchHUD;

  constructor() {
    super({ key: ESCENAS.UI });
  }

  create() {
    const { width, height } = this.scale;

    // Esquina Superior Izquierda: Monedas
    this.uiMonedas = new ContadorMonedas(this, 20, 20, 0);

    // Esquina Superior Derecha: Temporizador Senior (Configurado por Nivel)
    const session = EstadoSession.obtener();
    const configNivel = GestorNiveles.obtenerConfig(session.getIdNivelActual());
    
    this.uiTiempo = new ContadorTiempo(this, width - 20, 20, configNivel.tiempoLimite);

    // Inicializar HUD táctil Senior (Invisible por defecto)
    this.visualTouch = new VisualTouchHUD(this);
    this.visualTouch.reposicionar(width, height);

    // Manejar Resize Dinámico del HUD
    this.scale.on('resize', this.manejarResize, this);

    // Escuchar cambios globales
    const bus = SistemaEventos.obtener();
    
    bus.on(EVENTOS.PUNTUACION_CAMBIO, (data: { puntos: number, monedas: number }) => {
      this.uiMonedas.actualizar(data.monedas);
    });

    // Limpieza Senior
    this.events.once("shutdown", () => {
        this.scale.off('resize', this.manejarResize, this);
        bus.off(EVENTOS.PUNTUACION_CAMBIO);
    });
  }

  private manejarResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    if (this.uiMonedas) this.uiMonedas.reposicionar(20, 20);
    if (this.uiTiempo) this.uiTiempo.reposicionar(width - 20, 20);
    if (this.visualTouch) this.visualTouch.reposicionar(width, height);
  }
}
