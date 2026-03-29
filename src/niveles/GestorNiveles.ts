import { ConfigNivel } from '@tipos/tipos-nivel';
import { ASSETS } from '@constantes/constantes-assets';

/**
 * Manifest Data-Driven de Niveles (Fase 3).
 * Actúa como la única fuente de verdad para la creación, enlazamiento y 
 * precarga de todos los niveles del juego de manera escalable y agnóstica.
 */
const MANIFEST_NIVELES: ConfigNivel[] = [
  {
    id: 'nivel-1',
    siguienteId: 'nivel-2',
    nombreMapa: ASSETS.MAPA_NIVEL_01,
    rutaMapa: 'assets/tilemaps/nivel-01.json',
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: 'assets/tilesets/tileset-principal.png',
    nombreMusica: ASSETS.MUSICA_NIVEL_01,
    tiempoLimite: 300,
    nombreDisplay: 'NIVEL 1 - MUNDO VERDE'
  },
  {
    id: 'nivel-2',
    siguienteId: 'nivel-3',
    nombreMapa: ASSETS.MAPA_NIVEL_02,
    rutaMapa: 'assets/tilemaps/nivel-02.json',
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: 'assets/tilesets/tileset-principal.png',
    nombreMusica: ASSETS.MUSICA_NIVEL_02,
    tiempoLimite: 250,
    nombreDisplay: 'NIVEL 2 - CAVERNAS'
  },
  {
    id: 'nivel-3',
    siguienteId: 'nivel-4',
    nombreMapa: ASSETS.MAPA_NIVEL_03,
    rutaMapa: 'assets/tilemaps/nivel-03.json',
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: 'assets/tilesets/tileset-principal.png',
    nombreMusica: ASSETS.MUSICA_NIVEL_03,
    tiempoLimite: 250,
    nombreDisplay: 'NIVEL 3 - LOS TUBOS'
  },
  {
    id: 'nivel-4',
    siguienteId: 'nivel-5',
    nombreMapa: ASSETS.MAPA_NIVEL_04,
    rutaMapa: 'assets/tilemaps/nivel-04.json',
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: 'assets/tilesets/tileset-principal.png',
    nombreMusica: ASSETS.MUSICA_NIVEL_04,
    tiempoLimite: 250,
    nombreDisplay: 'NIVEL 4 - ALTURAS'
  },
  {
    id: 'nivel-5',
    siguienteId: null, // Meta Final
    nombreMapa: ASSETS.MAPA_NIVEL_05,
    rutaMapa: 'assets/tilemaps/nivel-05.json',
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: 'assets/tilesets/tileset-principal.png',
    nombreMusica: ASSETS.MUSICA_NIVEL_05,
    tiempoLimite: 200,
    nombreDisplay: 'NIVEL 5 - CASTILLO FINAL'
  }
];

export class GestorNiveles {
  /**
   * Obtiene la configuración completa de un nivel usando su ID único.
   */
  public static obtenerConfig(id: string): ConfigNivel {
    const config = MANIFEST_NIVELES.find(n => n.id === id);
    if (!config) {
      throw new Error(`[GestorNiveles] Error crítico: No se encontró configuración para el nivel '${id}'.`);
    }
    return config;
  }

  /**
   * Obtiene la configuración del Nivel que está encadenado después del actual.
   * Si es el último, devuelve null.
   */
  public static obtenerSiguienteConfig(idActual: string): ConfigNivel | null {
    const configActual = this.obtenerConfig(idActual);
    if (!configActual.siguienteId) return null;
    return this.obtenerConfig(configActual.siguienteId);
  }

  /**
   * Retorna el arreglo completo de configuraciones.
   * Útil para iteradores de mapas base (ej: EscenaCarga) y selectores UI.
   */
  public static obtenerTodos(): ConfigNivel[] {
    return MANIFEST_NIVELES;
  }
}
