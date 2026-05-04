import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";
import { JUEGO } from "@constantes/constantes-juego";
import type { EstadoKoopa } from "@tipos/tipos-enemigo";

const ANIM_KOOPA_CONCHA = "koopa-concha";
const ANIM_KOOPA_CONCHA_GIRO = "koopa-concha-giro";

/** Assets base 16×16; escala moderada para evitar jitter con la detección de bordes. */
const ESCALA_KOOPA = 2;

/**
 * Enemigo tipo Koopa con estados de concha y proyectil.
 */
export class Koopa extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO;
  protected claveAnimacion = "koopa";
  protected sfxMuerte = ASSETS.SFX_MUERTE_KOOPA;
  private estadoKoopa: EstadoKoopa = "caminando";

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer,
  ) {
    super(escena, x, y, ASSETS.KOOPA_SPRITE, capaPlataformas);

    this.setScale(ESCALA_KOOPA);

    // Sprite caminar: celdas 16×16 (hitbox en espacio del frame; Phaser escala el body con el sprite)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 14);
    body.setOffset(2, 2);
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
   * Con escala > 1, medir con el body evita desync entre hitbox y `sprite.width` / `detectarPared`.
   * El empuje de 2 px de la base es insuficiente y provoca flip-flop cada frame.
   */
  protected override detectarPared(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const margin = 2;
    const xRevision =
      (this.direccion === 1 ? body.right : body.left) +
      this.direccion * margin;
    const tileAlFrente = this.capaPlataformas.getTileAtWorldXY(
      xRevision,
      body.center.y,
    );
    return tileAlFrente !== null && tileAlFrente.collides;
  }

  protected override detectarBorde(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const xRevision =
      (this.direccion === 1 ? body.right : body.left) +
      this.direccion * 3;
    const yRevision = body.bottom + 4;
    const tileAlFrente = this.capaPlataformas.getTileAtWorldXY(
      xRevision,
      yRevision,
    );
    return tileAlFrente === null || !tileAlFrente.collides;
  }

  public override cambiarDireccion(): void {
    this.direccion = (this.direccion === -1 ? 1 : -1) as 1 | -1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const paso = Math.max(6, Math.ceil(body.width * 0.2));
    this.x += this.direccion * paso;
  }

  /**
   * Al ser pisado, el Koopa no muere, entra en su concha.
   */
  public alSerPisado(): void {
    if (this.estadoKoopa === "caminando") {
      this.entrarEnConcha();
      
      // Solo sumamos puntos la primera vez que se pisa (al entrar en concha)
      import("@sistemas/SistemaEventos").then((mod) => {
        const bus = mod.SistemaEventos.obtener();
        bus.emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: JUEGO.PUNTOS_KOOPA });
        bus.emit(mod.EVENTOS.PUNTOS_FLOTANTES, {
          x: this.x,
          y: this.y,
          puntos: JUEGO.PUNTOS_KOOPA,
        });
      });
    } else if (this.estadoKoopa === "concha") {
      this.patearConcha(this.x < 400 ? 1 : -1); // Dirección simplificada para prueba
    } else {
      this.detenerConcha();
    }
  }

  private entrarEnConcha(): void {
    this.estadoKoopa = "concha";
    this.setVelocityX(0);
    this.setTexture(ASSETS.KOOPA_CONCHA_SPRITE);
    if (this.scene.anims.exists(ANIM_KOOPA_CONCHA)) {
      this.anims.play(ANIM_KOOPA_CONCHA, true);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12);
    body.setOffset(2, 2);
  }

  private patearConcha(direccion: number): void {
    this.estadoKoopa = "concha-movimiento";
    this.direccion = direccion as 1 | -1;
    this.setVelocityX(FISICA.VELOCIDAD_CONCHA * this.direccion);
    if (this.scene.anims.exists(ANIM_KOOPA_CONCHA_GIRO)) {
      this.anims.play(ANIM_KOOPA_CONCHA_GIRO, true);
    }
  }

  private detenerConcha(): void {
    this.estadoKoopa = "concha";
    this.setVelocityX(0);
    if (this.scene.anims.exists(ANIM_KOOPA_CONCHA)) {
      this.anims.play(ANIM_KOOPA_CONCHA, true);
    }
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
  public override recibirGolpeLateral(
    jugador: Phaser.GameObjects.Components.Transform,
  ): boolean {
    if (this.estadoKoopa === "concha") {
      // Determinar dirección del pateo según posición relativa
      const direccion = jugador.x < this.x ? 1 : -1;
      this.patearConcha(direccion);
      return true; // Éxito: no hay daño para el jugador
    }
    return false; // Daño normal si está caminando o en movimiento
  }

  /**
   * Indica que el Koopa solo daña a otros enemigos si está en modo concha disparada.
   */
  public override esDaninoParaEnemigos(): boolean {
    return this.estadoKoopa === "concha-movimiento";
  }
}
