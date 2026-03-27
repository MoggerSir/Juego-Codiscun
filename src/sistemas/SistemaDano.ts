import Phaser from 'phaser';
import type { Jugador } from '@entidades/jugador/Jugador';
import type { EnemigoBase } from '@entidades/enemigos/EnemigoBase';

/**
 * Sistema que orquesta las reglas de daño y combate.
 * Escucha eventos de colisión y decide qué acción tomar.
 */
export class SistemaDano {
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
    this.registrarEventos();
  }

  private registrarEventos(): void {
    // Escuchar colisiones entre jugador y enemigo
    this.escena.events.on('colision:jugador-enemigo', this.manejarColision, this);
    
    // Al destruir el sistema (si la escena se apaga), limpiar eventos
    this.escena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.escena.events.off('colision:jugador-enemigo', this.manejarColision, this);
    });
  }

  /**
   * Decide si el jugador ha pisado al enemigo o si ha recibido daño.
   */
  private manejarColision(data: { jugador: Jugador, enemigo: EnemigoBase }): void {
    const { jugador, enemigo } = data;

    // Guard clause: si alguno ya no es válido, ignorar
    if (!jugador.active || !enemigo.active) return;

    // Regla de combate: ¿Viene de arriba? (Pisado)
    const esPisado = jugador.body!.touching.down && enemigo.body!.touching.up;

    if (esPisado) {
      this.procesarPisado(jugador, enemigo);
    } else {
      this.procesarDanoJugador(jugador);
    }
  }

  private procesarPisado(jugador: Jugador, enemigo: EnemigoBase): void {
    // El enemigo maneja su propia muerte según su clase concreta
    enemigo.alSerPisado();
    
    // Mario rebota hacia arriba
    jugador.setVelocityY(-350);
  }

  private procesarDanoJugador(jugador: Jugador): void {
    // El jugador delega el daño a sus componentes de salud e invencibilidad
    jugador.recibirDano();
  }
}
