import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para Audio (Música y SFX).
 * Centraliza las rutas de archivos de sonido para ser cargados automáticamente.
 */
export const AudioRegistry: RegistryModule = {
  assets: {
    // Música General (Menús)
    [ASSETS.MUSICA_MENU]: {
      key: ASSETS.MUSICA_MENU,
      url: "assets/audio/musica/menu-music.mp3",
      type: "audio",
    },

    // Música por Niveles
    [ASSETS.MUSICA_NIVEL_01]: {
      key: ASSETS.MUSICA_NIVEL_01,
      url: "assets/audio/musica/nivel-01.mp3",
      type: "audio",
    },
    [ASSETS.MUSICA_NIVEL_02]: {
      key: ASSETS.MUSICA_NIVEL_02,
      url: "assets/audio/musica/nivel-02.mp3",
      type: "audio",
    },
    [ASSETS.MUSICA_NIVEL_03]: {
      key: ASSETS.MUSICA_NIVEL_03,
      url: "assets/audio/musica/nivel-03.mp3",
      type: "audio",
    },
    [ASSETS.MUSICA_NIVEL_04]: {
      key: ASSETS.MUSICA_NIVEL_04,
      url: "assets/audio/musica/nivel-04.mp3",
      type: "audio",
    },
    [ASSETS.MUSICA_NIVEL_05]: {
      key: ASSETS.MUSICA_NIVEL_05,
      url: "assets/audio/musica/nivel-05.mp3",
      type: "audio",
    },

    // Efectos de Sonido (SFX)
    [ASSETS.SFX_SALTO]: {
      key: ASSETS.SFX_SALTO,
      url: "assets/audio/efectos/salto.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MONEDA]: {
      key: ASSETS.SFX_MONEDA,
      url: "assets/audio/efectos/moneda.mp3",
      type: "audio",
    },
    [ASSETS.SFX_ROMPER_BLOQUE]: {
      key: ASSETS.SFX_ROMPER_BLOQUE,
      url: "assets/audio/efectos/romper-bloque.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MUERTE]: {
      key: ASSETS.SFX_MUERTE,
      url: "assets/audio/efectos/muerte.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MUERTE_GOOMBA]: {
      key: ASSETS.SFX_MUERTE_GOOMBA,
      url: "assets/audio/efectos/goomba-death.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MUERTE_KOOPA]: {
      key: ASSETS.SFX_MUERTE_KOOPA,
      url: "assets/audio/efectos/koopa-death.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MUERTE_VOLADOR]: {
      key: ASSETS.SFX_MUERTE_VOLADOR,
      url: "assets/audio/efectos/volador-death.mp3",
      type: "audio",
    },
    [ASSETS.SFX_MUERTE_TANQUE]: {
      key: ASSETS.SFX_MUERTE_TANQUE,
      url: "assets/audio/efectos/tanque-death.mp3",
      type: "audio",
    },
    [ASSETS.SFX_VICTORIA]: {
      key: ASSETS.SFX_VICTORIA,
      url: "assets/audio/efectos/victory.mp3",
      type: "audio",
    },
    [ASSETS.SFX_TIEMPO_ALERTA]: {
      key: ASSETS.SFX_TIEMPO_ALERTA,
      url: "assets/audio/efectos/hurry-up.mp3",
      type: "audio",
    },
    [ASSETS.SFX_POWER_UP]: {
      key: ASSETS.SFX_POWER_UP,
      url: "assets/audio/efectos/power-up.mp3",
      type: "audio",
    },
  },
};
