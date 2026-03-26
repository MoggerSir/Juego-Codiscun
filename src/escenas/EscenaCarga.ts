import Phaser from 'phaser';
import { ASSETS } from '@constantes/constantes-assets';
import { ESCENAS } from '@constantes/constantes-escenas';

export class EscenaCarga extends Phaser.Scene {
  constructor() {
    super({ key: ESCENAS.CARGA });
  }

  preload(): void {
    this.mostrarBarraCarga();

    // Generar placeholder de Tileset
    const graphicsTileset = this.make.graphics({ x: 0, y: 0 });
    graphicsTileset.fillStyle(0x00FF00);
    graphicsTileset.fillRect(0, 0, 32, 32);
    graphicsTileset.lineStyle(1, 0xFFFFFF, 0.5);
    graphicsTileset.strokeRect(0, 0, 32, 32);
    graphicsTileset.generateTexture(ASSETS.TILESET_PRINCIPAL, 32, 32);
    graphicsTileset.destroy();

    // Generar placeholder Jugador
    const gJugador = this.make.graphics({ x: 0, y: 0 });
    for (let f = 0; f < 5; f++) {
      gJugador.fillStyle(f === 4 ? 0xFF0000 : 0x3b82f6);
      gJugador.fillRect(f * 32, 0, 32, 48);
      gJugador.lineStyle(2, 0xFFFFFF);
      gJugador.strokeRect(f * 32, 0, 32, 48);
    }
    gJugador.generateTexture('temp_jugador', 32 * 5, 48);
    gJugador.destroy();

    this.load.tilemapTiledJSON(ASSETS.MAPA_NIVEL_01, 'assets/tilemaps/nivel-01.json');
  }

  create(): void {
    const tex = this.sys.textures.get('temp_jugador');
    if (tex) {
      const img = tex.getSourceImage();
      // @ts-ignore - Using undocumented feature of addSpriteSheet on canvases
      this.textures.addSpriteSheet(ASSETS.JUGADOR_SPRITE, img, { frameWidth: 32, frameHeight: 48 });
    }

    this.scene.start(ESCENAS.JUEGO);
  }

  private mostrarBarraCarga(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);
    const barra = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x4ade80);
    barra.setOrigin(0, 0.5);

    this.load.on('progress', (progreso: number) => {
      barra.width = 400 * progreso;
    });
  }
}
