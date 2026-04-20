import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para Objetos, Tilesets e Ítems.
 */
export const ObjetosRegistry: RegistryModule = {
  assets: {
    [ASSETS.TILESET_TERRENOS]: {
      key: ASSETS.TILESET_TERRENOS,
      url: "assets/sprites/objetos/terrenos.png",
      type: "image"
    },
    [ASSETS.MONEDA_SPRITE]: {
      key: ASSETS.MONEDA_SPRITE,
      url: "assets/sprites/objetos/moneda.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 32 }
    },
    [ASSETS.BANDERA_SPRITE]: {
      key: ASSETS.BANDERA_SPRITE,
      url: "assets/sprites/objetos/bandera.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 64 }
    },
    [ASSETS.HONGO_SPRITE]: {
      key: ASSETS.HONGO_SPRITE,
      url: "assets/sprites/objetos/hongo.png",
      type: "image"
    },
    [ASSETS.BLOQUE_LADRILLO]: {
      key: ASSETS.BLOQUE_LADRILLO,
      url: "assets/sprites/objetos/ladrillo.png",
      type: "image"
    },
    // Añadido dinámico desde Tiled
    "coso": {
      key: "coso",
      url: "assets/sprites/objetos/tileset.png",
      type: "image"
    }
  },
  anims: {
    [`${ASSETS.MONEDA_SPRITE}-anim`]: {
      key: `${ASSETS.MONEDA_SPRITE}-anim`,
      assetKey: ASSETS.MONEDA_SPRITE,
      start: 0,
      end: 3,
      frameRate: 8,
      repeat: -1
    }
  }
};
