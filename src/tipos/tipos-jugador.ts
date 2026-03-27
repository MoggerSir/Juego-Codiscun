export type EstadoJugador =
  | 'idle'
  | 'corriendo'
  | 'saltando'
  | 'cayendo'
  | 'muerto'
  | 'invencible'
  | 'normal'
  | 'grande';

export interface InputJugador {
  izquierda: boolean;
  derecha: boolean;
  saltar: boolean;
}

export interface DatosJugador {
  vidas: number;
  monedas: number;
  puntos: number;
  estado: EstadoJugador;
}
