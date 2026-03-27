import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";
import { JUEGO } from "@constantes/constantes-juego";
import type { EstadoKoopa } from "@tipos/tipos-enemigo";

/**
 * Enemigo tipo Koopa con estados de concha y proyectil.
 */
export class Koopa extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO;
  protected claveAnimacion = "koopa";
  private estadoKoopa: EstadoKoopa = "caminando";

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ) {
    super(escena, x, y, ASSETS.KOOPA_SPRITE, capaPlataformas);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 32);
    body.setOffset(4, 0);
  }

  update(): void {
    if (!this.active || !this.body) return;

    if (this.estadoKoopa === "caminando") {
      super.update(); // Mantiene patrullaje normal
    } else if (this.estadoKoopa === "concha-movimiento") {
      this.revisarRebote();
    }
  }

  /**
   * Al ser pisado, el Koopa no muere, entra en su concha.
   */
  public alSerPisado(): void {
    if (this.estadoKoopa === "caminando") {
      this.entrarEnConcha();
    } else if (this.estadoKoopa === "concha") {
      this.patearConcha(this.x < 400 ? 1 : -1); // Dirección simplificada para prueba
    } else {
      this.detenerConcha();
    }

    this.scene.events.emit("puntuacion:sumar", { puntos: JUEGO.PUNTOS_KOOPA });
  }

  private entrarEnConcha(): void {
    this.estadoKoopa = "concha";
    this.setVelocityX(0);
    this.anims.play(`${this.claveAnimacion}-concha`, true);
    
    // Ajustar hitbox para la concha (más baja)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 20);
    body.setOffset(4, 12);
  }

  private patearConcha(direccion: number): void {
    this.estadoKoopa = "concha-movimiento";
    this.direccion = direccion as 1 | -1;
    this.setVelocityX(FISICA.VELOCIDAD_CONCHA * this.direccion);
  }

  private detenerConcha(): void {
    this.estadoKoopa = "concha";
    this.setVelocityX(0);
  }

  private revisarRebote(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left || body.blocked.right) {
      this.direccion = (this.direccion === 1 ? -1 : 1) as 1 | -1;
      this.setVelocityX(FISICA.VELOCIDAD_CONCHA * this.direccion);
    }
  }

  public obtenerEstado(): EstadoKoopa {
    return this.estadoKoopa;
  }

  /**
   * Sobrescribe el golpe lateral para permitir patear la concha.
   */
  public override recibirGolpeLateral(jugador: Phaser.GameObjects.Components.Transform): boolean {
    if (this.estadoKoopa === "concha") {
      // Determinar dirección del pateo según posición relativa
      const direccion = jugador.x < this.x ? 1 : -1;
      this.patearConcha(direccion);
      return true; // Éxito: no hay daño para el jugador
    }
    return false; // Daño normal si está caminando o en movimiento
  }
}
