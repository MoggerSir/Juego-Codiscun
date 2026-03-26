// Nunca usar strings sueltos para identificar escenas
// Siempre usar estas constantes para evitar errores de typo

export const ESCENAS = {
  CARGA: "EscenaCarga",
  MENU: "EscenaMenu",
  JUEGO: "EscenaJuego",
  UI: "EscenaUI",
  GAME_OVER: "EscenaGameOver",
  VICTORIA: "EscenaVictoria",
  PAUSA: "EscenaPausa",
  NIVELES: "EscenaNiveles",
} as const;

export type ClaveEscena = (typeof ESCENAS)[keyof typeof ESCENAS];
