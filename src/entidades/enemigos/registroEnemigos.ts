import { FabricaEnemigos } from "./FabricaEnemigos";
import { Goomba } from "./Goomba";
import { Koopa } from "./Koopa";

/**
 * Este archivo centraliza el registro manual de cada entidad enemiga.
 * 
 * ¿Por qué no usamos "Auto-Registro" al final de Goomba.ts?
 * Porque bundlers modernos (como Vite/Webpack en producción) aplicarán "Tree-Shaking"
 * sobre Goomba.ts si nadie lo importa explícitamente, impidiendo que su bloque de 
 * auto-registro se ejecute, provocando un bug silencioso donde no aparecen enemigos 
 * únicamente en la versión de Producción compilada.
 */
export function inicializarRegistroEnemigos(): void {
  // Registramos exactamente la misma palabra clave que usamos en la propiedad `type` en Tiled
  FabricaEnemigos.registrar("goomba", Goomba);
  FabricaEnemigos.registrar("koopa", Koopa);
  
  console.log("[Registro] ✅ Fábrica de Enemigos inicializada con éxito.");
}
