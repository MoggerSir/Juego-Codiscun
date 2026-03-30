import { ListaMensajes } from "@tipos/tipos-objetos";

export const BASE_DATOS_MENSAJES: ListaMensajes = {
  "bienvenida": {
    titulo: "BIENVENIDO",
    mensaje: "Estás jugando la versión de prueba de Mario Empresa por Codicun. ¡Diviértete!",
    colorBorde: "var(--neon-cyan)"
  },
  "instrucciones": {
    titulo: "CONTROLES",
    mensaje: "Usa las flechas para moverte. Mantén arriba para saltar más alto.",
    colorBorde: "var(--neon-gold)"
  },
  "secreto": {
    titulo: "¡SHHH!",
    mensaje: "Has encontrado un mensaje oculto. Sigue explorando para encontrar más.",
    colorBorde: "var(--neon-red)"
  }
};
