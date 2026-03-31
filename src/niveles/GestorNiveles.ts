import { ConfigNivel } from "@tipos/tipos-nivel";
import { ASSETS } from "@constantes/constantes-assets";
import { SistemaGuardado } from "@sistemas/SistemaGuardado";
import { EstadoSession } from "@sistemas/EstadoSession";

/**
 * Manifest Data-Driven de Niveles (Fase 3).
 * Actúa como la única fuente de verdad para la creación, enlazamiento y
 * precarga de todos los niveles del juego de manera escalable y agnóstica.
 */
const MANIFEST_NIVELES: ConfigNivel[] = [
  {
    id: "nivel-1",
    siguienteId: null, // Lógica dinámica: Secreto -> Backroom, Sin Secreto -> Nivel 3.
    nombreMapa: ASSETS.MAPA_NIVEL_01,
    rutaMapa: "assets/tilemaps/nivel-01.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_NIVEL_01,
    tiempoLimite: 50,
    nombreDisplay: "NIVEL 1 - MUNDO VERDE",
  },
  {
    id: "backroom",
    siguienteId: "nivel-2", // Progresión lineal una vez dentro del Backroom
    nombreMapa: ASSETS.MAPA_BACKROOM,
    rutaMapa: "assets/tilemaps/backroom.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_BACKROOM,
    tiempoLimite: 150,
    nombreDisplay: "NIVEL SECRETO - BACKROOMS",
  },
  {
    id: "nivel-2",
    siguienteId: "nivel-3",
    nombreMapa: ASSETS.MAPA_NIVEL_02,
    rutaMapa: "assets/tilemaps/nivel-02.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_NIVEL_02,
    tiempoLimite: 250,
    nombreDisplay: "NIVEL 2 - CAVERNAS",
  },
  {
    id: "nivel-3",
    siguienteId: "nivel-4",
    nombreMapa: ASSETS.MAPA_NIVEL_03,
    rutaMapa: "assets/tilemaps/nivel-03.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_NIVEL_03,
    tiempoLimite: 250,
    nombreDisplay: "NIVEL 3 - LOS TUBOS",
  },
  {
    id: "nivel-4",
    siguienteId: "nivel-5",
    nombreMapa: ASSETS.MAPA_NIVEL_04,
    rutaMapa: "assets/tilemaps/nivel-04.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_NIVEL_04,
    tiempoLimite: 250,
    nombreDisplay: "NIVEL 4 - ALTURAS",
  },
  {
    id: "nivel-5",
    siguienteId: null, // Meta Final
    nombreMapa: ASSETS.MAPA_NIVEL_05,
    rutaMapa: "assets/tilemaps/nivel-05.json",
    nombreTileset: ASSETS.TILESET_PRINCIPAL,
    rutaTileset: "assets/tilesets/tileset-principal.png",
    nombreMusica: ASSETS.MUSICA_NIVEL_05,
    tiempoLimite: 200,
    nombreDisplay: "NIVEL 5 - CASTILLO FINAL",
  },
];

export class GestorNiveles {
  /**
   * Obtiene la configuración completa de un nivel usando su ID único.
   */
  public static obtenerConfig(id: string): ConfigNivel {
    const config = MANIFEST_NIVELES.find((n) => n.id === id);
    if (!config) {
      throw new Error(
        `[GestorNiveles] Error crítico: No se encontró configuración para el nivel '${id}'.`,
      );
    }
    return config;
  }

  /**
   * Determina el siguiente nivelID basándose en el estado dinámico (secreto).
   * REGLA DE NEGOCIO: si hay secreto -> nivel-2, si no -> nivel-3 (Jump/Shortcut).
   */
  public static obtenerSiguienteIdDinamico(idActual: string): string | null {
    const configActual = this.obtenerConfig(idActual);

    // RAMIFICACIÓN DESDE EL NIVEL 1 (Decisión Maestra)
    if (idActual.toLowerCase().trim() === "nivel-1") {
      const secreto = EstadoSession.obtener().getNivelSecretoDesbloqueado();
      const next = secreto ? "backroom" : "nivel-2";
      console.log(
        `[GestorNiveles] Rama Nivel-1: Secreto=${secreto} -> Destino=${next}`,
      );
      return next;
    }

    return configActual.siguienteId;
  }

  /**
   * Obtiene la configuración del Nivel que está encadenado después del actual.
   * Si es el último, devuelve null.
   */
  public static obtenerSiguienteConfig(idActual: string): ConfigNivel | null {
    const siguienteId = this.obtenerSiguienteIdDinamico(idActual);
    if (!siguienteId) return null;
    return this.obtenerConfig(siguienteId);
  }

  /**
   * Retorna el arreglo completo de configuraciones.
   * Útil para iteradores de mapas base (ej: EscenaCarga) y selectores UI.
   */
  public static obtenerTodos(): ConfigNivel[] {
    return MANIFEST_NIVELES;
  }

  /**
   * Determina si un nivel está desbloqueado según el historial de guardado.
   * Valida además que el ID exista en el Manifest.
   */
  public static estaDesbloqueado(id: string): boolean {
    const progreso = SistemaGuardado.cargar();

    // El primer nivel siempre está abierto
    if (id === "nivel-1") return true;

    // Solo si el ID existe en el Manifest actual del juego
    const existeEnManifest = MANIFEST_NIVELES.some((n) => n.id === id);
    if (!existeEnManifest) return false;

    return progreso.nivelesDesbloqueados.includes(id);
  }

  /**
   * Registra la superación de un nivel de forma IDEMPOTENTE y BLINDADA.
   * Desbloquea el siguiente nivel y guarda el récord de puntos.
   */
  public static registrarVictoria(idNivel: string, puntos: number): void {
    const progreso = SistemaGuardado.cargar();

    // 1. Actualizar Récord de Puntos (Normalización: Math.max)
    const recordActual = progreso.mejoresPuntajes[idNivel] || 0;
    progreso.mejoresPuntajes[idNivel] = Math.max(recordActual, puntos);

    // 2. Desbloquear Siguiente Nivel (si existe)
    const siguienteId = this.obtenerSiguienteIdDinamico(idNivel);
    if (siguienteId) {
      console.log(
        `[GestorNiveles] Victoria en ${idNivel}. Desbloqueando por salto: ${siguienteId}`,
      );
      const nivelesSet = new Set(progreso.nivelesDesbloqueados);
      nivelesSet.add(siguienteId);
      progreso.nivelesDesbloqueados = Array.from(nivelesSet);
    } else {
      console.log(
        `[GestorNiveles] Victoria en ${idNivel}. No hay siguiente nivel para desbloquear.`,
      );
    }

    // 3. Persistir Snapshot (Capa de Persistencia Silenciosa)
    SistemaGuardado.guardar(progreso);
    console.log(
      `[GestorNiveles] Progreso actualizado. Desbloqueados:`,
      progreso.nivelesDesbloqueados,
    );
  }

  /**
   * Versión extendida de los niveles para UI/Selector.
   */
  public static obtenerEstadoProgresion() {
    return MANIFEST_NIVELES.map((n) => ({
      ...n,
      desbloqueado: this.estaDesbloqueado(n.id),
      mejorPuntaje: SistemaGuardado.cargar().mejoresPuntajes[n.id] || 0,
    }));
  }
}
