import Phaser from "phaser";
import { ASSETS } from "@constantes/constantes-assets";
import { ControlJugador } from "./ControlJugador";
import { EstadosJugador } from "./EstadosJugador";
import type { EstadoJugador } from "@tipos/tipos-jugador";

export class Jugador extends Phaser.Physics.Arcade.Sprite {
  private control: ControlJugador;
  private estados: EstadosJugador;
  public estado: EstadoJugador = "idle";

  constructor(escena: Phaser.Scene, x: number, y: number) {
    super(escena, x, y, ASSETS.JUGADOR_SPRITE);

    escena.add.existing(this);
    escena.physics.add.existing(this);

    this.control = new ControlJugador(escena);
    this.estados = new EstadosJugador(this);

    this.configurarCuerpo();
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
