import Phaser from "phaser";
import { BASE_DATOS_MENSAJES } from "@constantes/base-de-datos-mensajes";
import { EstadoSession, EstadoJuego } from "@sistemas/EstadoSession";

export class PopupInfo extends Phaser.GameObjects.Zone {
  private domElement!: Phaser.GameObjects.DOMElement;
  private estaMostrando: boolean = false;
  private estaDestruyendo: boolean = false; 
  private idReferencia: string;
  private tiempoApertura: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    mensajeId: string,
  ) {
    super(scene, x, y, width, height);

    this.idReferencia = mensajeId;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const datos = BASE_DATOS_MENSAJES[mensajeId];
    if (!datos) {
      throw new Error(`[PopupInfo] No se encontró el mensajeId: ${mensajeId}`);
    }

    const html = `
      <div class="popup-container">
        <div class="popup-box" style="position: relative; border-color: ${datos.colorBorde || "var(--neon-cyan)"}">
          <button class="popup-close">X</button>
          <div class="popup-title">${datos.titulo}</div>
          <div class="popup-text">${datos.mensaje}</div>
          <div class="popup-footer">Presiona X para cerrar</div>
        </div>
      </div>
    `;

    this.domElement = scene.add.dom(0, 0).createFromHTML(html);
    this.domElement.setScrollFactor(0); // Fijar a la cámara
    this.domElement.setDepth(10000); // Prioridad máxima de renderizado
    this.domElement.setOrigin(0, 0); // El contenedor CSS ya se encarga del centrado interno

    // Forzar posición al centro del viewport de Phaser
    this.domElement.setPosition(0, 0); 

    // Listener específico para el botón X
    this.domElement.addListener("click");
    this.domElement.on("click", (event: any) => {
      if (event.target.classList.contains("popup-close")) {
        this.ocultar();
      }
    });
  }

  public mostrar(): void {
    if (this.estaMostrando || this.estaDestruyendo) return;
    this.estaMostrando = true;
    this.tiempoApertura = Date.now();
    console.log(`[PopupInfo] Mostrando mensaje: ${this.idReferencia}`);

    // Pausar Juego (Reutilizando lógica de Estado Global)
    EstadoSession.obtener().setEstado(EstadoJuego.MOSTRANDO_INFO);
    this.scene.physics.world.pause();

    const el = this.domElement.node.querySelector(".popup-container");
    if (el) el.classList.add("active");
  }

  public ocultar(porDistancia: boolean = false): void {
    if (!this.estaMostrando) return;

    // Si es por distancia, ignorar si se abrió hace menos de 500ms (debounce)
    if (porDistancia && Date.now() - this.tiempoApertura < 500) {
      return;
    }

    this.estaMostrando = false;
    this.estaDestruyendo = true;

    // Desactivar físicas inmediatamente para que Mario no "choque" con el fantasma del objeto
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    // Reanudar Juego
    EstadoSession.obtener().setEstado(EstadoJuego.JUGANDO);
    this.scene.physics.world.resume();

    const el = this.domElement.node.querySelector(".popup-container");
    if (el) el.classList.remove("active");

    // Destruir el objeto después de la animación (300ms en el CSS)
    // para que no vuelva a aparecer en este nivel
    this.scene.time.delayedCall(200, () => {
      this.domElement.destroy();
      this.destroy();
    });
  }

  // Getter para que la escena sepa si debe re-activarlo
  public get estaActivo(): boolean {
    return this.estaMostrando;
  }
}
