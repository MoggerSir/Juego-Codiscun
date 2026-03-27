import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { ControlJugador } from "./ControlJugador";
import { EstadosJugador } from "./EstadosJugador";
import { ComponenteSalud } from "@componentes/ComponenteSalud";
import { ManejadorInvencibilidad } from "./ManejadorInvencibilidad";
import type { EstadoJugador } from "@tipos/tipos-jugador";

export class Jugador extends Phaser.Physics.Arcade.Sprite {
  private control: ControlJugador;
  private estados: EstadosJugador;
  private salud: ComponenteSalud;
  private invencibilidad: ManejadorInvencibilidad;
  public estado: EstadoJugador = "idle";

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.JUGADOR_SPRITE);

    escena.add.existing(this);
    escena.physics.add.existing(this);

    this.control = new ControlJugador(escena);
    this.estados = new EstadosJugador(this);
    
    // Inicialización de nuevos componentes modulares
    this.salud = new ComponenteSalud(escena, 3);
    this.invencibilidad = new ManejadorInvencibilidad(escena, this, 1200);

    this.configurarCuerpo();
  }

  /**
   * Procesa el daño recibido por el jugador.
   * Aplica guard clauses para muerte e invencibilidad.
   */
  public recibirDano(): void {
    if (this.salud.estaMuerto() || this.invencibilidad.estaActiva()) {
      return;
    }

    const haMuerto = this.salud.reducir();

    if (haMuerto) {
      this.morir();
    } else {
      this.invencibilidad.activar();
      // Opcional: Sonido de daño o pequeño salto (knockback)
      this.setVelocityY(-200);
    }
  }

  private morir(): void {
    this.estado = "muerto";
    this.setTint(0xff0000);
    this.scene.events.emit("jugador:muerto");
    
    // Deshabilitar físicas
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    
    this.setVelocity(0, -400); // Pequeño salto hacia arriba al morir
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
