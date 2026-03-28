import type Phaser from "phaser";
import type { EnemigoBase } from "./EnemigoBase";

/**
 * Define la firma del constructor esperado para cualquier clase enemiga.
 * Esto asegura tipado estricto al registrar nuevas entidades.
 */
export type ConstructorEnemigo = new (
  escena: Phaser.Scene,
  x: number,
  y: number,
  capaPlataformas: Phaser.Tilemaps.TilemapLayer
) => EnemigoBase;

/**
 * Implementación del Patrón Factory para instanciación dinámica basada en Tiled.
 * Desacopla la lógica de creación de la Escena principal.
 */
export class FabricaEnemigos {
  private static registro: Record<string, ConstructorEnemigo> = {};

  /**
   * Registra una clase enemiga en el catálogo bajo una clave (ej: "goomba").
   */
  public static registrar(tipo: string, clase: ConstructorEnemigo): void {
    if (this.registro[tipo]) {
      console.warn(`[FabricaEnemigos] El tipo de enemigo '${tipo}' ya estaba registrado. Sobrescribiendo.`);
    }
    this.registro[tipo] = clase;
  }

  /**
   * Instancia dinámicamente el enemigo solicitado, devolviendo un EnemigoBase.
   */
  public static crear(
    tipo: string,
    escena: Phaser.Scene,
    x: number,
    y: number,
    capaPlataformas: Phaser.Tilemaps.TilemapLayer
  ): EnemigoBase | null {
    const ClaseEnemigo = this.registro[tipo];

    if (!ClaseEnemigo) {
      console.warn(`[FabricaEnemigos] ⚠️ Enemigo de tipo '${tipo}' no está registrado en la fábrica. Ignorando su spawn.`);
      return null;
    }

    return new ClaseEnemigo(escena, x, y, capaPlataformas);
  }
}
