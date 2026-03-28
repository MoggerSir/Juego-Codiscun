import Phaser from 'phaser';

/**
 * Constantes de eventos globales para evitar typos y mejorar el mantenimiento.
 */
export const EVENTOS = {
  // Salud y Daño
  SALUD_CAMBIO: 'salud:cambio',
  ENTIDAD_MUERTA: 'salud:entidad-muerta',
  JUGADOR_HERIDO: 'jugador:herido',
  JUGADOR_MUERTO: 'jugador:muerto',
  
  // Combate
  COLISION_JUGADOR_ENEMIGO: 'colision:jugador-enemigo',
  COLISION_ENEMIGO_ENEMIGO: 'colision:enemigo-enemigo',
  ENEMIGO_PISADO: 'enemigo:pisado',
  ENEMIGO_PATEADO: 'enemigo:pateado',
  
  // Puntuación
  PUNTUACION_SUMAR: 'puntuacion:sumar',
  
  // Estado de Juego
  NIVEL_COMPLETADO: 'nivel:completado',
  GAME_OVER: 'juego:game-over'
};

/**
 * Bus de eventos centralizado.
 * Utiliza un objeto EventEmitter local o el Registry de Phaser si se prefiere.
 */
export class EventBus {
  private static instacia: Phaser.Events.EventEmitter;

  public static obtener(escena?: Phaser.Scene): Phaser.Events.EventEmitter {
    if (!this.instacia) {
      // Si tenemos escena, usamos su game events (global)
      if (escena) {
        this.instacia = escena.game.events;
      } else {
        // Fallback: crear uno nuevo (aunque lo ideal es usar el global de Phaser)
        this.instacia = new Phaser.Events.EventEmitter();
      }
    }
    return this.instacia;
  }
}
