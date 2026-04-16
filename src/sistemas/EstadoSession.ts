export interface SessionData {
  vidas: number;
  score: number;
  monedas: number;
}

const VIDAS_INICIALES = 1;

export enum EstadoJuego {
  JUGANDO = "JUGANDO",
  FALLANDO = "FALLANDO",
  NIVEL_COMPLETADO = "NIVEL_COMPLETADO",
  MOSTRANDO_INFO = "MOSTRANDO_INFO",
}

export class EstadoSession {
  private static instancia: EstadoSession;
  
  private vidas: number;
  private score: number;
  private monedas: number;
  private idNivelActual: string = "nivel-1";
  private estado: EstadoJuego = EstadoJuego.JUGANDO;
  private nivelSecretoDesbloqueado: boolean = false;
  private idPersonajeActual: string = "fernanda";

  private constructor() {
    this.vidas = VIDAS_INICIALES;
    this.score = 0;
    this.monedas = 0;
    this.estado = EstadoJuego.JUGANDO;
    this.nivelSecretoDesbloqueado = false;
  }

  public static obtener(): EstadoSession {
    if (!EstadoSession.instancia) {
      EstadoSession.instancia = new EstadoSession();
    }
    return EstadoSession.instancia;
  }

  public getNivelSecretoDesbloqueado(): boolean {
    return this.nivelSecretoDesbloqueado;
  }

  public setNivelSecretoDesbloqueado(valor: boolean): void {
    this.nivelSecretoDesbloqueado = valor;
    if (valor) {
      console.log("[Session] ¡Nivel Secreto DESBLOQUEADO!");
    }
  }

  public getVidas(): number {
    return this.vidas;
  }

  public getScore(): number {
    return this.score;
  }

  public getMonedas(): number {
    return this.monedas;
  }

  public getIdPersonajeActual(): string {
    return this.idPersonajeActual;
  }

  public setIdPersonajeActual(id: string): void {
    this.idPersonajeActual = id;
  }

  public getIdNivelActual(): string {
    return this.idNivelActual;
  }

  public setIdNivelActual(id: string): void {
    this.idNivelActual = id;
  }

  public getEstado(): EstadoJuego {
    return this.estado;
  }

  public setEstado(nuevoEstado: EstadoJuego): void {
    this.estado = nuevoEstado;
    console.log(`[Session] Cambio de Estado Global: ${this.estado}`);
  }

  public agregarScore(puntos: number): void {
    this.score += puntos;
  }

  public agregarMonedas(cantidad: number = 1): void {
    this.monedas += cantidad;
  }

  public restarMonedas(cantidad: number): void {
    this.monedas -= cantidad;
  }

  public agregarVida(): void {
    this.vidas += 1;
  }

  public restarVida(): void {
    this.vidas -= 1;
  }

  public forzarGameOver(): void {
    this.vidas = 0;
  }

  /**
   * Reseteo Parcial: El jugador muere pero aún le quedan vidas.
   * La puntuación y las monedas actuales se reducen a un punto de guardado (checkpoint lógico) 
   * o se conservan, pero se pierde estrictamente una vida.
   */
  public resetParcial(): void {
    this.restarVida();
    // En un Super Mario real, al reiniciar te quitan las monedas y puntos que ganaste 
    // en el tramo antes de morir si no llegaste a un checkpoint duro. 
    // Por simplicidad, conservamos el puntaje aquí, solo pierde la vida.
  }

  /**
   * Reseteo Total: Se ejecuta tras un Game Over o al presionar 'Nueva Partida'.
   * Regresa la sesión al estado predeterminado de fábrica.
   */
  public resetTotal(): void {
    this.vidas = VIDAS_INICIALES;
    this.score = 0;
    this.monedas = 0;
    this.estado = EstadoJuego.JUGANDO;
    this.nivelSecretoDesbloqueado = false;
  }
}
