# Documentación de la Fase 0 — Setup del Proyecto

Este documento detalla todos los cambios, carpetas y archivos configurados durante la **Fase 0** para el desarrollo del juego tipo Mario Bros. El objetivo de esta fase fue establecer una infraestructura sólida, escalable y con tipado estricto.

---

## 1. Infraestructura y Configuración Base

Se configuraron las herramientas de desarrollo esenciales para garantizar la calidad del código y la compatibilidad multiplataforma.

### Gestión de Dependencias

- **Archivo:** [package.json](../package.json)
- **Descripción:** Contiene las librerías principales: `phaser` (motor) y `@capacitor/core` (móvil). También incluye los scripts de desarrollo (`dev`, `build`, `preview`).

### Configuración de TypeScript

- **Archivo:** [tsconfig.json](../tsconfig.json)
- **Implementación:**
  - Se activó el modo estricto (`strict: true`).
  - Se definieron **Alias de Paths** para evitar rutas relativas largas (ej: `@escenas/*` apunta a `src/escenas/*`).

### Bundler y Build (Vite)

- **Archivo:** [vite.config.ts](../vite.config.ts)
- **Implementación:**
  - Configuración de alias para que coincidan con `tsconfig.json`.
  - División de código (`manualChunks`) para separar `phaser` del código del juego, optimizando la carga.
  - Servidor en el puerto `3000`.

### Configuración Móvil (Capacitor)

- **Archivo:** [capacitor.config.ts](../capacitor.config.ts)
- **Descripción:** Define el ID de la app (`com.empresa.juegomario`) y el nombre de la aplicación para su futura exportación a Android/iOS.

---

## 2. Código Núcleo y Arquitectura

Se estableció el punto de entrada y el sistema de escenas inicial.

### Punto de Entrada

- **Archivo:** [src/main.ts](../src/main.ts)
- **Funcionamiento:** Importa la configuración del juego e instancia la clase `Phaser.Game`.

### Configuración Global de Phaser

- **Archivo:** [src/configuracion-juego.ts](../src/configuracion-juego.ts)
- **Implementación:**
  - Resolución de 800x600.
  - Sistema de física **Arcade** con gravedad en `600`.
  - Modo de escala `FIT` para adaptabilidad multidispositivo.

### Escenas Base

- **Carga Inicial:** [src/escenas/EscenaCarga.ts](../src/escenas/EscenaCarga.ts)
  - Es la primera escena en ejecutarse. Actualmente sirve como verificación lógica.

### Constantes y Tipado

- **Escenas:** [src/constantes/constantes-escenas.ts](../src/constantes/constantes-escenas.ts)
  - Define las "keys" de las escenas para evitar el uso de strings sueltos.
- **Física:** [src/constantes/constantes-fisica.ts](../src/constantes/constantes-fisica.ts)
  - Almacena valores como gravedad y velocidad de salto.

---

## 3. Entorno de Desarrollo (VS Code)

Para mantener la consistencia entre los 3 desarrolladores del equipo:

### Extensiones Recomendadas

- **Archivo:** [.vscode/extensions.json](../.vscode/extensions.json)
- **Contenido:** Lista de plugins como ESLint, Prettier y Phaser Editor 2D.

### Ajustes del Editor

- **Archivo:** [.vscode/settings.json](../.vscode/settings.json)
- **Implementación:** Autoformateo al guardar y tamaño de tabulación de `2` espacios.

---

## 4. Estructura de Directorios

Se creó la jerarquía completa de carpetas según el plan maestro:

| Directorio       | Propósito                                    |
| ---------------- | -------------------------------------------- |
| `src/escenas/`   | Lógica de las pantallas del juego.           |
| `src/entidades/` | Jugador, enemigos y objetos.                 |
| `src/sistemas/`  | Servicios transversales (Audio, Colisiones). |
| `assets/`        | Recursos gráficos y sonoros.                 |
| `publico/`       | Fonts y favicons estáticos.                  |

---

## 5. Verificación de Éxito

Al finalizar la fase, se realizaron las siguientes pruebas:

1. **Instalación:** `npm install` ejecutado sin errores.
2. **Entorno Dev:** `npm run dev` levanta el servidor en el puerto 3000 y muestra el canvas de Phaser.
3. **Build:** `npm run build` genera la carpeta `dist/` con el juego compilado y minificado.

---

**Estado:** ✅ FASE 0 COMPLETADA
