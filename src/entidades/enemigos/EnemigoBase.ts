import Phaser from "phaser";

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

    this.patrullar();
    this.revisarObstaculos();
  }

  /**
   * Lógica de patrullaje horizontal constante.
   */
  protected patrullar(): void {
    this.setVelocityX(this.velocidad * this.direccion);
    
    // Reproducir animación base si existe
    if (this.anims.exists(`${this.claveAnimacion}-caminar`)) {
      this.anims.play(`${this.claveAnimacion}-caminar`, true);
    }

    // Voltear el sprite según la dirección
    this.setFlipX(this.direccion === 1);
  }

  /**
   * Revisa si el enemigo ha chocado con una pared o ha llegado al borde de una plataforma.
   */
  protected revisarObstaculos(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Si choca con una pared lateralmente (Phaser lo detecta en blocked o touching)
    if (body.blocked.left || body.blocked.right) {
      this.cambiarDireccion();
    } else if (this.detectarBorde()) {
      // Si detecta un precipicio al frente
      this.cambiarDireccion();
    }
  }

  /**
   * Cambia la dirección de patrullaje.
   */
  protected cambiarDireccion(): void {
    this.direccion = (this.direccion === -1 ? 1 : -1) as 1 | -1;
  }

  /**
   * Detecta si no hay un tile de suelo al frente en la dirección de movimiento.
   * Utiliza las coordenadas del mundo y la capa de plataformas.
   */
  protected detectarBorde(): boolean {
    // Calcular el punto que está al frente y un poco hacia abajo
    const xRevision = this.x + this.direccion * (this.width / 2 + 4);
    const yRevision = this.y + this.height / 2 + 1;

    // Buscar si hay un tile en esa posición exacta
    const tileAlFrente = this.capaPlataformas.getTileAtWorldXY(xRevision, yRevision);
    
    // Si no hay tile, hay un borde/hueco
    return tileAlFrente === null;
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

    // Intentar reproducir animación de muerte (ej: Goomba aplastado)
    const animMuerte = `${this.claveAnimacion}-muerte`;
    if (this.anims.exists(animMuerte)) {
      this.anims.play(animMuerte, true);
      this.once("animationcomplete", () => this.destroy());
    } else {
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
}
