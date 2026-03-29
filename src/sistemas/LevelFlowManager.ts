import Phaser from 'phaser';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';
import { EstadoSession } from './EstadoSession';
import { ConfigNivel, DatosFinNivel } from '@tipos/tipos-nivel';
import { ESCENAS } from '@constantes/constantes-escenas';
import { Jugador } from '@entidades/jugador/Jugador';
import { Bandera } from '@entidades/objetos/Bandera';

/**
 * Gestor Arquitectónico (Anti-God Scene).
 * Centraliza la lógica de flujo de partida: Transiciones, Game Over, y Victorias.
 * Separa a EscenaJuego de las decisiones de negocio.
 */
export class LevelFlowManager {
  private escena: Phaser.Scene;
  private configNivel: ConfigNivel;
  private jugador: Jugador;

  constructor(escena: Phaser.Scene, configNivel: ConfigNivel, jugador: Jugador) {
    this.escena = escena;
    this.configNivel = configNivel;
    this.jugador = jugador;
    this.registrarEscuchas();
  }

  private registrarEscuchas(): void {
    const bus = SistemaEventos.obtener();

    // Registro específico reteniendo contexto `this` para desregistro direccional
    bus.on(EVENTOS.JUGADOR_SIN_VIDAS, this.manejarFallo, this);
    bus.on(EVENTOS.META_ALCANZADA, this.manejarVictoria, this);

    // Sanidad total en la recolección de basura del ciclo de vida de Phaser 
    this.escena.events.once('shutdown', () => {
      bus.off(EVENTOS.JUGADOR_SIN_VIDAS, this.manejarFallo, this);
      bus.off(EVENTOS.META_ALCANZADA, this.manejarVictoria, this);
      
      // Extirpación total de asincronía pendiente post-muerte/transición
      this.escena.tweens.killAll();
      this.escena.time.removeAllEvents();
    });
  }

  private manejarFallo(): void {
    const session = EstadoSession.obtener();
    
    // Apagamos UI para evitar artifacts visuales superpuestos
    this.escena.scene.stop(ESCENAS.UI);
    
    // El componente de salud interna del jugador ya se agotó en este run, pero la sesión revisa:
    if (session.getVidas() > 0) {
      session.resetParcial();
      // Revivimos en este mismo nivel
      // Pasamos explicitamente el ID actual en el reinicio
      this.escena.scene.restart({ idNivel: this.configNivel.id }); 
    } else {
      // Game Over Definitivo: Pierde todas las vidas.
      session.resetTotal();
      this.escena.scene.start(ESCENAS.GAME_OVER, { puntos: session.getScore() });
    }
  }

  private manejarVictoria(datos: { x: number, y: number, bandera: Bandera }): void {
    // 1. Inmuniza Inquebrantablemente al personaje de cualquier daño extra 
    this.jugador.comenzarTransicionVictoria();

    // 2. Ordenamos a la Bandera desencadenar cinemática bajando
    datos.bandera.animarBajada(() => {
      // 3. Oficializamos que el Nivel está terminado al finalizar la animación
      const session = EstadoSession.obtener();
      
      const finNivelParams: DatosFinNivel = {
        idNivel: this.configNivel.id,
        puntos: session.getScore(),
        monedas: session.getMonedas(),
        tiempoRestante: 0 // Integrable luego
      };

      SistemaEventos.obtener().emit(EVENTOS.NIVEL_COMPLETADO, finNivelParams);
      
      this.escena.scene.stop(ESCENAS.UI);
      
      // En lugar de redirigir directo al siguiente nivel, vamos a la pantalla de victoria
      this.escena.scene.start(ESCENAS.VICTORIA, finNivelParams);
    });
  }
}
