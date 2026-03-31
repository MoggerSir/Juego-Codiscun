import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para Enemigos.
 * Si el archivo físico no existe, el sistema usará el placeholder de EscenaCarga.
 *
 * REQUISITOS DE IMAGEN:
 *   goomba.png  → mínimo 3 frames: [0-1] caminar, [2] muerte.
 *                 Dimensiones: (32 × 3) = 96px ancho, 32px alto.
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
      frameConfig: { frameWidth: 32, frameHeight: 32 },
    },
    [ASSETS.KOOPA_SPRITE]: {
      key: ASSETS.KOOPA_SPRITE,
      url: "assets/sprites/enemigos/koopa.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 48 },
    },
  },
  anims: {
    "goomba-caminar": {
      key: "goomba-caminar",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 0,
      end: 1,
      frameRate: 6,
      repeat: -1,
    },
    "goomba-muerte": {
      key: "goomba-muerte",
      assetKey: ASSETS.GOOMBA_SPRITE,
      start: 2,
      end: 2,
      frameRate: 1,
      repeat: 0,
    },
    "koopa-caminar": {
      key: "koopa-caminar",
      assetKey: ASSETS.KOOPA_SPRITE,
      start: 0,
      end: 1,
      frameRate: 6,
      repeat: -1,
    },
    // ⚠️ Este frame requiere que koopa.png tenga al menos 5 columnas (frames 0–4).
    // Si no existe, RegistryManager lo bloqueará con un error en consola.
    "koopa-concha": {
      key: "koopa-concha",
      assetKey: ASSETS.KOOPA_SPRITE,
      start: 4,
      end: 4,
      frameRate: 1,
      repeat: 0,
    },
  },
};
