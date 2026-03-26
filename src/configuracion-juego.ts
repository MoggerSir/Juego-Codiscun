import Phaser from "phaser";
import { EscenaCarga } from "@escenas/EscenaCarga";
import { EscenaJuego } from "@escenas/EscenaJuego";

export const configuracionJuego: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, 
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false, 
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    EscenaCarga, 
    EscenaJuego
  ],
  parent: "game-container",
};
