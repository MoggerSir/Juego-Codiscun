import { RegistryModule } from "../types";
import { ASSETS } from "../../constantes/constantes-assets";

/**
 * Módulo de Registro para la Interfaz de Usuario (UI).
 * Esto permite centralizar las rutas de iconos usados tanto en Phaser como en el DOM.
 */
export const UIRegistry: RegistryModule = {
  assets: {
    [ASSETS.UI_GEAR]: {
      key: ASSETS.UI_GEAR,
      url: "assets/ui/gear.png",
      type: "image"
    },
    [ASSETS.UI_LOCK]: {
      key: ASSETS.UI_LOCK,
      url: "assets/ui/lock.png",
      type: "image"
    },
    [ASSETS.UI_UNLOCK]: {
      key: ASSETS.UI_UNLOCK,
      url: "assets/ui/unlock.png",
      type: "image"
    },
    [ASSETS.UI_CHECK]: {
      key: ASSETS.UI_CHECK,
      url: "assets/ui/check.png",
      type: "image"
    }
  }
};
