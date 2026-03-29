import Phaser from 'phaser';
import type { Jugador } from '@entidades/jugador/Jugador';
import type { EnemigoBase } from '@entidades/enemigos/EnemigoBase';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';

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
      SistemaEventos.obtener().emit(EVENTOS.COLISION_JUGADOR_ENEMIGO, {
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
    // Colisión con el mapa
    this.escena.physics.add.collider(grupoEnemigos, capaPlataformas);

    // NUEVO: Colisión entre enemigos
    this.escena.physics.add.collider(grupoEnemigos, grupoEnemigos, (e1, e2) => {
      SistemaEventos.obtener().emit(EVENTOS.COLISION_ENEMIGO_ENEMIGO, {
        enemigo1: e1 as EnemigoBase,
        enemigo2: e2 as EnemigoBase
      });
    });
  }

  public registrarJugadorConMonedas(
    jugador: Jugador,
    grupoMonedas: Phaser.Physics.Arcade.Group
  ): void {
    this.escena.physics.add.overlap(jugador, grupoMonedas, (_j, m) => {
      const moneda = m as any;
      if (moneda.alSerRecogida) moneda.alSerRecogida();
    });
  }

  public registrarJugadorConPowerUps(
    jugador: Jugador,
    grupoPowerUps: Phaser.Physics.Arcade.Group
  ): void {
    this.escena.physics.add.overlap(jugador, grupoPowerUps, (j, p) => {
      const powerUp = p as any;
      if (powerUp.alSerRecogido) powerUp.alSerRecogido(j as Jugador);
    });
  }

  public registrarPowerUpsConMapa(
    grupoPowerUps: Phaser.Physics.Arcade.Group,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ): void {
    this.escena.physics.add.collider(grupoPowerUps, capaPlataformas);
  }

  public registrarJugadorConBloques(
    jugador: Jugador,
    grupoBloques: Phaser.Physics.Arcade.StaticGroup
  ): void {
    this.escena.physics.add.collider(jugador, grupoBloques, (j, b) => {
      const jugadorObj = j as Jugador;
      const bloqueObj = b as any; // Será BloqueLadrillo o BloqueInterrogacion

      // El jugador viene desde abajo si su contacto físico fue en su parte superior ("up")
      // y el del bloque en su parte inferior ("down").
      const golpeDesdeAbajo =
        jugadorObj.body!.touching.up &&
        bloqueObj.body.touching.down;

      if (golpeDesdeAbajo) {
        if (bloqueObj.alSerGolpeado) bloqueObj.alSerGolpeado(jugadorObj);
      }
    });
  }

  public registrarJugadorConBandera(
    jugador: Jugador,
    bandera: Phaser.Physics.Arcade.Sprite
  ): void {
    const banderaObj = bandera as any;
    // Usamos overlap para que Mario pase a través de la bandera sin ser empujado,
    // y aplicamos una precaución estricta evaluando banderaObj.tocar() dentro.
    this.escena.physics.add.overlap(jugador, bandera, (_j, _b) => {
      // tocar() devuelve false si ya fue activada, evitando el doble trigger del engine
      if (banderaObj.tocar) {
        banderaObj.tocar();
      }
    });
  }
}
