import Phaser from 'phaser';
import type { Jugador } from '@entidades/jugador/Jugador';
import type { EnemigoBase } from '@entidades/enemigos/EnemigoBase';
import { EVENTOS, EventBus } from '@utilidades/EventBus';

export class SistemaColisiones {
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
  }

  public registrarJugadorConEnemigos(
    jugador: Jugador,
    grupoEnemigos: Phaser.Physics.Arcade.Group
  ): void {
    this.escena.physics.add.collider(jugador, grupoEnemigos, (j, e) => {
      // Emitimos el evento a través del Bus Global
      EventBus.obtener().emit(EVENTOS.COLISION_JUGADOR_ENEMIGO, {
        jugador: j as Jugador,
        enemigo: e as EnemigoBase
      });
    });
  }

  public registrarJugadorConMapa(
    jugador: Jugador,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(jugador, capaPlataformas);
  }

  public registrarEnemigosConMapa(
    grupoEnemigos: Phaser.Physics.Arcade.Group,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(grupoEnemigos, capaPlataformas);
  }
}
