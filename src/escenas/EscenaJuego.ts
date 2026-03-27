import Phaser from 'phaser';
import { ESCENAS } from '@constantes/constantes-escenas';
import { ASSETS } from '@constantes/constantes-assets';
import { Jugador } from '@entidades/jugador/Jugador';
import { SistemaFisicas } from '@sistemas/SistemaFisicas';
import { SistemaColisiones } from '@sistemas/SistemaColisiones';
import { AnimacionesJugador } from '../animaciones/AnimacionesJugador';

export class EscenaJuego extends Phaser.Scene {
  private jugador!: Jugador;
  private colisiones!: SistemaColisiones;
  private capaPlataformas!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: ESCENAS.JUEGO });
  }

  create(): void {
    AnimacionesJugador.crear(this);
    
    const mapa = this.crearMapa();
    this.crearJugador(mapa);
    this.configurarFisica(mapa);
    this.configurarColisiones();
    this.configurarCamara(mapa);
    this.scene.launch(ESCENAS.UI); 
  }

  private crearMapa(): Phaser.Tilemaps.Tilemap {
    const mapa = this.make.tilemap({ key: ASSETS.MAPA_NIVEL_01 });
    const tileset = mapa.addTilesetImage('tileset-principal', ASSETS.TILESET_PRINCIPAL)!;

    mapa.createLayer('fondo', tileset, 0, 0);

    this.capaPlataformas = mapa.createLayer('plataformas', tileset, 0, 0)!;
    this.capaPlataformas.setCollisionByProperty({ colision: true });

    return mapa;
  }

  private crearJugador(mapa: Phaser.Tilemaps.Tilemap): void {
    const spawns = mapa.getObjectLayer('spawns');
    const puntoSpawn = spawns?.objects.find(o => o.name === 'spawn-jugador');

    const x = puntoSpawn?.x ?? 100;
    const y = puntoSpawn?.y ?? 400;

    this.jugador = new Jugador(this, x, y);
  }

  private configurarFisica(mapa: Phaser.Tilemaps.Tilemap): void {
    SistemaFisicas.configurarMundo(
      this,
      mapa.widthInPixels,
      mapa.heightInPixels
    );
  }

  private configurarColisiones(): void {
    this.colisiones = new SistemaColisiones(this);
    this.colisiones.registrarJugadorConMapa(this.jugador, this.capaPlataformas);
  }

  private configurarCamara(mapa: Phaser.Tilemaps.Tilemap): void {
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
  }

  update(): void {
    this.jugador.update();
    
  }
  
}
