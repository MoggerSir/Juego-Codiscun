import Phaser from "phaser";
import { EVENTOS, SistemaEventos } from "./SistemaEventos";
import { JUEGO } from "@constantes/constantes-juego";

export class SistemaPuntuacion {
  private puntos: number = 0;
  private monedas: number = 0;
  private escena: Phaser.Scene;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
    this.registrarEscuchas();
  }

  private registrarEscuchas(): void {
    const bus = SistemaEventos.obtener(this.escena);

    bus.on(EVENTOS.PUNTUACION_SUMAR, this.sumarPuntos, this);
    bus.on(EVENTOS.MONEDA_RECOGIDA, this.sumarMoneda, this);
    
    // Al reiniciar la escena/juego, limpiamos las escuchas para evitar memory leaks
    this.escena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EVENTOS.PUNTUACION_SUMAR, this.sumarPuntos, this);
      bus.off(EVENTOS.MONEDA_RECOGIDA, this.sumarMoneda, this);
    });
  }

  private sumarPuntos(datos: { puntos: number }): void {
    this.puntos += datos.puntos;
    this.emitirCambio();
  }

  private sumarMoneda(): void {
    this.monedas += 1;
    
    // Cada X monedas, podríamos dar una vida extra
    if (this.monedas >= JUEGO.MONEDAS_VIDA_EXTRA) {
      this.monedas -= JUEGO.MONEDAS_VIDA_EXTRA;
      SistemaEventos.obtener().emit(EVENTOS.SALUD_CAMBIO, { extra: true }); 
    }
    
    this.emitirCambio();
  }

  private emitirCambio(): void {
    SistemaEventos.obtener().emit(EVENTOS.PUNTUACION_CAMBIO, { puntos: this.puntos, monedas: this.monedas });
  }

  public obtenerPuntos(): number {
    return this.puntos;
  }

  public obtenerMonedas(): number {
    return this.monedas;
  }

  public reiniciar(): void {
    this.puntos = 0;
    this.monedas = 0;
    this.emitirCambio();
  }
}
