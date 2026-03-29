import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { GestorNiveles } from "@niveles/GestorNiveles";
import "../ui/game-ui.css";
import "../ui/selector-niveles.css";

/**
 * Escena de Selección de Niveles (UI Moderna Híbrida).
 * Utiliza Phaser DOM para un renderizado dinámico y responsivo con estética Premium.
 */
export class EscenaNiveles extends Phaser.Scene {
  private uiElement!: Phaser.GameObjects.DOMElement;
  private transicionando: boolean = false;
  private movido: boolean = false;
  private isDown: boolean = false;
  private startX: number = 0;
  private scrollLeft: number = 0;

  constructor() {
    super({ key: ESCENAS.NIVELES });
  }

  create(): void {
    this.transicionando = false;

    // 1. Bloqueo de entrada de Phaser para que la UI Domine el Input
    this.input.enabled = true;

    // 2. Obtener Datos Reales de Progresión
    const niveles = GestorNiveles.obtenerEstadoProgresion();

    // 3. Construir el HTML In-Memory (Template Literals)
    const htmlContent = `
      <div class="selector-container" id="selector-niveles">
        <h1 class="selector-titulo">Mundos de Aventura</h1>
        
        <div class="niveles-wrapper">
          ${niveles
            .map(
              (n, index) => `
            <div class="nivel-card ${n.desbloqueado ? "" : "bloqueado"}" 
                 data-id="${n.id}" 
                 style="animation-delay: ${index * 0.1}s">
              <div class="nivel-numero">${index + 1}</div>
              <div class="nivel-nombre">${n.nombreDisplay}</div>
              <div class="nivel-record">Récord: ${n.mejorPuntaje}</div>
              <div class="nivel-icono">
                <img src="${n.desbloqueado ? "assets/ui/unlock.png" : "assets/ui/lock.png"}" class="img-status ${n.desbloqueado ? "unlocked" : "locked"}" alt="status">
              </div>
              ${n.mejorPuntaje > 0 ? '<div class="nivel-check"><img src="assets/ui/check.png" class="img-check" alt="completado"></div>' : ""}
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="instrucciones">
          Desliza para ver más mundos
        </div>
      </div>
    `;

    // 4. Inyectar en el Engine de Phaser (DOMElement)
    // Posicionamos en 0,0 con origen 0,0 para que el CSS controle el layout total
    this.uiElement = this.add
      .dom(0, 0)
      .setOrigin(0, 0)
      .createFromHTML(htmlContent);

    // 5. Gestión de Eventos Delegados (Click en Tarjetas)
    const container = this.uiElement.getChildByID(
      "selector-niveles",
    ) as HTMLElement;
    const wrapper = container.querySelector(".niveles-wrapper") as HTMLElement;

    // --- Lógica de Scroll (Nativa + Ayuda Visual) ---
    this.movido = false;
    let clickX = 0;

    wrapper.addEventListener("mousedown", (e) => {
      this.isDown = true;
      this.movido = false;
      clickX = e.clientX;
      wrapper.style.cursor = "grabbing";
      this.startX = e.clientX - wrapper.offsetLeft;
      this.scrollLeft = wrapper.scrollLeft;
    });

    wrapper.addEventListener("mouseleave", () => {
      this.isDown = false;
      wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mouseup", () => {
      this.isDown = false;
      wrapper.style.cursor = "grab";
    });

    wrapper.addEventListener("mousemove", (e) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.clientX - wrapper.offsetLeft;
      const walk = (x - this.startX) * 1.5;
      wrapper.scrollLeft = this.scrollLeft - walk;
      
      if (Math.abs(e.clientX - clickX) > 10) {
        this.movido = true;
      }
    });

    // --- Selección de Nivel ---
    const cards = container.querySelectorAll(".nivel-card");
    cards.forEach((card) => {
      card.addEventListener("pointerup", (e) => {
        // Importante: No dejar que el evento se escape
        e.stopPropagation();

        if (this.movido) {
          this.movido = false;
          return;
        }

        const cardEl = card as HTMLElement;
        if (cardEl.classList.contains("bloqueado")) return;

        const id = cardEl.getAttribute("data-id");
        if (id) {
          this.seleccionarNivel(id, container);
        }
      });
    });

    // 6. Ciclo de Vida: Registro de Limpieza (Security Shield)
    this.events.once("shutdown", () => {
      this.limpiarUI();
    });
  }

  /**
   * Maneja la transición al nivel seleccionado de forma sincronizada y blindada.
   */
  private seleccionarNivel(id: string, container: HTMLElement): void {
    if (this.transicionando) return;
    this.transicionando = true;

    // TODO: Sonido de selección (Música de Mapa -> Transición)

    // Activar animación CSS
    container.classList.add("ui-fade-out");

    // FALLBACK DE SEGURIDAD: Si por alguna razón el evento de animación no dispara, 
    // cambiamos de escena de todos modos tras 400ms (el doble del tiempo de la animación).
    const timeoutFallback = setTimeout(() => {
      console.log("[Selector] Fallback de transición activado.");
      this.scene.start(ESCENAS.JUEGO, { idNivel: id });
    }, 400);

    // Evento oficial de fin de animación
    container.addEventListener(
      "animationend",
      () => {
        clearTimeout(timeoutFallback);
        console.log("[Selector] Transición de salida completada. Iniciando nivel:", id);
        this.scene.start(ESCENAS.JUEGO, { idNivel: id });
      },
      { once: true },
    );
  }

  /**
   * Destrucción manual para evitar memory leaks (Anti-Ghost Buttons)
   */
  private limpiarUI(): void {
    if (this.uiElement) {
      console.log("[EscenaNiveles] Desmontando UI DOM...");
      this.uiElement.destroy();
    }
  }
}
