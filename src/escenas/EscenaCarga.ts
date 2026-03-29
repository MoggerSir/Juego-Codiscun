import Phaser from 'phaser';
import { ASSETS } from '@constantes/constantes-assets';
import { ESCENAS } from '@constantes/constantes-escenas';
import { GestorNiveles } from '@niveles/GestorNiveles';

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
    
    // Generar placeholder Moneda
    const gMoneda = this.make.graphics({ x: 0, y: 0 });
    for (let f = 0; f < 4; f++) {
      gMoneda.fillStyle(0xFFD700); // Dorado
      gMoneda.fillCircle(16 + (f * 32), 16, 12);
      gMoneda.lineStyle(2, 0xFFAA00);
      gMoneda.strokeCircle(16 + (f * 32), 16, 12);
    }
    gMoneda.generateTexture('temp_moneda', 32 * 4, 32);
    gMoneda.destroy();

    // Generar placeholder Bandera (Fase 3)
    const gBandera = this.make.graphics({ x: 0, y: 0 });
    gBandera.fillStyle(0xFFFFFF, 1); // Palo blanco
    gBandera.fillRect(14, 0, 4, 64);
    gBandera.fillStyle(0xFF0000, 1); // Bandera roja
    gBandera.fillRect(14, 0, 18, 20);
    gBandera.generateTexture(ASSETS.BANDERA_SPRITE, 32, 64);
    gBandera.destroy();

    // Precarga dinámica de todos los mapas del juego basados en el Manifest Data-Driven
    GestorNiveles.obtenerTodos().forEach(config => {
      this.load.tilemapTiledJSON(config.nombreMapa, config.rutaMapa);
      // Aquí también se cargaría la música dinámica: this.load.audio(config.nombreMusica, config.rutaMusica);
    });
    
    // Intentar cargar la imagen real. Si no existe, el juego mostrará un cuadrado verde por defecto
    // Pero para evitar el error de consola, podemos registrarla.
    this.load.image(ASSETS.TILESET_TERRENOS, 'assets/sprites/objetos/terrenos.png');
  }

  create(): void {
    const tex = this.sys.textures.get('temp_jugador');
    if (tex) {
      const img = tex.getSourceImage();
      // @ts-ignore - Using undocumented feature of addSpriteSheet on canvases
      this.textures.addSpriteSheet(ASSETS.JUGADOR_SPRITE, img, { frameWidth: 32, frameHeight: 48 });
    }
    
    const texMoneda = this.sys.textures.get('temp_moneda');
    if (texMoneda) {
      const img = texMoneda.getSourceImage();
      // @ts-ignore
      this.textures.addSpriteSheet(ASSETS.MONEDA_SPRITE, img, { frameWidth: 32, frameHeight: 32 });
    }
    
    // Crear sprite anim de moneda (placeholder)
    this.anims.create({
      key: `${ASSETS.MONEDA_SPRITE}-anim`,
      frames: this.anims.generateFrameNumbers(ASSETS.MONEDA_SPRITE, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

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
