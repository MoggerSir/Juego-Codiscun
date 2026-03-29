import Phaser from 'phaser';
import { ESCENAS } from '@constantes/constantes-escenas';
import { GestorNiveles } from '@niveles/GestorNiveles';
import type { DatosFinNivel } from '@tipos/tipos-nivel';

export class EscenaVictoria extends Phaser.Scene {
  private datosFinNivel!: DatosFinNivel;

  constructor() {
    super({ key: ESCENAS.VICTORIA });
  }

  init(datos: DatosFinNivel): void {
    // Si la escena es llamada sin datos (bug), asignamos un fallback de seguridad.
    this.datosFinNivel = datos || {
      idNivel: 'nivel-1',
      puntos: 0,
      monedas: 0,
      tiempoRestante: 0
    };
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Fondo semitransparente oscuro o color sólido
    this.cameras.main.setBackgroundColor('#1e3a5f');

    // Título Principal
    this.add.text(cx, height * 0.2, '¡NIVEL COMPLETADO!', {
      fontSize: '36px',
      color: '#ffd700',
      fontFamily: 'Verdana, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Resumen de Puntos y Monedas
    this.mostrarResumen(cx, height);

    // Botones de Acción (Siguiente / Menú)
    this.mostrarBotones(cx, height);
  }

  private mostrarResumen(cx: number, height: number): void {
    // Obtenemos el nombre del nivel recién completado
    let nombreNivel = 'Nivel Desconocido';
    try {
      const configArray = GestorNiveles.obtenerConfig(this.datosFinNivel.idNivel);
      nombreNivel = configArray.nombreDisplay;
    } catch {
      // Ignora si no existe
    }

    const lineas = [
      `Has superado el ${nombreNivel}`,
      ``,
      `Puntaje Total:   ${this.datosFinNivel.puntos.toLocaleString()}`,
      `Monedas Recogidas:  ${this.datosFinNivel.monedas}`,
    ];

    lineas.forEach((linea, index) => {
      this.add.text(cx, height * 0.4 + (index * 40), linea, {
        fontSize: index === 0 ? '24px' : '20px',
        color: index === 0 ? '#4ade80' : '#ffffff',
        fontFamily: 'Courier New, Courier, monospace'
      }).setOrigin(0.5);
    });
  }

  private mostrarBotones(cx: number, height: number): void {
    const configActual = GestorNiveles.obtenerConfig(this.datosFinNivel.idNivel);
    const siguienteId = configActual.siguienteId;

    if (siguienteId) {
      // Botón Siguiente Nivel
      const btnSiguiente = this.add.text(cx, height * 0.75, '[ CONTINUAR AL SIGUIENTE NIVEL ]', {
        fontSize: '24px',
        color: '#4ade80'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

      btnSiguiente.on('pointerdown', () => {
        // Redirige a la escena principal de juego con el próximo ID
        this.scene.start(ESCENAS.JUEGO, { idNivel: siguienteId });
      });

      btnSiguiente.on('pointerover', () => btnSiguiente.setTint(0xffd700));
      btnSiguiente.on('pointerout', () => btnSiguiente.clearTint());

    } else {
      // Si no hay siguiente nivel, es el final del juego
      this.add.text(cx, height * 0.7, '¡HAS COMPLETADO EL JUEGO!', {
        fontSize: '28px',
        color: '#ffaa00'
      }).setOrigin(0.5);
    }

    // Botón Volver al Menú
    const btnMenu = this.add.text(cx, height * 0.85, 'Volver al Menú Principal', {
      fontSize: '20px',
      color: '#94a3b8'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    btnMenu.on('pointerdown', () => {
      this.scene.start(ESCENAS.MENU);
    });
    btnMenu.on('pointerover', () => btnMenu.setTint(0xffffff));
    btnMenu.on('pointerout', () => btnMenu.clearTint());
  }
}
