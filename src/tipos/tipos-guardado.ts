/**
 * Estructura de datos para la persistencia del progreso del jugador.
 * Versionada para permitir migraciones futuras sin romper el guardado.
 */
export interface ProgresoJugador {
  version: number;
  personajeSeleccionado: string | null;
  nivelesDesbloqueados: string[];
  mejoresPuntajes: Record<string, number>;
  volumen?: number;
}
