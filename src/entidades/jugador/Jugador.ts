import { ASSETS } from "@constantes/constantes-assets";
import { ControlJugador } from "./ControlJugador";
import { EstadosJugador } from "./EstadosJugador";
import { ComponenteSalud } from "@componentes/ComponenteSalud";
import { ComponenteInvencibilidad } from "@componentes/ComponenteInvencibilidad";
import { VisualInvencibilidad } from "@componentes/VisualInvencibilidad";
import { EVENTOS } from "@utilidades/EventBus";
import type { EstadoJugador } from "@tipos/tipos-jugador";

/**
 * Representa los estados lógicos del jugador para evitar bugs de concurrencia.
 */
export enum EstadoLogicoJugador {
  NORMAL,
  DANIADO,
  INVENCIBLE,
  MUERTO,
}

export class Jugador extends Phaser.Physics.Arcade.Sprite {
  private control: ControlJugador;
  private estados: EstadosJugador;
  private salud: ComponenteSalud;
  private invencibilidad: ComponenteInvencibilidad;

  public estadoLogico: EstadoLogicoJugador = EstadoLogicoJugador.NORMAL;
  public estado: EstadoJugador = "idle";

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.JUGADOR_SPRITE);

    escena.add.existing(this);
    escena.physics.add.existing(this);

    this.control = new ControlJugador(escena);
    this.estados = new EstadosJugador(this);

    // Inicialización de nuevos componentes modulares de nivel Senior
    this.salud = new ComponenteSalud(escena, 3);
    this.invencibilidad = new ComponenteInvencibilidad(
      escena,
      1200,
      "jugador:invencibilidad-cambio",
    );
    new VisualInvencibilidad(this.scene, this, "jugador:invencibilidad-cambio");

    this.configurarCuerpo();
    this.registrarEscuchas();
  }

  private registrarEscuchas(): void {
    // Escuchar el cambio de estado de invencibilidad para actualizar el estado lógico
    this.scene.events.on("jugador:invencibilidad-cambio", (activa: boolean) => {
      if (this.estadoLogico === EstadoLogicoJugador.MUERTO) return;
      this.estadoLogico = activa
        ? EstadoLogicoJugador.INVENCIBLE
        : EstadoLogicoJugador.NORMAL;
    });
  }

  /**
   * Procesa el daño recibido por el jugador.
   * Orquestador senior con guard clauses explícitas.
   */
  public recibirDano(): void {
    if (
      this.invencibilidad.estaActiva() ||
      this.estadoLogico === EstadoLogicoJugador.MUERTO
    ) {
      return;
    }

    this.scene.game.events.emit(EVENTOS.JUGADOR_HERIDO);
    const haMuerto = this.salud.reducir();

    if (haMuerto) {
      this.morir();
    } else {
      this.entrarEnEstadoDaniado();
    }
  }

  private entrarEnEstadoDaniado(): void {
    this.estadoLogico = EstadoLogicoJugador.DANIADO;
    this.invencibilidad.activar();

    // Feedback físico (retroceso / knockback inicial)
    // Nota: El SistemaDano aplicará un retroceso más preciso, pero aquí damos un salto
    this.setVelocityY(-250);
  }

  private morir(): void {
    this.estadoLogico = EstadoLogicoJugador.MUERTO;
    this.estado = "muerto";
    this.setTint(0xff0000);
    this.scene.game.events.emit(EVENTOS.JUGADOR_MUERTO);

    // Deshabilitar físicas
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    this.setVelocity(0, -450); // Salto de muerte dramático
  }

  private configurarCuerpo(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 40);
    body.setOffset(4, 8);
    body.setMaxVelocityX(150);
    body.setGravityY(0);
  }

  update(): void {
    this.estados.actualizar(this.control.obtenerInput());
  }

  public estaEnSuelo(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }

  public consumirSalto(): void {
    this.control.consumirSalto();
  }

  public soltoSalto(): boolean {
    return this.control.soltoSalto();
  }
}
