import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";

/**
 * Enemigo que patrulla en el aire sin verse afectado por la gravedad.
 */
export class EnemigoVolador extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO * 1.5; // Un poco más rápido
  protected claveAnimacion = "koopa"; // Usamos koopa temporalmente como asset volador

  constructor(
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ) {
    super(escena, x, y, ASSETS.KOOPA_SPRITE, capaPlataformas);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(4, 8);
    
    // Lo más importante: Ignorar la gravedad para que se mantenga en el aire
    body.setAllowGravity(false);
    
    // Le damos un tinte azulado para distinguirlo visualmente 
    this.setTint(0x88ccff);
  }

  /**
   * Sobrescribimos la detección de bordes para que NUNCA cambie de dirección
   * por un precipicio (ya que vuela), limitándose a rebotar en paredes.
   */
  protected override detectarBorde(): boolean {
    return false; // Al volar no le importan los bordes del suelo
  }

  public alSerPisado(): void {
    if (this.getData("muerto")) return;
    this.setData("muerto", true);

    this.setVelocity(0, 0);

    // Sumar puntos (damos más puntos porque es volador)
    import("@sistemas/SistemaEventos").then(mod => {
      mod.SistemaEventos.obtener().emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: 300 });
    });

    this.morir();
  }
}
