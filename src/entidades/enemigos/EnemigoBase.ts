import Phaser from "phaser";
import { EstadoSession, EstadoJuego } from "../../sistemas/EstadoSession";
import { CONFIG_AUDIO } from "@constantes/config-audio";

/**
 * Clase base para todos los enemigos del juego.
 * Define la lógica de patrullaje, detección de bordes y muerte común.
 */
export abstract class EnemigoBase extends Phaser.Physics.Arcade.Sprite {
  protected direccion: 1 | -1 = -1; // 1 = derecha, -1 = izquierda
  protected capaPlataformas: Phaser.Tilemaps.TilemapLayer;
  
  // Estas propiedades abstractas deben ser definidas por cada enemigo concreto (Goomba, Koopa, etc.)
  protected abstract velocidad: number;
  protected abstract claveAnimacion: string;
  protected abstract sfxMuerte: string;

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    textura: string,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ) {
    super(escena, x, y, textura);

    // Guardar referencia a la capa de plataformas para detección de bordes
    this.capaPlataformas = capaPlataformas;

    // Registrar en la escena y en el sistema de física
    escena.add.existing(this);
    escena.physics.add.existing(this);

    // Ajustes iniciales de física por defecto para enemigos
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setImmovable(false);
  }

  /**
   * Ciclo de vida del enemigo: patrullaje y cambio de dirección.
   */
  update(): void {
    if (!this.active || !this.body) return;

    const session = EstadoSession.obtener();
    if (session.getEstado() !== EstadoJuego.JUGANDO) {
      this.setVelocityX(0); // Congelar movimiento horizontal
      this.anims.stop();    // Congelar visualmente
      return;
    }

    this.patrullar();
    this.revisarObstaculos();
  }

  /**
   * Lógica de patrullaje horizontal constante.
   */
  protected patrullar(): void {
    this.setVelocityX(this.velocidad * this.direccion);
    
    // Reproducir animación base si existe
    const animKey = `${this.claveAnimacion}-caminar`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    }

    // Voltear el sprite según la dirección (el sprite base mira a la derecha)
    this.setFlipX(this.direccion === -1);
  }

  /**
   * Revisa si el enemigo ha chocado con una pared o ha llegado al borde de una plataforma.
   * Enfoque proactivo: Detecta obstáculos ANTES de la colisión física.
   */
  protected revisarObstaculos(): void {
    if (this.detectarPared() || this.detectarBorde()) {
      this.cambiarDireccion();
    }
  }

  /**
   * Detecta si hay una pared sólida justo enfrente.
   */
  protected detectarPared(): boolean {
    const margin = 2;
    const xRevision = this.x + this.direccion * (this.width / 2 + margin);
    const yRevision = this.y; // Centro vertical

    const tileAlFrente = this.capaPlataformas.getTileAtWorldXY(xRevision, yRevision);
    return tileAlFrente !== null && tileAlFrente.collides;
  }

  /**
   * Cambia la dirección de patrullaje.
   */
  public cambiarDireccion(): void {
    this.direccion = (this.direccion === -1 ? 1 : -1) as 1 | -1;
    
    // Pequeño desplazamiento para salir del umbral de detección y evitar bucles
    this.x += this.direccion * 2;
  }

  /**
   * Detecta si no hay un tile de suelo al frente en la dirección de movimiento.
   */
  protected detectarBorde(): boolean {
    const xRevision = this.x + this.direccion * (this.width / 2);
    const yRevision = this.y + this.height / 2 + 5; // Un poco por debajo del pie

    const tileAlFrente = this.capaPlataformas.getTileAtWorldXY(xRevision, yRevision);
    return tileAlFrente === null || !tileAlFrente.collides;
  }

  /**
   * Método obligatorio que define qué ocurre cuando el jugador pisa a este enemigo.
   */
  public abstract alSerPisado(): void;

  /**
   * Maneja la lógica de destrucción común del enemigo (animación de muerte y limpieza).
   */
  public morir(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false; // Deshabilitar colisiones inmediatamente
    }

    // Reproducir sonido de muerte
    if (this.scene.cache.audio.exists(this.sfxMuerte)) {
      console.log(`[AudioEnemigo] Reproduciendo SFX: ${this.sfxMuerte}`);
      this.scene.sound.play(this.sfxMuerte, { 
        volume: CONFIG_AUDIO.obtenerVolumen(this.sfxMuerte) 
      });
    } else {
      console.warn(`[AudioEnemigo] ⚠️ No se encontró el asset de audio: ${this.sfxMuerte} en el cache.`);
    }

    // Intentar reproducir animación de muerte (ej: Goomba aplastado)
    const animMuerte = `${this.claveAnimacion}-muerte`;
    console.log(`[Enemigo] Muriendo. Buscando animación: ${animMuerte}. Existe: ${this.scene.anims.exists(animMuerte)}`);
    
    if (this.scene.anims.exists(animMuerte)) {
      this.anims.play(animMuerte, true);
      
      // Seguridad: Destruir después de 1 segundo si falla el evento (Timeout guard)
      this.scene.time.delayedCall(1000, () => {
        if (this.active) {
            console.log(`[Enemigo] Destrucción por timeout de seguridad.`);
            this.destroy();
        }
      });

      this.once("animationcomplete", () => {
          console.log(`[Enemigo] Animación completada, destruyendo.`);
          this.destroy();
      });
    } else {
        console.warn(`[Enemigo] No se encontró animación de muerte: ${animMuerte}`);
      // Si no hay animación, simplemente destruir en el siguiente frame
      this.destroy();
    }
  }

  /**
   * Define si el enemigo puede ser golpeado lateralmente sin dañar al jugador.
   * Por defecto retorna false (daño normal).
   */
  public recibirGolpeLateral(_jugador: any): boolean {
    return false;
  }

  /**
   * Define si este enemigo, en su estado actual, puede dañar a otros enemigos
   * (ej: una concha de Koopa en movimiento).
   */
  public esDaninoParaEnemigos(): boolean {
    return false;
  }
}
