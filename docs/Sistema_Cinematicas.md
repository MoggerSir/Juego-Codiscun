# Documentación del Sistema de Cinemáticas

Este documento explica en detalle la arquitectura, funcionamiento y mantenimiento del **Motor de Cinemáticas Interactivas** que se integró en el juego.

## 📌 Resumen de lo Añadido

Para permitir secuencias de introducción (tipo novela visual/historieta) de gran flexibilidad, se añadieron los siguientes archivos:

1. **`src/cinematicas/TiposCinematica.ts`**: Contiene las interfaces (esquemas) que dictan cómo deben construirse los datos para una cinemática (textos, tiempos, botones, imágenes).
2. **`src/cinematicas/RegistroCinematicas.ts`**: Es el "cerebro de datos". Aquí se encuentran listadas todas tus imágenes, textos guionizados y rutas a seguir, desacoplando completamente el contenido de la lógica de programación.
3. **`src/escenas/EscenaCinematica.ts`**: Es el Motor dentro de Phaser. Renderiza imágenes, aplica efectos de cámara y transiciones fade, maneja el cronómetro de cada diálogo, detecta si hay botones interactivos y coordina las ramificaciones.

## 🚀 ¿Cómo funciona y cómo lo configuro?

Todo el control de contenido de las cinemáticas se maneja desde **`RegistroCinematicas.ts`**. No necesitas programar comportamiento Phaser para crear nuevas cinemáticas, simplemente editas el objeto de configuración.

### 1. Estructura Básica de un Paso (`PasoCinematica`)
Cada paso ("PasoCinematica") requiere:
- **`imagenRuta` y `imagenClave`**: Dónde está tu JPG/PNG en el disco y una clave única en Phaser para cargarla.
- **Tiempos (`duracionEnPantalla`, `fadeIn`, `fadeOut`)**: Todo está en **milisegundos** (1000ms = 1s).
- **`efecto`** (Opcional): `"zoom_in"` o `"zoom_out"` para simular paneo constante (Efecto Ken Burns).
- **`escala`** (Opcional): Si tu imagen es gigantesca, pon `0.5` para encogerla a la mitad. Si es normal, `1.0`.

### 2. Control de la "Línea de Tiempo" de Textos
Lo más potente del motor es que los textos en pantalla funcionan bajo un formato de **Timeline** (línea de tiempo cronometrada):

```typescript
textos: [
  {
    contenido: "Texto 1 que sale de inmediato",
    startTime: 0, 
    duration: 3000, // Desaparece a los 3 segundos
    estilo: { fontFamily: "Arial", color: "#fff" }
  },
  {
    contenido: "Texto 2 que sale cuando el primero desaparece",
    startTime: 3500, // Aparece al segundo 3.5
    // Sin "duration", se quedará hasta que la imagen principal desaparezca.
  }
]
```

### 3. Decisiones y Ramificaciones (Opciones)
Si en un paso defines un arreglo de `opciones`, el motor **se detendrá automáticamente y no avanzará** hasta que el jugador haga click en uno de los botones generados.

```typescript
opciones: [
  {
    texto: "Aceptar misión",
    accion: "cargar_nivel",  // Para ir a los niveles programados
    destino: "nivel-1"       // Manda al jugador directo al Nivel 1.
  },
  {
    texto: "Decir que No",
    accion: "cambiar_escena", // Te envía a una escena genérica de UI (ej. Menú Principal)
    destino: ESCENAS.MENU
  },
  {
    texto: "Huir corriendo",
    accion: "cambiar_cinematica", // Para iniciar un flujo MUY diferente ("Elige tu propia aventura")
    destino: "intro_ruta_b"       // Ejecuta otra cinemática registrada.
  }
]
```

## 🛠️ Cómo Mantenerlo y Escalarlo a Futuro

### a) Crear Nuevas Cinemáticas Completas (Escalar)
Imagina que terminas el Nivel 3 y quieres hacer un "Ending" para ese nivel:
1. Agrégala en `RegistroCinematicas.ts` como una constante nueva (ej. `CINEMATICA_ENDING`).
2. Agrega su ID (ej. `"ending_nivel3"`) en el objeto de exportación al final del archivo:
   ```typescript
   export const RegistroCinematicas: Record<string, ConfiguracionCinematica> = {
     [CINEMATICA_INTRO.id]: CINEMATICA_INTRO,
     "ending_nivel3": CINEMATICA_ENDING // <- Nueva historia
   };
   ```
3. En la meta del nivel simplemente llamas a: `this.scene.start(ESCENAS.CINEMATICA, { idCinematica: "ending_nivel3" })`

### b) Mantenimiento y Rendimiento
- **No pongas todas las fotos del juego en un solo Paso**: La Escena Cinematicas **carga sólo las imágenes de la historia actual** en su función `preload()` al momento de abrirse (Dynamic Loading). Es muy seguro agregar cientos de cinemáticas, ya que el sistema solo descarga del disco las imágenes de la secuela que se va a jugar en el momento.
- **Problemas con textos y resolución**: Si el texto queda muy a la orilla, puedes definir explícitamente `x: 200, y: 100` dentro del objeto del texto. Por defecto todo se centra. Usa `ancho: 800` si ves que la frase es tan larga que se sale de la pantalla (activa salto de línea automático, llamado WordWrap).

### c) Si quieres añadir nuevos Acciones
Actualmente hay tres comandos: `cargar_nivel`, `cambiar_escena`, y `cambiar_cinematica`. Si en el futuro agregas tiendas en las escenas, podrías abrir `TiposCinematica.ts` y añadir `"abrir_tienda"`. Luego vas a `EscenaCinematica.ts` > `procesarDecision` y ahí colocas un `else if (opcion.accion === "abrir_tienda") { ... }`. ¡Es altamente modular!
