import Phaser from "phaser";
import { RegistryManager } from "../registry/RegistryManager";

export class AnimacionesJugador {
  /**
   * Registra las animaciones del jugador.
   * Ahora delega en el RegistryManager para mantener la centralización.
   */
  public static crear(escena: Phaser.Scene): void {
    // El RegistryManager ya se encarga de crear todas las animaciones registradas.
    // Llamamos a createAnimations aquí por si esta escena se inicia de forma independiente
    // o para asegurar que las animaciones del jugador existan.
    RegistryManager.createAnimations(escena);
  }
}
