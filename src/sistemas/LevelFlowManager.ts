import Phaser from "phaser";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { EstadoSession, EstadoJuego } from "./EstadoSession";
import { ConfigNivel, DatosFinNivel } from "@tipos/tipos-nivel";
import { ESCENAS } from "@constantes/constantes-escenas";
import { Jugador } from "@entidades/jugador/Jugador";
import { Bandera } from "@entidades/objetos/Bandera";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { TemporizadorNivel } from "@ui/TemporizadorNivel";

/**
 * Gestor Arquitectónico (Anti-God Scene).
 * Centraliza la lógica de flujo de partida: Transiciones, Game Over, y Victorias.
 * Separa a EscenaJuego de las decisiones de negocio.
 */
export class LevelFlowManager {
  private escena: Phaser.Scene;
  private configNivel: ConfigNivel;
  private jugador: Jugador;
  private temporizador: TemporizadorNivel;
  private procesandoFalloInterno: boolean = false;

  constructor(
    escena: Phaser.Scene,
    configNivel: ConfigNivel,
    jugador: Jugador,
  ) {
    this.escena = escena;
    this.configNivel = configNivel;
    this.jugador = jugador;
    
    // Inicialización del Temporizador Senior
    this.temporizador = new TemporizadorNivel(this.escena, configNivel.tiempoLimite);
    this.temporizador.iniciar();

    this.registrarEscuchas();
  }

  private registrarEscuchas(): void {
    const bus = SistemaEventos.obtener();

    // Registro específico reteniendo contexto `this` para desregistro direccional
    bus.on(EVENTOS.JUGADOR_SIN_VIDAS, this.manejarFallo, this);
    bus.on(EVENTOS.META_ALCANZADA, this.manejarVictoria, this);
    bus.on(EVENTOS.TIEMPO_AGOTADO, this.manejarTiempoAgotado, this);

    // Sanidad total en la recolección de basura del ciclo de vida de Phaser
    this.escena.events.once("shutdown", () => {
      bus.off(EVENTOS.JUGADOR_SIN_VIDAS, this.manejarFallo, this);
      bus.off(EVENTOS.META_ALCANZADA, this.manejarVictoria, this);
      bus.off(EVENTOS.TIEMPO_AGOTADO, this.manejarTiempoAgotado, this);
      
      this.temporizador.destruir();

      // Extirpación total de asincronía pendiente post-muerte/transición
      this.escena.tweens.killAll();
      this.escena.time.removeAllEvents();
    });
  }

  private manejarTiempoAgotado(): void {
    console.warn("[LevelFlow] ¡Tiempo agotado! Forzando muerte del jugador.");
    this.jugador.morir();
  }

  private manejarFallo(): void {
    const session = EstadoSession.obtener();

    // 0. Bloqueo Maestreo (Atomic Guard local)
    if (this.procesandoFalloInterno) return;
    this.procesandoFalloInterno = true;
    
    // Detener Timer Senior (Evitar muertes dobles)
    this.temporizador.detener();

    session.setEstado(EstadoJuego.FALLANDO);

    // 1. Silenciar Escena (Soft Cleanup)
    this.escena.input.enabled = false;
    this.escena.scene.stop(ESCENAS.UI);

    // 2. Transición Directa a Game Over (Senior Refactor: Simetría de Flujo)
    console.log(`[LevelFlow] Iniciando secuencia de muerte definitiva.`);

    // 3. Transición Blindada
    this.escena.time.delayedCall(500, () => {
      // 0. Validación de Supervivencia de Escena
      if (session.getEstado() !== EstadoJuego.FALLANDO) return;

      // 1. Limpieza Final de Asincronía
      this.escena.tweens.killAll();
      this.escena.time.removeAllEvents();

      console.log("[LevelFlow] Lanzando Pantalla de Menú (Game Over)...");

      // Siempre vamos al menú de Game Over, el cual permite Reintentar o Salir
      this.escena.scene.start(ESCENAS.GAME_OVER, {
        puntos: session.getScore(),
        idNivel: this.configNivel.id,
      });
    });
  }

  private manejarVictoria(datos: {
    x: number;
    y: number;
    bandera: Bandera;
  }): void {
    // 1. Inmuniza Inquebrantablemente al personaje de cualquier daño extra
    this.jugador.comenzarTransicionVictoria();
    
    // 2. Detener Timer Senior (Evitar muertes durante la animación)
    this.temporizador.detener();

    // 3. Ordenamos a la Bandera desencadenar cinemática bajando
    datos.bandera.animarBajada(() => {
      // 4. Oficializamos que el Nivel está terminado al finalizar la animación
      const session = EstadoSession.obtener();
      const tiempoRestante = this.temporizador.obtenerTiempoRestante();
      const bonoTiempo = Math.floor(tiempoRestante * 0.2);
      const puntuacionFinal = session.getScore() + bonoTiempo;

      const finNivelParams: DatosFinNivel = {
        idNivel: this.configNivel.id,
        puntos: session.getScore(),
        monedas: session.getMonedas(),
        tiempoRestante: tiempoRestante,
      };

      // REGISTRO DE VICTORIA: Desbloqueo y Persistencia Blindada (Incluyendo Bono)
      GestorNiveles.registrarVictoria(this.configNivel.id, puntuacionFinal);

      SistemaEventos.obtener().emit(EVENTOS.NIVEL_COMPLETADO, finNivelParams);

      this.escena.scene.stop(ESCENAS.UI);

      // En lugar de redirigir directo al siguiente nivel, vamos a la pantalla de victoria
      this.escena.scene.start(ESCENAS.VICTORIA, finNivelParams);
    });
  }
}
