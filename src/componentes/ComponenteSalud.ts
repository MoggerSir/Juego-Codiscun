import Phaser from 'phaser';

export interface DatosSalud {
  vidas: number;
  maxVidas: number;
}

/**
 * Componente modular para gestionar la salud (vidas) de una entidad.
 */
export class ComponenteSalud {
  private vidas: number;
  private maxVidas: number;
  private muerto: boolean = false;
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene, vidasIniciales: number = 3) {
    this.escena = escena;
    this.vidas = vidasIniciales;
    this.maxVidas = vidasIniciales;
  }

  /**
   * Reduce la salud en 1 y emite eventos de cambio.
   * @returns true si la entidad ha muerto, false si sigue viva.
   */
  public reducir(): boolean {
    if (this.muerto) return true;

    this.vidas--;
    this.notificarCambio();

    if (this.vidas <= 0) {
      this.muerto = true;
      this.escena.game.events.emit('salud:entidad-muerta');
      return true;
    }

    return false;
  }

  /**
   * Incrementa la salud en 1 sin superar el máximo actual.
   */
  public curar(): void {
    if (this.muerto) return;
    this.vidas = Math.min(this.vidas + 1, this.maxVidas);
    this.notificarCambio();
  }

  /**
   * Otorga una vida extra, incrementando también el máximo permitido.
   */
  public agregarVidaExtra(): void {
    if (this.muerto) return;
    this.maxVidas++;
    this.vidas++;
    this.notificarCambio();
  }

  /**
   * Resetea la salud al máximo.
   */
  public reiniciar(): void {
    this.vidas = this.maxVidas;
    this.muerto = false;
    this.notificarCambio();
  }

  public obtenerVidas(): number {
    return this.vidas;
  }

  public estaMuerto(): boolean {
    return this.muerto;
  }

  private notificarCambio(): void {
    this.escena.game.events.emit('salud:cambio', {
      vidas: this.vidas,
      maxVidas: this.maxVidas
    });
  }
}
