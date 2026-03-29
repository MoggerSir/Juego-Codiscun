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
  JUGADOR_SIN_VIDAS: 'jugador:sin-vidas',
  
  // Combate
  COLISION_JUGADOR_ENEMIGO: 'colision:jugador-enemigo',
  COLISION_ENEMIGO_ENEMIGO: 'colision:enemigo-enemigo',
  ENEMIGO_PISADO: 'enemigo:pisado',
  ENEMIGO_PATEADO: 'enemigo:pateado',
  
  // Puntuación
  PUNTUACION_SUMAR: 'puntuacion:sumar',
  PUNTUACION_CAMBIO: 'puntuacion:cambio',
  PUNTOS_FLOTANTES: 'visual:puntos-flotantes', // Feedback visual
  
  // Objetos
  MONEDA_RECOGIDA: 'objeto:moneda-recogida',
  ITEM_RECOGIDO: 'objeto:item-recogido',
  
  // Estado de Juego
  META_ALCANZADA: 'nivel:meta-alcanzada', // Interno: Disparador fisico
  NIVEL_COMPLETADO: 'nivel:completado',   // Oficial: Transición aprobada
  GAME_OVER: 'juego:game-over',
  
  // Temporizador
  TIEMPO_CAMBIO: 'tiempo:cambio',
  TIEMPO_AGOTADO: 'tiempo:agotado',

  // Input
  INPUT_MODO_CAMBIO: 'input:modo-cambio',
  INPUT_FLASH_ZONA: 'input:flash-zona'
};

/**
 * Bus de eventos centralizado.
 * Utiliza un objeto EventEmitter local o el Registry de Phaser si se prefiere.
 */
export class SistemaEventos {
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
