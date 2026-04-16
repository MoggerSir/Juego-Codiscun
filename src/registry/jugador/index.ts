import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

export const JugadorRegistry: RegistryModule = {
  assets: {
    [ASSETS.JUGADOR_FERNANDA_SPRITE]: {
      key: ASSETS.JUGADOR_FERNANDA_SPRITE,
      url: "assets/sprites/jugador/correr.png",
      type: "spritesheet",
      frameConfig: {
        frameWidth: 125,
        frameHeight: 144,
        spacing: 0,
        margin: 0,
      },
    },
    [ASSETS.JUGADOR_HARRY_SPRITE]: {
      key: ASSETS.JUGADOR_HARRY_SPRITE,
      url: "assets/sprites/jugador2/correr.png",
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
    // ANIMACIONES FERNANDA
    "fernanda-idle": {
      key: "fernanda-idle",
      assetKey: ASSETS.JUGADOR_FERNANDA_SPRITE,
      start: 0,
      end: 0,
      frameRate: 1,
      repeat: -1,
    },
    "fernanda-correr": {
      key: "fernanda-correr",
      assetKey: ASSETS.JUGADOR_FERNANDA_SPRITE,
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    "fernanda-saltar": {
      key: "fernanda-saltar",
      assetKey: ASSETS.JUGADOR_FERNANDA_SPRITE,
      start: 3,
      end: 3,
      frameRate: 1,
      repeat: 0,
    },

    // ANIMACIONES HARRY
    "harry-idle": {
      key: "harry-idle",
      assetKey: ASSETS.JUGADOR_HARRY_SPRITE,
      start: 0,
      end: 0,
      frameRate: 1,
      repeat: -1,
    },
    "harry-correr": {
      key: "harry-correr",
      assetKey: ASSETS.JUGADOR_HARRY_SPRITE,
      start: 0,
      end: 7,
      frameRate: 10,
      repeat: -1,
    },
    "harry-saltar": {
      key: "harry-saltar",
      assetKey: ASSETS.JUGADOR_HARRY_SPRITE,
      start: 3,
      end: 3,
      frameRate: 1,
      repeat: 0,
    },
  },
};
