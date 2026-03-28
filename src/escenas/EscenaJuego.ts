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
import { SistemaPuntuacion } from '@sistemas/SistemaPuntuacion';
import { EVENTOS, SistemaEventos } from '@sistemas/SistemaEventos';
import { Moneda } from '@entidades/objetos/Moneda';
import { BloqueLadrillo } from '@entidades/objetos/BloqueLadrillo';
import { BloqueInterrogacion } from '@entidades/objetos/BloqueInterrogacion';
import { BloqueMonedas } from '@entidades/objetos/BloqueMonedas';

export class EscenaJuego extends Phaser.Scene {
  private jugador!: Jugador;
  private grupoEnemigos!: Phaser.Physics.Arcade.Group;
  private colisiones!: SistemaColisiones;
  private capaPlataformas!: Phaser.Tilemaps.TilemapLayer;
  private sistPuntos!: SistemaPuntuacion;
  
  private grupoMonedas!: Phaser.Physics.Arcade.Group;
  private grupoBloques!: Phaser.Physics.Arcade.StaticGroup;
  private grupoPowerUps!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: ESCENAS.JUEGO });
  }

  create(): void {
    AnimacionesJugador.crear(this);
    
    const mapa = this.crearMapa();
    this.crearJugador(mapa);
    this.crearEnemigos(mapa);
    this.crearObjetos(mapa);
    new SistemaDano(this);
    this.sistPuntos = new SistemaPuntuacion(this);
    
    this.configurarFisica(mapa);
    this.configurarColisiones();
    this.configurarCamara(mapa);
    this.scene.launch(ESCENAS.UI); 
    
    // Transición a Game Over tras finalizar animación de muerte
    SistemaEventos.obtener().once(EVENTOS.JUGADOR_SIN_VIDAS, () => {
      this.scene.stop(ESCENAS.UI); // Detenemos el HUD para que no se superponga
      this.scene.start(ESCENAS.GAME_OVER, { puntos: this.sistPuntos.obtenerPuntos() });
    });
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

  private crearObjetos(mapa: Phaser.Tilemaps.Tilemap): void {
    this.grupoMonedas = this.physics.add.group();
    this.grupoBloques = this.physics.add.staticGroup();
    this.grupoPowerUps = this.physics.add.group({ runChildUpdate: true });

    // Helper para leer cada subcapa de Object Layers
    const parsearCapa = (nombreCapa: string) => {
      const capa = mapa.getObjectLayer(nombreCapa);
      
      capa?.objects.forEach(obj => {
        const x = obj.x! + (obj.width ? obj.width / 2 : 0);
        // Para Tile Objects (con GID), su Y viene anclado en la parte inferior.
        // Restar la mitad de la altura lo centra visualmente a la celda del grid.
        const y = obj.y! + (obj.height ? -obj.height / 2 : 0);

        if (obj.type === 'moneda') {
          const moneda = new Moneda(this, x, y);
          this.grupoMonedas.add(moneda);
        } else if (obj.type === 'bloque-ladrillo') {
          const bloque = new BloqueLadrillo(this, x, y);
          this.grupoBloques.add(bloque);
        } else if (obj.type === 'bloque-interrogacion') {
          const bloque = new BloqueInterrogacion(this, x, y);
          this.grupoBloques.add(bloque);
        } else if (obj.type === 'bloque-monedas') {
          const bloque = new BloqueMonedas(this, x, y);
          this.grupoBloques.add(bloque);
        }
      });
    };

    // Procesamos todas las capas de objetos interactivos
    parsearCapa('objetos-bloques');
    parsearCapa('objetos-monedas');

    // Escuchar el spawn de items dede los bloques
    SistemaEventos.obtener().on(EVENTOS.ITEM_RECOGIDO, (datos: { item: any }) => {
      this.grupoPowerUps.add(datos.item);
    });
  }

  private crearMapa(): Phaser.Tilemaps.Tilemap {
    const mapa = this.make.tilemap({ key: ASSETS.MAPA_NIVEL_01 });
    
    // Cargamos todos los tilesets necesarios
    const tilesetPrincipal = mapa.addTilesetImage('tileset-principal', ASSETS.TILESET_PRINCIPAL)!;
    // Terrenos usa 35x35 con 1px de margen, hay que especificarlo o Phaser asume 32x32 por el mapa
    const tilesetTerrenos = mapa.addTilesetImage('terrenos', ASSETS.TILESET_TERRENOS, 35, 35, 1, 0) || tilesetPrincipal; 
    
    const listaTilesets = [tilesetPrincipal, tilesetTerrenos];

    mapa.createLayer('fondo', listaTilesets, 0, 0);

    this.capaPlataformas = mapa.createLayer('plataformas', listaTilesets, 0, 0)!;
    
    // Hacemos que CUALQUIER tile con GID del 1 al 5000 sea sólido.
    // Esto es lo más agresivo y efectivo para asegurar que Mario choque con todo el terreno.
    this.capaPlataformas.setCollisionBetween(1, 5000);

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
    
    this.colisiones.registrarJugadorConMonedas(this.jugador, this.grupoMonedas);
    this.colisiones.registrarJugadorConBloques(this.jugador, this.grupoBloques);
    this.colisiones.registrarJugadorConPowerUps(this.jugador, this.grupoPowerUps);
    this.colisiones.registrarPowerUpsConMapa(this.grupoPowerUps, this.capaPlataformas);
  }

  private configurarCamara(mapa: Phaser.Tilemaps.Tilemap): void {
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
  }

  update(): void {
    this.jugador.update();
    
  }
  
}
