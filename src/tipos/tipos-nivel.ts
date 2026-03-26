export interface ConfigNivel {
  clave: string;
  nombreMapa: string;
  nombreMusica: string;
  tiempoLimite: number;
}

export interface DatosNivel {
  completado: boolean;
  estrellas: number;
  mejorTiempo: number;
  monedasRecogidas: number;
}
