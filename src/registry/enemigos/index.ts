import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para Enemigos.
 * Si el archivo físico no existe, el sistema usará el placeholder de EscenaCarga.
 *
 * REQUISITOS DE IMAGEN:
 *   goomba.png  → 10 columnas × 6 filas = 60 frames
 *                 Fila 2, frames 1-4: animación de movimiento
 *                 Dimensiones: 440px ancho, 264px alto.
 *   koopa.png   → mínimo 5 frames: [0-1] caminar, [4] concha.
 *                 Dimensiones: (32 × 5) = 160px ancho, 48px alto.
 *   Si los frames no existen en la imagen, RegistryManager lo detectará
 *   y abortará la animación con un error en consola en lugar de crashear.
 */
export const EnemigosRegistry: RegistryModule = {
  assets: {
    [ASSETS.GOOMBA_SPRITE]: {
      key: ASSETS.GOOMBA_SPRITE,
      url: "assets/sprites/enemigos/goomba.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 44, frameHeight: 44 },
    },
    // [ASSETS.KOOPA_SPRITE]: {
    //   key: ASSETS.KOOPA_SPRITE,
    //   url: "assets/sprites/enemigos/koopa.png",
    //   type: "spritesheet",
    //   frameConfig: { frameWidth: 32, frameHeight: 48 },
    // },
  },
  anims: {
    "goomba-caminar": {
      key: "goomba-caminar",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 10,
      end: 13,
      frameRate: 10,
      repeat: -1,
    },
    "goomba-muerte": {
      key: "goomba-muerte",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 8,
      end: 9,
      frameRate: 4,
      repeat: 0,
    },
    // "koopa-caminar": {
    //   key: "koopa-caminar",
    //   assetKey: ASSETS.KOOPA_SPRITE,
    //   start: 0,
    //   end: 1,
    //   frameRate: 6,
    //   repeat: -1,
    // },
    // "koopa-concha": {
    //   key: "koopa-consha",
    //   assetKey: ASSETS.KOOPA_SPRITE,
    //   start: 4,
    //   end: 4,
    //   frameRate: 1,
    //   repeat: 0,
    // },
  },
};
