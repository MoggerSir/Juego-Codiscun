import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ASSETS } from "@constantes/constantes-assets";
import { Jugador, EstadoLogicoJugador } from "@entidades/jugador/Jugador";
import { FabricaEnemigos } from "@entidades/enemigos/FabricaEnemigos";
import { SistemaFisicas } from "@sistemas/SistemaFisicas";
import { SistemaColisiones } from "@sistemas/SistemaColisiones";
import { SistemaDano } from "@sistemas/SistemaDano";
import { AnimacionesJugador } from "../animaciones/AnimacionesJugador";
import { SistemaPuntuacion } from "@sistemas/SistemaPuntuacion";
import { EVENTOS, SistemaEventos } from "@sistemas/SistemaEventos";
import { Moneda } from "@entidades/objetos/Moneda";
import { EstadoSession, EstadoJuego } from "@sistemas/EstadoSession";
import { BloqueLadrillo } from "@entidades/objetos/BloqueLadrillo";
import { BloqueInterrogacion } from "@entidades/objetos/BloqueInterrogacion";
import { BloqueMonedas } from "@entidades/objetos/BloqueMonedas";
import { ConfigNivel } from "@tipos/tipos-nivel";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { LevelFlowManager } from "@sistemas/LevelFlowManager";
import { Bandera } from "@entidades/objetos/Bandera";
// import { EstadoSession } from '@sistemas/EstadoSession';
import { VisualPuntuacion } from "@componentes/VisualPuntuacion";
import { PopupInfo } from "@entidades/objetos/PopupInfo";
export class EscenaJuego extends Phaser.Scene {
  private jugador!: Jugador;
  private grupoEnemigos!: Phaser.Physics.Arcade.Group;
  private colisiones!: SistemaColisiones;
  private capaPlataformas!: Phaser.Tilemaps.TilemapLayer;
  private idNivel!: string;
  private configNivel!: ConfigNivel;
  private bandera!: Bandera;

  private grupoMonedas!: Phaser.Physics.Arcade.Group;
  private grupoBloques!: Phaser.Physics.Arcade.StaticGroup;
  private grupoPowerUps!: Phaser.Physics.Arcade.Group;
  private grupoPopups!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: ESCENAS.JUEGO });
  }

  init(data?: { idNivel?: string }): void {
    // 4. Inyección segura de datos iniciales. Si falla, cae al 'nivel-1'.
    this.idNivel = data?.idNivel ?? "nivel-1";
    this.configNivel = GestorNiveles.obtenerConfig(this.idNivel);

    // Sincronización con el Estado Global para la UI
    EstadoSession.obtener().setIdNivelActual(this.idNivel);
  }

  create(): void {
    AnimacionesJugador.crear(this);

    const mapa = this.crearMapa();
    this.crearEntidadesBase(mapa);
    this.crearEnemigos(mapa);
    this.crearObjetos(mapa);
    new SistemaDano(this);
    new SistemaPuntuacion(this);

    this.configurarFisica(mapa);
    this.configurarColisiones();
    this.configurarCamara(mapa);

    // 4. Iniciar Música de Fondo por Nivel
    if (this.configNivel.nombreMusica) {
      this.sound.play(this.configNivel.nombreMusica, {
        loop: true,
        volume: 0.5,
      });
    }

    // Sistema de Adaptación Dinámica (Senior Resize Pattern)
    this.scale.on('resize', this.manejarResize, this);
    this.events.once('shutdown', () => {
        this.scale.off('resize', this.manejarResize, this);
    });

    // Inyección de lógica de flujo aislada (Anti-God Scene)
    new LevelFlowManager(this, this.configNivel, this.jugador);

    this.scene.launch(ESCENAS.UI);

    // Registrar Feedback Visual de Puntos
    SistemaEventos.obtener().on(
      EVENTOS.PUNTOS_FLOTANTES,
      (datos: { x: number; y: number; puntos: number }) => {
        VisualPuntuacion.mostrar(this, datos.x, datos.y, datos.puntos);
      },
    );
  }

  private crearEnemigos(mapa: Phaser.Tilemaps.Tilemap): void {
    this.grupoEnemigos = this.physics.add.group({ runChildUpdate: true });

    // Leemos la capa de objetos 'enemigos' definida en Tiled
    const capaObjetos = mapa.getObjectLayer("enemigos");

    capaObjetos?.objects.forEach((obj) => {
      const x = obj.x! + (obj.width ? obj.width / 2 : 0);
      const y = obj.y! + (obj.height ? -obj.height / 2 : 0);

      // Delegamos la creación al Patrón Factory usando la propiedad 'type' del JSON
      if (obj.type) {
        const enemigo = FabricaEnemigos.crear(
          obj.type,
          this,
          x,
          y,
          this.capaPlataformas,
        );
        if (enemigo) {
          this.grupoEnemigos.add(enemigo);
        }
      }
    });
  }

  private crearObjetos(mapa: Phaser.Tilemaps.Tilemap): void {
    this.grupoMonedas = this.physics.add.group();
    this.grupoBloques = this.physics.add.staticGroup();
    this.grupoPowerUps = this.physics.add.group({ runChildUpdate: true });
    this.grupoPopups = this.physics.add.staticGroup();

    // Helper para leer cada subcapa de Object Layers
    const parsearCapa = (nombreCapa: string) => {
      const capa = mapa.getObjectLayer(nombreCapa);

      capa?.objects.forEach((obj) => {
        const x = obj.x! + (obj.width ? obj.width / 2 : 0);
        // Centrado robusto: Detecta si es un Tile (GID) o un Rectángulo
        const y = obj.gid ? obj.y! - obj.height! / 2 : obj.y! + obj.height! / 2;

        if (obj.type === "moneda") {
          const moneda = new Moneda(this, x, y);
          this.grupoMonedas.add(moneda);
        } else if (obj.type === "bloque-ladrillo") {
          const bloque = new BloqueLadrillo(this, x, y);
          this.grupoBloques.add(bloque);
        } else if (obj.type === "bloque-interrogacion") {
          const bloque = new BloqueInterrogacion(this, x, y);
          this.grupoBloques.add(bloque);
        } else if (obj.type === "bloque-monedas") {
          const bloque = new BloqueMonedas(this, x, y);
          this.grupoBloques.add(bloque);
        } else if (obj.type === "popup") {
          const mensajeId = obj.properties?.find((p: any) => p.name === "mensajeId")?.value;
          if (mensajeId) {
            const popup = new PopupInfo(this, x, y, obj.width || 32, obj.height || 32, mensajeId);
            this.grupoPopups.add(popup);
          }
        }
      });
    };

    // Procesamos todas las capas de objetos interactivos
    parsearCapa("objetos-bloques");
    parsearCapa("objetos-monedas");

    // Escuchar el spawn de items dede los bloques
    SistemaEventos.obtener().on(
      EVENTOS.ITEM_RECOGIDO,
      (datos: { item: any }) => {
        this.grupoPowerUps.add(datos.item);
      },
    );
  }

  private crearMapa(): Phaser.Tilemaps.Tilemap {
    const mapa = this.make.tilemap({ key: this.configNivel.nombreMapa });

    // Cargamos todos los tilesets necesarios
    const tilesetPrincipal = mapa.addTilesetImage(
      "tileset-principal",
      ASSETS.TILESET_PRINCIPAL,
    )!;
    // Terrenos usa 35x35 con 1px de margen, hay que especificarlo o Phaser asume 32x32 por el mapa
    const tilesetTerrenos =
      mapa.addTilesetImage("terrenos", ASSETS.TILESET_TERRENOS, 35, 35, 1, 0) ||
      tilesetPrincipal;

    const listaTilesets = [tilesetPrincipal, tilesetTerrenos];

    mapa.createLayer("fondo", listaTilesets, 0, 0);

    this.capaPlataformas = mapa.createLayer(
      "plataformas",
      listaTilesets,
      0,
      0,
    )!;

    // Hacemos que CUALQUIER tile con GID del 1 al 5000 sea sólido.
    // Esto es lo más agresivo y efectivo para asegurar que Mario choque con todo el terreno.
    this.capaPlataformas.setCollisionBetween(1, 5000);

    return mapa;
  }

  private crearEntidadesBase(mapa: Phaser.Tilemaps.Tilemap): void {
    const capaSpawns = mapa.getObjectLayer("spawns");
    const capaMetaDedicada = mapa.getObjectLayer("zona-meta");

    // 1. Spawning del Jugador
    const puntoSpawn = capaSpawns?.objects.find(
      (o) => o.name === "spawn-jugador",
    );
    const x = puntoSpawn?.x ?? 100;
    const y = puntoSpawn?.y ?? 400;
    this.jugador = new Jugador(this, x, y);

    // 2. Detección de la Meta (Búsqueda cruzada en ambas capas)
    const buscador = (o: any) =>
      o.name === "zona-meta" || o.name === "meta" || o.type === "meta";
    const zonaMeta =
      capaSpawns?.objects.find(buscador) ||
      capaMetaDedicada?.objects.find(buscador);

    if (zonaMeta) {
      const bX = zonaMeta.x! + (zonaMeta.width ? zonaMeta.width / 2 : 0);

      // FIX Tiled Math:
      // Si tiene GID es un objeto de imagen/tile (Y es la base -> restar h/2)
      // Si NO tiene GID es un Rectángulo/Forma (Y es el tope -> sumar h/2)
      const bY = zonaMeta.gid
        ? zonaMeta.y! - zonaMeta.height! / 2
        : zonaMeta.y! + zonaMeta.height! / 2;

      this.bandera = new Bandera(this, bX, bY);
    }
  }

  private configurarFisica(mapa: Phaser.Tilemaps.Tilemap): void {
    SistemaFisicas.configurarMundo(
      this,
      mapa.widthInPixels,
      mapa.heightInPixels,
    );
  }

  private configurarColisiones(): void {
    this.colisiones = new SistemaColisiones(this);
    this.colisiones.registrarJugadorConMapa(this.jugador, this.capaPlataformas);
    this.colisiones.registrarJugadorConEnemigos(
      this.jugador,
      this.grupoEnemigos,
    );
    this.colisiones.registrarEnemigosConMapa(
      this.grupoEnemigos,
      this.capaPlataformas,
    );

    this.colisiones.registrarJugadorConMonedas(this.jugador, this.grupoMonedas);
    this.colisiones.registrarJugadorConBloques(this.jugador, this.grupoBloques);
    this.colisiones.registrarJugadorConPowerUps(
      this.jugador,
      this.grupoPowerUps,
    );
    this.colisiones.registrarPowerUpsConMapa(
      this.grupoPowerUps,
      this.capaPlataformas,
    );

    // Detección de Popups (Overlap sensillo directo en la escena)
    this.physics.add.overlap(this.jugador, this.grupoPopups, (_j, p) => {
      (p as PopupInfo).mostrar();
    });

    // Lógica avanzada para ocultar al alejarse
    this.events.on('update', () => {
      this.grupoPopups.getChildren().forEach((p: any) => {
        const popup = p as PopupInfo;
        const distancia = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, popup.x, popup.y);
        if (distancia > 100 && popup.estaActivo) {
          popup.ocultar();
        }
      });
    });

    if (this.bandera) {
      this.colisiones.registrarJugadorConBandera(this.jugador, this.bandera);
    }
  }

  private configurarCamara(mapa: Phaser.Tilemaps.Tilemap): void {
    this.cameras.main.setBounds(0, 0, mapa.widthInPixels, mapa.heightInPixels);
    this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
  }

  update(): void {
    const session = EstadoSession.obtener();

    // 0. Bloqueo Sistémico: Si el juego ya está en falla o transición, no procesamos NADA
    if (session.getEstado() !== EstadoJuego.JUGANDO) return;

    // 1. Detección de caída al vacío (Fuera de los límites del mapa)
    if (this.jugador.y > this.physics.world.bounds.height + 100) {
      this.manejarCaidaAlVacio();
      return;
    }

    // 2. Control de actualización lógica
    if (
      this.jugador.estadoLogico === EstadoLogicoJugador.MUERTO ||
      this.jugador.estadoLogico === EstadoLogicoJugador.TERMINANDO_NIVEL
    ) {
      return;
    }

    this.jugador.update();
  }

  private manejarCaidaAlVacio(): void {
    const session = EstadoSession.obtener();

    // El requerimiento Senior: Caer es Muerte Súbita (Vidas -> 0)
    session.forzarGameOver();

    // Forzamos la muerte del jugador (esto disparará el flujo hacia Game Over)
    // Usamos un pequeño "truco" para llamar a morir directamente si es necesario,
    // o simplemente llamar a recibirDano() pero como vidas es 0, el sistema lo manejará.

    // Accedemos a morir vía cast o simplemente emitiendo el evento que el LevelFlowManager escucha
    // Pero lo más limpio es que el Jugador sepa que murió.
    this.jugador.morir();
  }

  private manejarResize(gameSize: Phaser.Structs.Size): void {
    const { width, height } = gameSize;
    
    // 1. Reajustar Cámara al Viewport real del navegador
    this.cameras.main.setSize(width, height);
    
    // 2. Mantener límites si el mapa ya existe
    if (this.capaPlataformas?.tilemap) {
        this.cameras.main.setBounds(0, 0, this.capaPlataformas.tilemap.widthInPixels, this.capaPlataformas.tilemap.heightInPixels);
    }

    console.log(`[EscenaJuego] Cámara adaptada a Resolución Nativa: ${width}x${height}`);
  }
}
