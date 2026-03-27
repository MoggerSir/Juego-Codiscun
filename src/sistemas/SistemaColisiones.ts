import Phaser from 'phaser';
import type { Jugador } from '@entidades/jugador/Jugador';
import type { EnemigoBase } from '@entidades/enemigos/EnemigoBase';

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

  /**
   * Registra la interacción física entre el jugador y un grupo de enemigos.
   */
  public registrarJugadorConEnemigos(
    jugador: Jugador,
    grupoEnemigos: Phaser.Physics.Arcade.Group
  ): void {
    this.escena.physics.add.collider(jugador, grupoEnemigos, (j, e) => {
      // Emitimos un evento genérico de colisión para que el SistemaDano lo gestione
      this.escena.events.emit('colision:jugador-enemigo', {
        jugador: j as Jugador,
        enemigo: e as EnemigoBase
      });
    });
  }

  /**
   * Registra la colisión de los enemigos con el mapa para que no caigan al vacío.
   */
  public registrarEnemigosConMapa(
    grupoEnemigos: Phaser.Physics.Arcade.Group,
    capaTiles: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(grupoEnemigos, capaTiles);
  }
}
