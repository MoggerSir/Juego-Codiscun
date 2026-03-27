import Phaser from 'phaser';
import { EVENTOS, EventBus } from '@utilidades/EventBus';
import type { Jugador } from '@entidades/jugador/Jugador';
import type { EnemigoBase } from '@entidades/enemigos/EnemigoBase';

/**
 * Sistema que orquesta las reglas de daño y combate.
 * Escucha eventos de colisión y decide qué acción tomar (Senior Refactor).
 */
export class SistemaDano {
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
    this.registrarEventos();
  }

  private registrarEventos(): void {
    const bus = EventBus.obtener(this.escena);
    
    // Escuchar colisiones entre jugador y enemigo
    bus.on(EVENTOS.COLISION_JUGADOR_ENEMIGO, this.manejarColision, this);
    
    this.escena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EVENTOS.COLISION_JUGADOR_ENEMIGO, this.manejarColision, this);
    });
  }

  /**
   * Resuelve el resultado del combate basado en la posición y estado.
   */
  private manejarColision(data: { jugador: Jugador, enemigo: EnemigoBase }): void {
    const { jugador, enemigo } = data;

    if (!jugador.active || !enemigo.active) return;

    // 1. Regla de Pisado (Prioridad alta)
    const esPisado = jugador.body!.touching.down && enemigo.body!.touching.up;

    if (esPisado) {
      this.procesarPisado(jugador, enemigo);
      return;
    }

    // 2. Regla de Interacción Especial (Pateo, etc.)
    const golpeGestionado = enemigo.recibirGolpeLateral(jugador);
    if (golpeGestionado) {
      EventBus.obtener().emit(EVENTOS.ENEMIGO_PATEADO, { enemigo });
      return;
    }

    // 3. Daño al Jugador + Knockback
    this.procesarDanoJugador(jugador, enemigo);
  }

  private procesarPisado(jugador: Jugador, enemigo: EnemigoBase): void {
    enemigo.alSerPisado();
    jugador.setVelocityY(-350);
    EventBus.obtener().emit(EVENTOS.ENEMIGO_PISADO, { enemigo });
  }

  private procesarDanoJugador(jugador: Jugador, enemigo: EnemigoBase): void {
    // Aplicar lógica de salud interna del jugador
    jugador.recibirDano();

    // Aplicar feedback físico (Knockback)
    this.aplicarKnockback(jugador, enemigo);
  }

  /**
   * Empuja al jugador en dirección opuesta al impacto.
   */
  private aplicarKnockback(jugador: Jugador, enemigo: EnemigoBase): void {
    // Si el jugador ha muerto, no aplicar fuerza extra
    if (!jugador.active) return;

    const fuerzaX = 300;
    const fuerzaY = -200;
    const direccion = jugador.x < enemigo.x ? -1 : 1;

    jugador.setVelocityX(fuerzaX * direccion);
    jugador.setVelocityY(fuerzaY);
    
    // Bloquear brevemente el control del jugador si fuera necesario (opcional)
  }
}
