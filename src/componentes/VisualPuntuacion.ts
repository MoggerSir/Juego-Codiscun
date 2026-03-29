import Phaser from "phaser";

/**
 * Componente Visual de Feedback de Puntuación.
 * Crea textos flotantes animados con colores aleatorios vibrantes.
 */
export class VisualPuntuacion {
  private static paletaColores = [
    "#4ade80", // Verde neón
    "#fbbf24", // Dorado
    "#f472b6", // Rosa brillante
    "#22d3ee", // Cyan
    "#fb923c", // Naranja
    "#a78bfa", // Violeta
  ];

  /**
   * Crea un efecto de puntos flotantes en la posición indicada.
   */
  public static mostrar(
    escena: Phaser.Scene,
    x: number,
    y: number,
    puntos: number,
  ): void {
    const color = Phaser.Utils.Array.GetRandom(this.paletaColores);

    // Crear el objeto de texto con una escala inicial pequeña para el efecto "pop"
    const texto = escena.add
      .text(x, y, `+${puntos}`, {
        fontSize: "20px",
        fontFamily: "Verdana, Arial, sans-serif",
        fontStyle: "bold",
        color: color,
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScale(0.5);

    // Secuencia de animación "Smooth & Juice"
    escena.tweens.add({
      targets: texto,
      y: y - 80,
      alpha: { from: 1, to: 0 },
      scale: { from: 0.5, to: 1.2 },
      duration: 1500,
      ease: "Cubic.easeOut",
      onComplete: () => {
        texto.destroy();
      },
    });
  }
}
