import Phaser from "phaser";
import { EscenaCarga } from "@escenas/EscenaCarga";
import { EscenaJuego } from "@escenas/EscenaJuego";
import { EscenaUI } from "@escenas/EscenaUI";
import { EscenaGameOver } from "@escenas/EscenaGameOver";
import { EscenaVictoria } from "@escenas/EscenaVictoria";

export const configuracionJuego: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, 
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: true, 
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    EscenaCarga, 
    EscenaJuego,
    EscenaUI,
    EscenaGameOver,
    EscenaVictoria
  ],
  parent: "game-container",
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
};
