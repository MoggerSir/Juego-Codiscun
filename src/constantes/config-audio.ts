/**
 * Centralización Maestra de Configuración de Audio.
 */
export const CONFIG_AUDIO = {
  volumenMaestro: 0.5,

  /**
   * MULTIPLICADORES INDIVIDUALES
   * Aquí puedes ajustar el volumen de cada sonido por separado.
   * Valores de 0.0 a 1.0
   */
  detalles: {
    "sfx-salto": 0.2,
    "sfx-moneda": 0.6,
    "sfx-muerte": 0.7,
    "sfx-muerte-goomba": 0.6,
    "sfx-muerte-koopa": 0.6,
    "sfx-muerte-tanque": 0.8,
    "sfx-victoria": 1.0,
    "sfx-tiempo-alerta": 0.7,
    "sfx-romper-bloque": 0.5,
    "sfx-power-up": 0.7,
    // Música (Multiplicadores para música de fondo)
    "menu-music": 0.6,
    "musica-nivel-01": 1.0,
    "musica-nivel-02": 0.5,
    "musica-nivel-03": 0.5,
    "musica-nivel-04": 0.5,
    "musica-nivel-05": 0.5,
    "musica-backroom": 0.4,
  } as Record<string, number>,

  /**
   * Calcula el volumen final combinando el maestro con el individual del asset.
   */
  obtenerVolumen: (key: string): number => {
    const multiplicador = CONFIG_AUDIO.detalles[key] ?? 1.0;
    return CONFIG_AUDIO.volumenMaestro * multiplicador;
  },

  /**
   * Actualiza el volumen maestro y lo sincroniza con Phaser.
   */
  aplicarVolumen: (scene: Phaser.Scene | null, valor: number) => {
    CONFIG_AUDIO.volumenMaestro = Math.max(0, Math.min(1, valor));
    if (scene && scene.sound) {
      scene.sound.volume = CONFIG_AUDIO.volumenMaestro;
    }
  },
};
