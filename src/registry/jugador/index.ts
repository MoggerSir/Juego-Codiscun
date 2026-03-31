import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para el Jugador (Mario).
 * Centraliza la configuración de assets, animaciones y audio del personaje.
 */
export const JugadorRegistry: RegistryModule = {
  assets: {
    [ASSETS.JUGADOR_SPRITE]: {
      key: ASSETS.JUGADOR_SPRITE,
      url: "assets/sprites/jugador/correr.png",
      type: "spritesheet",
      frameConfig: {
        frameWidth: 115,
        frameHeight: 130,
        spacing: 20,
      },
    }
  },
  anims: {
    "jugador-idle": {
      key: "jugador-idle",
      assetKey: ASSETS.JUGADOR_SPRITE,
      start: 0,
      end: 0,
      frameRate: 10,
      repeat: -1,
    },
    "jugador-correr": {
      key: "jugador-correr",
      assetKey: ASSETS.JUGADOR_SPRITE,
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    "jugador-saltar": {
      key: "jugador-saltar",
      assetKey: ASSETS.JUGADOR_SPRITE,
      start: 4,
      end: 4,
      frameRate: 10,
      repeat: 0,
    }
  }
};
