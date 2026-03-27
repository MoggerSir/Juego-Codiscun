export type EstadoEnemigo = "caminando" | "muerto";

export type EstadoKoopa = "caminando" | "concha" | "concha-movimiento";

export interface DatosEnemigo {
  velocidad: number;
  puntos: number;
}
