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
 *   koopa-caminar.png → strip vertical 16×32 → 2 celdas 16×16 (caminar).
 *   koopa-concha.png  → strip horizontal 64×16 → 4 celdas 16×16 (giro de concha).
 *   tanque.png  → 1 fila × 6 columnas (432×72 → celdas 72×72).
 *                 Animación de marcha: frames [0–5].
 *   volador.png → strip horizontal 10240×128 → 80 celdas de 128×128.
 *                 Primera mitad [0–39] otro personaje/ciclo; enemigo volador usa [40–79].
 *                 Si el arte está ordenado al revés, intercambia el rango en `volador-caminar`.
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
    [ASSETS.TANQUE_SPRITE]: {
      key: ASSETS.TANQUE_SPRITE,
      url: "assets/sprites/enemigos/tanque.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 72, frameHeight: 72 },
    },
    [ASSETS.VOLADOR_SPRITE]: {
      key: ASSETS.VOLADOR_SPRITE,
      url: "assets/sprites/enemigos/volador.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 128, frameHeight: 128 },
    },
    [ASSETS.KOOPA_SPRITE]: {
      key: ASSETS.KOOPA_SPRITE,
      url: "assets/sprites/enemigos/koopa-caminar.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 16, frameHeight: 16 },
    },
    [ASSETS.KOOPA_CONCHA_SPRITE]: {
      key: ASSETS.KOOPA_CONCHA_SPRITE,
      url: "assets/sprites/enemigos/koopa-concha.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 16, frameHeight: 16 },
    },
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
      start: 10,
      end: 13,
      frameRate: 12,
      repeat: 0,
    },
    "tanque-caminar": {
      key: "tanque-caminar",
      assetKey: ASSETS.TANQUE_SPRITE,
      start: 0,
      end: 5,
      frameRate: 9,
      repeat: -1,
    },
    "tanque-muerte": {
      key: "tanque-muerte",
      assetKey: ASSETS.TANQUE_SPRITE,
      start: 3,
      end: 5,
      frameRate: 14,
      repeat: 0,
    },
    "volador-caminar": {
      key: "volador-caminar",
      assetKey: ASSETS.VOLADOR_SPRITE,
      start: 40,
      end: 79,
      frameRate: 16,
      repeat: -1,
    },
    "volador-muerte": {
      key: "volador-muerte",
      assetKey: ASSETS.VOLADOR_SPRITE,
      start: 79,
      end: 79,
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
    "koopa-concha": {
      key: "koopa-concha",
      assetKey: ASSETS.KOOPA_CONCHA_SPRITE,
      start: 0,
      end: 0,
      frameRate: 1,
      repeat: -1,
    },
    "koopa-concha-giro": {
      key: "koopa-concha-giro",
      assetKey: ASSETS.KOOPA_CONCHA_SPRITE,
      start: 0,
      end: 3,
      frameRate: 12,
      repeat: -1,
    },
  },
};
