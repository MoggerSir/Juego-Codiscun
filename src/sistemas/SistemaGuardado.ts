import { ProgresoJugador } from "@tipos/tipos-guardado";

/**
 * Capa de Persistencia Agnóstica (Capa Baja).
 * Se encarga de la lectura/escritura segura en localStorage.
 * No conoce la lógica de los niveles, solo gestiona el objeto de progreso.
 */
export class SistemaGuardado {
  private static readonly CLAVE_STORAGE = "mario_empresa_progreso";
  private static readonly VERSION_ACTUAL = 1;

  private static readonly ESTADO_INICIAL: ProgresoJugador = {
    version: SistemaGuardado.VERSION_ACTUAL,
    nivelesDesbloqueados: ["nivel-1"],
    mejoresPuntajes: {},
  };

  /**
   * Carga el progreso del jugador de forma segura.
   * Valida integridad y versión. Resetea si detecta corrupción fatal.
   */
  public static cargar(): ProgresoJugador {
    try {
      const raw = localStorage.getItem(this.CLAVE_STORAGE);
      if (!raw) return { ...this.ESTADO_INICIAL }; // Spread para evitar mutar el estático

      const parsed: ProgresoJugador = JSON.parse(raw);

      // Validación de integridad mínima y versión
      if (
        !parsed ||
        typeof parsed !== "object" ||
        parsed.version !== this.VERSION_ACTUAL ||
        !Array.isArray(parsed.nivelesDesbloqueados)
      ) {
        console.warn("[SistemaGuardado] Datos corruptos o versión obsoleta. Reiniciando...");
        return { ...this.ESTADO_INICIAL };
      }

      // Asegurar que nivel-1 SIEMPRE esté presente por contrato
      if (!parsed.nivelesDesbloqueados.includes("nivel-1")) {
        parsed.nivelesDesbloqueados.push("nivel-1");
      }

      return parsed;
    } catch (e) {
      console.error("[SistemaGuardado] Error crítico al parsear localStorage:", e);
      return { ...this.ESTADO_INICIAL };
    }
  }

  /**
   * Guarda el progreso del jugador de forma silenciosa.
   * Maneja fallos de cuota o bloqueos de storage sin interrumpir el juego.
   */
  public static guardar(datos: ProgresoJugador): void {
    try {
      const serializado = JSON.stringify(datos);
      localStorage.setItem(this.CLAVE_STORAGE, serializado);
      console.log("[SistemaGuardado] Datos guardados en LocalStorage.");
    } catch (e) {
      // Manejo Silencioso (Fail-Safe): 
      // Si el storage está lleno (QuotaExceeded) o bloqueado, logueamos pero no crasheamos.
      console.warn("[SistemaGuardado] No se pudo persistir el progreso:", e);
    }
  }

  /**
   * Borra todo el progreso del jugador.
   */
  public static borrar(): void {
    try {
      localStorage.removeItem(this.CLAVE_STORAGE);
    } catch (e) {
      console.warn("[SistemaGuardado] Error al borrar progreso:", e);
    }
  }
}
