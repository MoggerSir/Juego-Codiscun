import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

export const JugadorRegistry: RegistryModule = {
  assets: {
    [ASSETS.JUGADOR_SPRITE]: {
      key: ASSETS.JUGADOR_SPRITE,
      url: "assets/sprites/jugador/correr.png",
      type: "spritesheet",
      frameConfig: {
        frameWidth: 125,
        frameHeight: 144,
        spacing: 0,
        margin: 0,
      },
    },
  },
  anims: {
    "jugador-idle": {
      key: "jugador-idle",
      assetKey: ASSETS.JUGADOR_SPRITE,
      start: 0,
      end: 0,
      frameRate: 1, // ← bajar de 10 a 1 para animaciones de 1 solo frame
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
      start: 3,
      end: 3,
      frameRate: 1, // ← igual aquí
      repeat: 0,
    },
  },
};
