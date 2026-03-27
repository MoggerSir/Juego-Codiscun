import Phaser from 'phaser';
import { ESCENAS } from '@constantes/constantes-escenas';
import { ASSETS } from '@constantes/constantes-assets';
import { Jugador } from '@entidades/jugador/Jugador';
import { Goomba } from '@entidades/enemigos/Goomba';
import { Koopa } from '@entidades/enemigos/Koopa';
import { SistemaFisicas } from '@sistemas/SistemaFisicas';
import { SistemaColisiones } from '@sistemas/SistemaColisiones';
import { SistemaDano } from '@sistemas/SistemaDano';
import { AnimacionesJugador } from '../animaciones/AnimacionesJugador';

export class EscenaJuego extends Phaser.Scene {
  private jugador!: Jugador;
  private grupoEnemigos!: Phaser.Physics.Arcade.Group;
  private colisiones!: SistemaColisiones;
  private capaPlataformas!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: ESCENAS.JUEGO });
  }

  create(): void {
    AnimacionesJugador.crear(this);
    
    const mapa = this.crearMapa();
    this.crearJugador(mapa);
    this.crearEnemigos(mapa); // Nuevo: spawn de enemigos
    new SistemaDano(this);
    this.configurarFisica(mapa);
    this.configurarColisiones();
    this.configurarCamara(mapa);
    this.scene.launch(ESCENAS.UI); 
  }

  private crearEnemigos(mapa: Phaser.Tilemaps.Tilemap): void {
    this.grupoEnemigos = this.physics.add.group({ runChildUpdate: true });
    
    // Leemos la capa de objetos 'enemigos' definida en Tiled
    const capaObjetos = mapa.getObjectLayer('enemigos');
    
    capaObjetos?.objects.forEach(obj => {
      const x = obj.x! + (obj.width ? obj.width / 2 : 0);
      const y = obj.y! + (obj.height ? -obj.height / 2 : 0);

      // Usamos el campo 'type' de Tiled para saber qué clase instanciar
      if (obj.type === 'goomba') {
        const goomba = new Goomba(this, x, y, this.capaPlataformas);
        this.grupoEnemigos.add(goomba);
      } else if (obj.type === 'koopa') {
        const koopa = new Koopa(this, x, y, this.capaPlataformas);
        this.grupoEnemigos.add(koopa);
      }
    });
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
    this.colisiones.registrarJugadorConEnemigos(this.jugador, this.grupoEnemigos);
    this.colisiones.registrarEnemigosConMapa(this.grupoEnemigos, this.capaPlataformas);
  }

  private configurarCamara(mapa: Phaser.Tilemaps.Tilemap): void {
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
  }

  update(): void {
    this.jugador.update();
    
  }
  
}
