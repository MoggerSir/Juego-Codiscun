import { ASSETS } from "@constantes/constantes-assets";
import { ControlJugador } from "./ControlJugador";
import { EstadosJugador } from "./EstadosJugador";
import { ComponenteSalud } from "@componentes/ComponenteSalud";
import { ComponenteInvencibilidad } from "@componentes/ComponenteInvencibilidad";
import { VisualInvencibilidad } from "@componentes/VisualInvencibilidad";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
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
  public esGrande: boolean = false;

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
    if (this.invencibilidad.estaActiva() || this.estadoLogico === EstadoLogicoJugador.MUERTO) {
      return;
    }

    this.scene.game.events.emit(EVENTOS.JUGADOR_HERIDO);

    // NUEVO: Si es grande, pierde la vida extra que ganó con el hongo,
    // encoge a su tamaño normal, e inicia la secuencia de daño (salto hacia atrás e invencibilidad).
    if (this.esGrande) {
      this.salud.reducir();
      this.encoger();
      this.entrarEnEstadoDaniado();
      return;
    }

    // Si es pequeño, el daño le reduce otra vida y si llega a cero, muere
    const haMuerto = this.salud.reducir();

    if (haMuerto) {
      this.morir();
    } else {
      this.entrarEnEstadoDaniado();
    }
  }

  public crecer(): void {
    if (this.esGrande || this.estadoLogico === EstadoLogicoJugador.MUERTO) return;
    this.esGrande = true;
    
    // El Origen por defecto es (0.5, 0.5). Al crecer Y escala * 1.5, la mitad inferior 
    // se empuja hacia abajo. Movemos `y` exactamente esa cantidad hacia arriba para que
    // los pies queden en su posición original y no traspasen el suelo.
    this.y -= 10; 
    
    // Escalar sprite (Phaser auto-ajusta el tamaño del Arcade Body proporcionalmente)
    this.setScale(1, 1.5);
  }

  public encoger(): void {
    if (!this.esGrande) return;
    this.esGrande = false;
    
    this.setScale(1, 1);
  }

  public ganarVidaExtra(): void {
    this.salud.agregarVidaExtra();
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
    
    // Reproducir animación (si existe) y asegurar la transición con un timer
    if (this.anims.exists('jugador-muerte')) {
      this.anims.play('jugador-muerte');
    }
    
    this.scene.time.delayedCall(1500, () => {
      SistemaEventos.obtener().emit(EVENTOS.JUGADOR_SIN_VIDAS);
    });
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
