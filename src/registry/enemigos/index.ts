import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para Enemigos.
 * Si el archivo físico no existe, el sistema usará el placeholder de EscenaCarga.
 */
export const EnemigosRegistry: RegistryModule = {
  assets: {
    [ASSETS.GOOMBA_SPRITE]: {
      key: ASSETS.GOOMBA_SPRITE,
      url: "assets/sprites/enemigos/goomba.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 32 }
    },
    [ASSETS.KOOPA_SPRITE]: {
      key: ASSETS.KOOPA_SPRITE,
      url: "assets/sprites/enemigos/koopa.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 48 }
    }
  },
  anims: {
    "goomba-caminar": {
      key: "goomba-caminar",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 0,
      end: 1,
      frameRate: 6,
      repeat: -1
    },
    "goomba-muerte": {
      key: "goomba-muerte",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 2,
      end: 2,
      frameRate: 1,
      repeat: 0
    },
    "koopa-caminar": {
      key: "koopa-caminar",
      assetKey: ASSETS.KOOPA_SPRITE,
      start: 0,
      end: 1,
      frameRate: 6,
      repeat: -1
    },
    "koopa-concha": {
      key: "koopa-concha",
      assetKey: ASSETS.KOOPA_SPRITE,
      start: 4,
      end: 4,
      frameRate: 1,
      repeat: 0
    }
  }
};
