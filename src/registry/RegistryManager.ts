import Phaser from "phaser";
import { RegistryModule } from "./types";
import { JugadorRegistry } from "./jugador";
import { EnemigosRegistry } from "./enemigos";
import { ObjetosRegistry } from "./objetos";
import { UIRegistry } from "./ui";
import { AudioRegistry } from "./audio";

/**
 * Orquestador Senior de Activos y Animaciones.
 * Encargado de cargar archivos y registrar animaciones en Phaser de forma automatizada.
 */
export class RegistryManager {
  private static modulos: RegistryModule[] = [
    JugadorRegistry,
    EnemigosRegistry,
    ObjetosRegistry,
    UIRegistry,
    AudioRegistry,
  ];

  /**
   * Realiza la carga de todos los assets definidos en los registros.
   * Debe llamarse dentro del preload() de la escena de carga.
   */
  public static preloadAll(scene: Phaser.Scene): void {
    console.log("[RegistryManager] Iniciando precarga masiva...");

    this.modulos.forEach((modulo) => {
      Object.values(modulo.assets).forEach((asset) => {
        if (asset.type === "spritesheet" && asset.frameConfig) {
          scene.load.spritesheet(asset.key, asset.url, asset.frameConfig);
        } else if (asset.type === "image") {
          scene.load.image(asset.key, asset.url);
        } else if (asset.type === "audio") {
          scene.load.audio(asset.key, asset.url);
        }
      });
    });
  }

  /**
   * Crea todas las animaciones definidas en los registros.
   * Debe llamarse en el create() o tras la carga de assets.
   */
  public static createAnimations(scene: Phaser.Scene): void {
    console.log("[RegistryManager] Registrando animaciones globales...");

    this.modulos.forEach((modulo) => {
      if (!modulo.anims) return;

      Object.values(modulo.anims).forEach((anim) => {
        let finalAssetKey = anim.assetKey;
        let isFallback = false;

        if (!scene.textures.exists(finalAssetKey)) {
          console.warn(
            `[RegistryManager] Redireccionando animación '${anim.key}' al Fallback Maestro.`,
          );
          finalAssetKey = "__FALLBACK_MASTER__";
          isFallback = true;
        }

        // Si ya existe, la destruimos solo si ahora tenemos el asset real
        // (antes pudo haberse creado con el fallback)
        if (scene.anims.exists(anim.key)) {
          const animExistente = scene.anims.get(anim.key);
          const usandoFallback =
            animExistente.frames[0]?.textureKey === "__FALLBACK_MASTER__";

          if (usandoFallback && !isFallback) {
            // Teníamos fallback, ahora tenemos el real → recrear
            scene.anims.remove(anim.key);
          } else {
            return; // Ya existe con el asset correcto, saltar
          }
        }

        const texture = scene.textures.get(finalAssetKey);
        const realFrameCount = Object.keys(texture.frames).filter(
          (k) => k !== "__BASE__",
        ).length;
        const maxFrame = realFrameCount - 1;

        const startFrame = isFallback
          ? Math.min(anim.start, maxFrame)
          : anim.start;
        const endFrame = isFallback ? Math.min(anim.end, maxFrame) : anim.end;

        console.log(
          `[RegistryManager] Creando animación '${anim.key}' → '${finalAssetKey}' ` +
            `(frames reales: ${realFrameCount}, rango: ${startFrame}–${endFrame})`,
        );

        if (startFrame > maxFrame || endFrame > maxFrame) {
          console.error(
            `[RegistryManager] ⚠️ '${anim.key}' fuera de rango ` +
              `(end: ${endFrame}, max: ${maxFrame})`,
          );
          return;
        }

        scene.anims.create({
          key: anim.key,
          frames: scene.anims.generateFrameNumbers(finalAssetKey, {
            start: startFrame,
            end: endFrame,
          }),
          frameRate: anim.frameRate,
          repeat: anim.repeat,
        });
      });
    });
  }

  /**
   * Utilidad para obtener una ruta de asset específica (útil para el DOM).
   * Si no se encuentra el asset, devuelve una ruta vacía o un fallback opcional.
   */
  public static getAssetPath(assetKey: string, fallback: string = ""): string {
    for (const modulo of this.modulos) {
      if (modulo.assets[assetKey]) {
        return modulo.assets[assetKey].url;
      }
    }
    return fallback;
  }
}
