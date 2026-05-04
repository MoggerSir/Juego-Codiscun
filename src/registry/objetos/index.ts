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
      type: "image",
    },
    [ASSETS.MONEDA_SPRITE]: {
      key: ASSETS.MONEDA_SPRITE,
      url: "assets/sprites/objetos/moneda.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 32 },
    },
    [ASSETS.BANDERA_SPRITE]: {
      key: ASSETS.BANDERA_SPRITE,
      url: "assets/sprites/objetos/bandera.png",
      type: "spritesheet",
      frameConfig: { frameWidth: 32, frameHeight: 64 },
    },
    [ASSETS.HONGO_SPRITE]: {
      key: ASSETS.HONGO_SPRITE,
      url: "assets/sprites/objetos/hongo.png",
      type: "image",
    },
    [ASSETS.BLOQUE_LADRILLO]: {
      key: ASSETS.BLOQUE_LADRILLO,
      url: "assets/sprites/objetos/ladrillo.png",
      type: "image",
    },
    // Para el mapa "backroom.json" e históricos
    fondo: {
      key: "fondo",
      url: "assets/sprites/objetos/background.png",
      type: "image",
    },
    
    // Añadidos dinámicos desde la nueva actualización de Tiled (nivel-01.json)
    //esto falto w, tipo debes colocar las direcciones de los tilesets que se usan en el mapa
    // para que el juego sepa que tileset usar si no no funciona el mapa xd
    coso: {
      key: "coso",
      url: "assets/sprites/objetos/tileset_64x64(new).png",
      type: "image",
    },
    background: {
      key: "background",
      url: "assets/sprites/objetos/background.png",
      type: "image",
    },
    "tileset_64x64(new)": {
      key: "tileset_64x64(new)",
      url: "assets/sprites/objetos/tileset_64x64(new).png",
      type: "image",
    },
    tileset_64x64: {
      key: "tileset_64x64",
      url: "assets/sprites/objetos/tileset_64x64(new).png",
      type: "image",
    },
  },
  anims: {
    [`${ASSETS.MONEDA_SPRITE}-anim`]: {
      key: `${ASSETS.MONEDA_SPRITE}-anim`,
      assetKey: ASSETS.MONEDA_SPRITE,
      start: 0,
      end: 3,
      frameRate: 8,
      repeat: -1,
    },
  },
};
