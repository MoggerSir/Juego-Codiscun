import Phaser from 'phaser';
import type { Jugador } from '@entidades/jugador/Jugador';

export class SistemaColisiones {
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
  }

  public registrarJugadorConMapa(
    jugador: Jugador,
    capaTiles: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(jugador, capaTiles);
  }
}
