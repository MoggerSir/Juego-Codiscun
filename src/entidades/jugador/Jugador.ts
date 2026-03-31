import { ASSETS } from "@constantes/constantes-assets";
import { EstadoSession, EstadoJuego } from "@sistemas/EstadoSession";
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
  TERMINANDO_NIVEL,
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
    if (
      this.invencibilidad.estaActiva() ||
      this.estadoLogico === EstadoLogicoJugador.MUERTO ||
      this.estadoLogico === EstadoLogicoJugador.TERMINANDO_NIVEL
    ) {
      return;
    }

    // Feedback sonoro/visual de golpe
    this.scene.game.events.emit(EVENTOS.JUGADOR_HERIDO);

    if (this.esGrande) {
      // 1. Caso Mario Grande: Pierde el estado pero sobrevive
      this.encoger();
      this.entrarEnEstadoDaniado();
      console.log("[Jugador] Mario golpeado: Encogiendo...");
    } else {
      // 2. Caso Mario Pequeño: Muerte instantánea
      console.log("[Jugador] Mario golpeado siendo pequeño: Muerto!");
      this.morir();
    }
  }

  public crecer(): void {
    if (this.esGrande || this.estadoLogico === EstadoLogicoJugador.MUERTO)
      return;
    this.esGrande = true;

    // El Origen por defecto es (0.5, 0.5). Al crecer Y escala * 1.5, la mitad inferior
    // se empuja hacia abajo. Movemos `y` exactamente esa cantidad hacia arriba para que
    // los pies queden en su posición original y no traspasen el suelo.
    this.y -= 10;

    // Escalar sprite (Phaser auto-ajusta el tamaño del Arcade Body proporcionalmente)
    // Ajuste de escala: X crece a 0.5 (robustez) y Y a 0.6 (altura)
    this.setScale(0.55, 0.6);
  }

  public encoger(): void {
    if (!this.esGrande) return;
    this.esGrande = false;

    this.setScale(0.4);
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

  public morir(): void {
    const session = EstadoSession.obtener();

    // 0. Bloqueo Sistémico Inmediato (Senior Protection)
    if (
      this.estadoLogico === EstadoLogicoJugador.MUERTO ||
      session.getEstado() !== EstadoJuego.JUGANDO
    ) {
      return;
    }

    // 1. Congelar el Mundo
    session.setEstado(EstadoJuego.FALLANDO);
    this.scene.input.enabled = false;

    this.estadoLogico = EstadoLogicoJugador.MUERTO;
    this.estado = "muerto";
    this.setTint(0xff0000);
    this.scene.game.events.emit(EVENTOS.JUGADOR_MUERTO);

    // 2. Transición Sonora y Física (Play Safe)
    this.scene.sound.stopAll();
    if (this.scene.cache.audio.exists(ASSETS.SFX_MUERTE)) {
      this.scene.sound.play(ASSETS.SFX_MUERTE, { volume: 0.8 });
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;

    this.setVelocity(0, -450); // Salto de muerte dramático

    // Reproducir animación (si existe)
    if (this.anims.exists("jugador-muerte")) {
      this.anims.play("jugador-muerte");
    }

    // Emitir el fallo total tras la animación (el LevelFlowManager se encargará del resto)
    this.scene.time.delayedCall(1500, () => {
      SistemaEventos.obtener().emit(EVENTOS.JUGADOR_SIN_VIDAS);
    });
  }

  /**
   * Congela al jugador ignorando inputs y anulando físicas para proteger
   * la secuencia cinematica de transición de nivel (Ej: Bajar Bandera).
   */
  public comenzarTransicionVictoria(): void {
    this.estadoLogico = EstadoLogicoJugador.TERMINANDO_NIVEL;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.setVelocity(0, 0);

    if (this.anims.exists("jugador-idle")) {
      this.anims.play("jugador-idle");
    }
  }

  private configurarCuerpo(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Nueva escala base para el asset de 128px
    this.setScale(0.4);

    // Ajuste de colisión (Hitbox) para el frame de 104x128
    // Estos valores son en píxeles originales del asset
    body.setSize(50, 100);
    body.setOffset(37, 44);

    body.setMaxVelocityX(150);
    body.setGravityY(0);
  }

  update(): void {
    // Si el nivel se terminó, el jugador entra en letargo absoluto.
    if (this.estadoLogico === EstadoLogicoJugador.TERMINANDO_NIVEL) return;

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
