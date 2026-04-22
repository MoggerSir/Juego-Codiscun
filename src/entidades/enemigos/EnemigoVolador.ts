import { EnemigoBase } from "./EnemigoBase";
import { FISICA } from "@constantes/constantes-fisica";
import { ASSETS } from "@constantes/constantes-assets";

/**
 * Enemigo que patrulla en el aire sin verse afectado por la gravedad.
 */
export class EnemigoVolador extends EnemigoBase {
  protected velocidad = FISICA.VELOCIDAD_ENEMIGO * 1.5; // Un poco más rápido
  protected claveAnimacion = "koopa"; // Usamos koopa temporalmente como asset volador
  protected sfxMuerte = ASSETS.SFX_MUERTE_VOLADOR;

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
   * Sobrescribimos el ciclo de vida para garantizar que la gravedad se mantenga
   * en 0, ya que al añadir la entidad a un 'Physics Group' genérico en EscenaJuego,
   * Phaser puede sobrescribir este valor y reactivarlo por defecto.
   */
  public override update(): void {
    super.update();
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && body.allowGravity) {
      body.setAllowGravity(false);
      // Neutralizar cualquier velocidad Y acumulada por el error de grupo
      this.setVelocityY(0);
    }
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
      const bus = mod.SistemaEventos.obtener();
      bus.emit(mod.EVENTOS.PUNTUACION_SUMAR, { puntos: 300 });
      bus.emit(mod.EVENTOS.PUNTOS_FLOTANTES, { x: this.x, y: this.y, puntos: 300 });
    });

    this.morir();
  }
}
