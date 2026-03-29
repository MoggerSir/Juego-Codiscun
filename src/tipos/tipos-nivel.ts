export interface ConfigNivel {
  id: string;              // Identificador único desacoplado del índice (ej: 'nivel-1')
  siguienteId: string | null; // ID del siguiente nivel lógico a cargar, null si es el último
  nombreMapa: string;      // Clave del asset en Phaser (ej: 'mapa-nivel-01')
  rutaMapa: string;        // Ruta al archivo JSON de Tiled
  nombreTileset: string;   // Clave del tileset principal (ej: 'tileset-principal')
  rutaTileset: string;     // Ruta de la imagen del tileset
  nombreMusica: string;    // Clave de audio de fondo
  tiempoLimite: number;    // Segundos disponibles (0 = sin límite)
  nombreDisplay: string;   // Nombre humano visible en UI (ej: 'NIVEL 1 - MUNDO VERDE')
}

export interface DatosFinNivel {
  idNivel: string;
  puntos: number;
  monedas: number;
  tiempoRestante: number;
}
