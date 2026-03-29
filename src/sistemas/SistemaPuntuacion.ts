import Phaser from 'phaser';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';
import { JUEGO } from '@constantes/constantes-juego';
import { EstadoSession } from '@sistemas/EstadoSession';

export class SistemaPuntuacion {
  private escena: Phaser.Scene;
  private session: EstadoSession;

  constructor(escena: Phaser.Scene) {
    this.escena = escena;
    this.session = EstadoSession.obtener();
    this.registrarEscuchas();
    
    // Diferimos la emisión inicial al siguiente frame para evitar carreras de eventos
    // con la EscenaUI durante el arranque de la EscenaJuego.
    this.escena.events.once('update', () => {
      this.emitirCambio();
    });
  }

  private registrarEscuchas(): void {
    const bus = SistemaEventos.obtener();

    bus.on(EVENTOS.PUNTUACION_SUMAR, this.sumarPuntos, this);
    bus.on(EVENTOS.MONEDA_RECOGIDA, this.sumarMoneda, this);
    
    // IMPORTANTE (Regla de Oro en Phaser On/Off):
    // Limpieza direccionada con "this" para prevenir memory leaks al transicionar Escenas
    this.escena.events.once('shutdown', () => {
      bus.off(EVENTOS.PUNTUACION_SUMAR, this.sumarPuntos, this);
      bus.off(EVENTOS.MONEDA_RECOGIDA, this.sumarMoneda, this);
    });
  }

  private sumarPuntos(datos: { puntos: number }): void {
    this.session.agregarScore(datos.puntos);
    this.emitirCambio();
  }

  private sumarMoneda(): void {
    this.session.agregarMonedas(1);
    
    // Cada X monedas, podríamos dar una vida extra
    if (this.session.getMonedas() >= JUEGO.MONEDAS_VIDA_EXTRA) {
      this.session.restarMonedas(JUEGO.MONEDAS_VIDA_EXTRA);
      this.session.agregarVida();
      SistemaEventos.obtener().emit(EVENTOS.SALUD_CAMBIO, { extra: true }); 
    }
    
    this.emitirCambio();
  }

  private emitirCambio(): void {
    SistemaEventos.obtener().emit(EVENTOS.PUNTUACION_CAMBIO, { 
      puntos: this.session.getScore(), 
      monedas: this.session.getMonedas(),
      vidas: this.session.getVidas() // Emitimos vidas actualizadas para UI global
    });
  }

  public obtenerPuntos(): number {
    return this.session.getScore();
  }

  public obtenerMonedas(): number {
    return this.session.getMonedas();
  }
}
