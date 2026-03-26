# 🏁 FASE 0 — Setup del Proyecto

### Juego tipo Mario Bros — Configuración base completa

---

## Índice

1. [Prerequisitos](#1-prerequisitos)
2. [Crear el repositorio en GitHub](#2-crear-el-repositorio-en-github)
3. [Inicializar el proyecto con Vite + TypeScript](#3-inicializar-el-proyecto-con-vite--typescript)
4. [Instalar dependencias](#4-instalar-dependencias)
5. [Configurar tsconfig.json](#5-configurar-tsconfigjson)
6. [Configurar vite.config.ts](#6-configurar-viteconfigts)
7. [Configurar Capacitor](#7-configurar-capacitor)
8. [Crear la estructura de carpetas](#8-crear-la-estructura-de-carpetas)
9. [Crear archivos base](#9-crear-archivos-base)
10. [Configurar .gitignore](#10-configurar-gitignore)
11. [Configurar GitHub — Labels y Milestones](#11-configurar-github--labels-y-milestones)
12. [Verificación final](#12-verificación-final)
13. [Convenciones del equipo](#13-convenciones-del-equipo)
14. [Errores comunes y cómo evitarlos](#14-errores-comunes-y-cómo-evitarlos)

---

## 1. Prerequisitos

se debe tener en cuenta que toda funcion, nombre de variable o clase debe estar en español y escrita en en snake_case,
se deben seguir las buenas normas de nombrado de funciones, deben ser descriptivas y claras, no deben ser ambiguas ni confusas y deben estar en español.
Antes de empezar, los 3 integrantes del equipo deben tener instalado lo siguiente:

### Software requerido

| Herramienta    | Versión mínima  | Descarga                      |
| -------------- | --------------- | ----------------------------- |
| Node.js        | 18.x o superior | https://nodejs.org            |
| npm            | 9.x o superior  | Viene con Node.js             |
| VS Code        | Última versión  | https://code.visualstudio.com |
| GitHub Desktop | Última versión  | https://desktop.github.com    |
| Git            | Última versión  | https://git-scm.com           |

### Verificar instalaciones

Abrir terminal y correr:

```bash
node --version     # Debe mostrar v18.x.x o superior
npm --version      # Debe mostrar 9.x.x o superior
git --version      # Debe mostrar git version 2.x.x
```

### Extensiones de VS Code recomendadas para el equipo

Instalar estas extensiones en VS Code antes de empezar. Buscarlas en el panel de extensiones (Ctrl+Shift+X):

- **ESLint** — Detecta errores en TypeScript en tiempo real
- **Prettier** — Formatea el código automáticamente al guardar
- **GitLens** — Muestra quién escribió cada línea
- **Phaser Editor 2D** — Intellisense para Phaser 3
- **Path Intellisense** — Autocompleta rutas de archivos
- **Error Lens** — Muestra errores inline en el código
- **TypeScript Importer** — Importa clases automáticamente

> 💡 **Consejo:** Crear un archivo `.vscode/extensions.json` en el repo con las extensiones recomendadas. VS Code le pregunta a cada colaborador si quiere instalarlas automáticamente.

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "phaserys.phaser-editor2d-core",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens",
    "pmneo.tsimporter"
  ]
}
```

---

## 2. Crear el repositorio en GitHub

### Paso a paso

1. Ir a https://github.com y hacer clic en **New repository**
2. Configurar:
   - **Repository name:** `juego-mario-empresa`
   - **Visibility:** Private (es un proyecto empresarial)
   - **Initialize with README:** ✅ Sí
   - **Add .gitignore:** No (lo crearemos manualmente)
   - **Choose a license:** No aplica por ahora
3. Clic en **Create repository**

### Invitar colaboradores

1. Ir a **Settings → Collaborators → Add people**
2. Agregar los otros 2 devs por su nombre de usuario de GitHub
3. Ellos recibirán un email con la invitación

### Proteger la rama main

Esta configuración evita que alguien haga push directo a `main` sin revisión:

1. Ir a **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Activar:
   - ✅ **Require a pull request before merging**
   - ✅ **Require at least 1 approval**
   - ✅ **Require status checks to pass**
4. Clic en **Create**

> ⚠️ **Importante:** Nadie debe hacer push directo a `main`. Todo entra por Pull Request. Esto evita conflictos graves en el código compartido.

### Clonar el repositorio

Cada integrante del equipo hace esto una sola vez:

**Con GitHub Desktop:**

1. Abrir GitHub Desktop
2. File → Clone Repository
3. Buscar `juego-mario-empresa`
4. Elegir carpeta local
5. Clic en Clone

**Con terminal:**

```bash
git clone https://github.com/tu-usuario/juego-mario-empresa.git
cd juego-mario-empresa
```

---

## 3. Inicializar el proyecto con Vite + TypeScript

Desde la carpeta del proyecto clonado, correr en la terminal:

```bash
npm create vite@latest . -- --template vanilla-ts
```

> ⚠️ El punto `.` indica que se inicializa en la carpeta actual, no en una subcarpeta nueva. Si pregunta si quiere sobreescribir archivos existentes, escribir `y`.

Este comando crea:

```
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts  (no siempre, a veces es vite.config.js)
├── src/
│   ├── main.ts
│   └── vite-env.d.ts
└── public/
```

Verificar que funciona:

```bash
npm install
npm run dev
```

Debe abrir `http://localhost:5173` con una página de ejemplo. Si aparece, Vite está funcionando.

---

## 4. Instalar dependencias

### Dependencias del juego (producción)

```bash
npm install phaser
```

### Dependencias de desarrollo

```bash
npm install --save-dev @types/node
```

> 💡 **Por qué `@types/node`:** Permite usar paths absolutos con `~` o `@` en los imports sin errores de TypeScript.

### Capacitor (para móvil, se instala ahora para configurar desde el inicio)

```bash
npm install @capacitor/core
npm install --save-dev @capacitor/cli
```

### Verificar `package.json`

Después de instalar, el archivo debe verse similar a esto:

```json
{
  "name": "juego-mario-empresa",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@capacitor/core": "^6.x.x",
    "phaser": "^3.x.x"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.x.x",
    "@types/node": "^20.x.x",
    "typescript": "^5.x.x",
    "vite": "^5.x.x"
  }
}
```

> ⚠️ **Importante:** El campo `"type": "module"` debe estar presente. Indica que el proyecto usa ES Modules, que es el estándar moderno y el que Vite espera.

---

## 5. Configurar tsconfig.json

Reemplazar el contenido del `tsconfig.json` generado por Vite con esta configuración optimizada para el proyecto:

```json
{
  "compilerOptions": {
    // --- Versión y módulos ---
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    // --- Calidad del código ---
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // --- Interoperabilidad ---
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // --- Salida ---
    "outDir": "./dist",
    "skipLibCheck": true,
    "useDefineForClassFields": true,

    // --- Paths (alias de carpetas) ---
    "baseUrl": ".",
    "paths": {
      "@escenas/*": ["src/escenas/*"],
      "@entidades/*": ["src/entidades/*"],
      "@sistemas/*": ["src/sistemas/*"],
      "@niveles/*": ["src/niveles/*"],
      "@ui/*": ["src/ui/*"],
      "@animaciones/*": ["src/animaciones/*"],
      "@constantes/*": ["src/constantes/*"],
      "@tipos/*": ["src/tipos/*"],
      "@utilidades/*": ["src/utilidades/*"],
      "@assets/*": ["assets/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "android", "ios"]
}
```

### Explicación de las opciones clave

| Opción                          | Por qué se usa                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `"target": "ES2020"`            | Compatibilidad con navegadores modernos y con los webviews de Android/iOS que usará Capacitor                            |
| `"strict": true`                | Activa todas las verificaciones de TypeScript. Previene bugs difíciles de encontrar                                      |
| `"noUnusedLocals"`              | Evita que el código se llene de variables declaradas y nunca usadas                                                      |
| `"paths"`                       | Permite escribir `import { Jugador } from '@entidades/jugador/Jugador'` en vez de `'../../../entidades/jugador/Jugador'` |
| `"moduleResolution": "bundler"` | Le dice a TypeScript que Vite va a resolver los módulos, no Node directamente                                            |
| `"isolatedModules": true`       | Requerido para que Vite compile cada archivo de forma independiente y rápida                                             |
| `"resolveJsonModule": true`     | Permite importar archivos `.json` directamente (necesario para los tilemaps de Tiled)                                    |

> ⚠️ **Importante sobre `paths`:** Los alias del `tsconfig.json` le dicen a TypeScript cómo resolver los imports, pero Vite también necesita saberlo. Eso se configura en el siguiente paso.

---

## 6. Configurar vite.config.ts

Crear o reemplazar el archivo `vite.config.ts` en la raíz del proyecto:

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // --- Alias de rutas (deben coincidir exactamente con los paths del tsconfig.json) ---
  resolve: {
    alias: {
      "@escenas": resolve(__dirname, "src/escenas"),
      "@entidades": resolve(__dirname, "src/entidades"),
      "@sistemas": resolve(__dirname, "src/sistemas"),
      "@niveles": resolve(__dirname, "src/niveles"),
      "@ui": resolve(__dirname, "src/ui"),
      "@animaciones": resolve(__dirname, "src/animaciones"),
      "@constantes": resolve(__dirname, "src/constantes"),
      "@tipos": resolve(__dirname, "src/tipos"),
      "@utilidades": resolve(__dirname, "src/utilidades"),
      "@assets": resolve(__dirname, "assets"),
    },
  },

  // --- Servidor de desarrollo ---
  server: {
    port: 3000, // Puerto fijo para que todos en el equipo usen la misma URL
    open: true, // Abre el navegador automáticamente al correr npm run dev
    host: true, // Permite acceder desde otros dispositivos en la misma red (útil para probar en móvil)
  },

  // --- Build de producción ---
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true, // Genera mapas de fuente para debuggear el build de producción
    rollupOptions: {
      output: {
        // Separar Phaser en su propio chunk para optimizar la carga
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },

  // --- Assets ---
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.webp",
    "**/*.ogg",
    "**/*.mp3",
    "**/*.wav",
    "**/*.json", // Para los tilemaps de Tiled
    "**/*.atlas",
  ],
});
```

### Por qué `manualChunks` para Phaser

Phaser es una librería grande (~1MB). Sin esta configuración, Vite la incluye junto con todo el código del juego en un solo archivo. Al separarla, el navegador puede cachear Phaser independientemente. Si el jugador actualiza la página, solo descarga los cambios del juego, no Phaser de nuevo.

---

## 7. Configurar Capacitor

Inicializar Capacitor en el proyecto:

```bash
npx cap init
```

El CLI preguntará:

- **App name:** `Juego Mario Empresa` (nombre que aparece en el celular)
- **App Package ID:** `com.empresa.juegomario` (identificador único, estilo dominio invertido)
- **Web asset directory:** `dist` (debe coincidir con el `outDir` de Vite)

Esto genera el archivo `capacitor.config.ts`. Editarlo para que quede así:

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.empresa.juegomario",
  appName: "Juego Mario Empresa",
  webDir: "dist",
  server: {
    // En desarrollo, puede apuntar al servidor de Vite para live reload en dispositivo real
    // Comentar esta línea para el build de producción
    // url: 'http://192.168.1.x:3000',
    cleartext: true,
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
};

export default config;
```

> ⚠️ **Nota:** Los comandos `npx cap add android` y `npx cap add ios` que generan las carpetas `android/` e `ios/` se corren hasta la Fase 5. Por ahora solo se configura el archivo base.

---

## 8. Crear la estructura de carpetas

Correr este comando desde la raíz del proyecto para crear toda la estructura de una sola vez:

**En Mac/Linux:**

```bash
mkdir -p src/{escenas,entidades/{jugador,enemigos,objetos},niveles,sistemas,ui,animaciones,constantes,tipos,utilidades}
mkdir -p assets/{sprites/{jugador,enemigos,objetos},tilemaps,tilesets,audio/{musica,efectos},ui}
mkdir -p publico/{favicon,fuentes}
mkdir -p .vscode
```

**En Windows (PowerShell):**

```powershell
$dirs = @(
  "src/escenas", "src/entidades/jugador", "src/entidades/enemigos",
  "src/entidades/objetos", "src/niveles", "src/sistemas", "src/ui",
  "src/animaciones", "src/constantes", "src/tipos", "src/utilidades",
  "assets/sprites/jugador", "assets/sprites/enemigos", "assets/sprites/objetos",
  "assets/tilemaps", "assets/tilesets", "assets/audio/musica",
  "assets/audio/efectos", "assets/ui", "publico/favicon", "publico/fuentes",
  ".vscode"
)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ }
```

---

## 9. Crear archivos base

### `src/main.ts` — Punto de entrada

```typescript
import Phaser from "phaser";
import { configuracionJuego } from "./configuracion-juego";

// Inicializar Phaser con la configuración global
new Phaser.Game(configuracionJuego);
```

### `src/configuracion-juego.ts` — Configuración global de Phaser

```typescript
import Phaser from "phaser";
import { EscenaCarga } from "@escenas/EscenaCarga";

export const configuracionJuego: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // AUTO detecta si usar WebGL o Canvas automáticamente
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false, // Cambiar a true para ver colisiones durante desarrollo
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, // Escala el juego para llenar la pantalla manteniendo proporción
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    EscenaCarga, // Primera escena que carga — agrega más aquí a medida que se crean
  ],
  parent: "game-container",
};
```

### `index.html` — HTML base

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <title>Juego Mario Empresa</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
      #game-container canvas {
        display: block;
      }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### `src/escenas/EscenaCarga.ts` — Escena placeholder para verificar que todo funciona

```typescript
import Phaser from "phaser";

export class EscenaCarga extends Phaser.Scene {
  constructor() {
    super({ key: "EscenaCarga" });
  }

  preload(): void {
    // Aquí se cargarán los assets en fases posteriores
    console.log("EscenaCarga: preload iniciado");
  }

  create(): void {
    // Texto de verificación — reemplazar en Fase 1
    this.add
      .text(400, 300, "✅ Phaser funcionando", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    console.log("EscenaCarga: create completado");
  }
}
```

### `src/constantes/constantes-escenas.ts` — Keys de escenas como constantes

```typescript
// Nunca usar strings sueltos para identificar escenas
// Siempre usar estas constantes para evitar errores de typo

export const ESCENAS = {
  CARGA: "EscenaCarga",
  MENU: "EscenaMenu",
  JUEGO: "EscenaJuego",
  UI: "EscenaUI",
  GAME_OVER: "EscenaGameOver",
  VICTORIA: "EscenaVictoria",
  PAUSA: "EscenaPausa",
  NIVELES: "EscenaNiveles",
} as const;

export type ClaveEscena = (typeof ESCENAS)[keyof typeof ESCENAS];
```

### `src/constantes/constantes-fisica.ts`

```typescript
export const FISICA = {
  GRAVEDAD: 600,
  VELOCIDAD_JUGADOR: 200,
  FUERZA_SALTO: -500,
  VELOCIDAD_ENEMIGO: 80,
} as const;
```

### `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "christian-kohler.path-intellisense",
    "usernamehw.errorlens",
    "pmneo.tsimporter"
  ]
}
```

### `.vscode/settings.json` — Configuración compartida del editor

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.eol": "\n"
}
```

> 💡 **Por qué compartir settings de VS Code:** Así todos en el equipo tienen el mismo formato de código automáticamente. Evita commits que solo cambian espacios o tabs.

---

## 10. Configurar .gitignore

```gitignore
# Dependencias
node_modules/

# Build
dist/
dist-ssr/

# Entorno
.env
.env.local
.env.*.local

# Capacitor — plataformas generadas (se agregan en Fase 5)
android/
ios/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# VS Code (excepto settings y extensions compartidos)
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# TypeScript
*.tsbuildinfo
```

---

## 11. Configurar GitHub — Labels y Milestones

### Labels recomendados

Ir a GitHub → Issues → Labels → y crear los siguientes:

| Nombre          | Color     | Descripción                      |
| --------------- | --------- | -------------------------------- |
| `gameplay`      | `#0075ca` | Mecánicas y lógica del juego     |
| `bug`           | `#d73a4a` | Algo no funciona como se espera  |
| `ui`            | `#e4e669` | Interfaz de usuario y HUD        |
| `audio`         | `#a2eeef` | Música y efectos de sonido       |
| `movil`         | `#0e8a16` | Específico para Android/iOS      |
| `nivel`         | `#f9d0c4` | Diseño y construcción de niveles |
| `optimizacion`  | `#5319e7` | Rendimiento y tamaño de assets   |
| `documentacion` | `#cfd3d7` | README, comentarios, guías       |
| `setup`         | `#e99695` | Configuración e infraestructura  |

### Milestones recomendados

Ir a GitHub → Issues → Milestones → New milestone:

| Nombre              | Descripción                               |
| ------------------- | ----------------------------------------- |
| `v0.1 Prototipo`    | Jugador se mueve y colisiona en 1 nivel   |
| `v0.2 Enemigos`     | Enemigos, monedas y power-ups funcionando |
| `v0.3 Niveles`      | Todos los niveles con progresión guardada |
| `v0.4 Arte y Audio` | Assets finales, animaciones y sonido      |
| `v0.5 Beta Web`     | Juego completo y optimizado en web        |
| `v1.0 APK`          | Versión móvil Android publicable          |

---

## 12. Verificación final

Antes de dar por terminada la Fase 0, verificar que todos los puntos pasan:

### Checklist técnico

- [ ] `npm run dev` levanta el servidor sin errores
- [ ] El navegador muestra el canvas negro con el texto "✅ Phaser funcionando"
- [ ] No hay errores de TypeScript en ningún archivo
- [ ] Los imports con alias funcionan (ejemplo: `import algo from '@constantes/constantes-escenas'`)
- [ ] `npm run build` genera la carpeta `dist/` sin errores
- [ ] Los 3 devs pueden clonar el repo y correr `npm install && npm run dev` exitosamente

### Checklist de equipo

- [ ] Los 3 colaboradores tienen acceso al repo
- [ ] La rama `main` tiene protección activada (requiere PR y 1 aprobación)
- [ ] Los labels y milestones están creados en GitHub
- [ ] Todos tienen las extensiones de VS Code instaladas
- [ ] Todos entienden el flujo: crear rama → trabajar → PR → revisión → merge

---

## 13. Convenciones del equipo

Acordar estas reglas antes de escribir código. Deben quedar documentadas en el README.

### Nombres de archivos

```
PascalCase  → Clases:       EscenaJuego.ts, Jugador.ts, EnemigoBase.ts
kebab-case  → Constantes:   constantes-fisica.ts, constantes-escenas.ts
kebab-case  → Configuración: configuracion-juego.ts, vite.config.ts
```

### Nombres de ramas en Git

```
feature/nombre-de-la-funcionalidad   → Nueva funcionalidad
fix/descripcion-del-bug              → Corrección de bug
refactor/que-se-refactoriza          → Limpieza de código

Ejemplos:
feature/movimiento-jugador
fix/colision-goomba-falla-en-movil
refactor/sistema-colisiones
```

### Mensajes de commit

Usar el prefijo del tipo de cambio:

```
feat: agrega movimiento horizontal al jugador
fix: corrige salto doble no deseado
refactor: extrae lógica de estados a EstadosJugador
style: corrige formato de EscenaCarga
docs: agrega comentarios a SistemaColisiones
chore: actualiza versión de Phaser
```

### Reglas generales de código

- Siempre tipar explícitamente los parámetros y retornos de funciones
- Nunca usar `any` como tipo — si no sabes el tipo, usar `unknown` y luego tipar
- Comentar el "por qué", no el "qué" (el código describe el qué, los comentarios el por qué)
- Máximo 80-100 caracteres por línea
- Una clase por archivo

---

## 14. Errores comunes y cómo evitarlos

### Error: "Cannot find module '@escenas/...'"

**Causa:** El alias está en `tsconfig.json` pero no en `vite.config.ts`, o viceversa.
**Solución:** Verificar que los alias en ambos archivos coincidan exactamente, incluyendo mayúsculas.

### Error: "Phaser is not defined"

**Causa:** Importar Phaser con `import * as Phaser from 'phaser'` en vez de `import Phaser from 'phaser'`.
**Solución:** Usar siempre el import por defecto: `import Phaser from 'phaser'`

### Error: "type": "module" — ERR_REQUIRE_ESM

**Causa:** Algún archivo de configuración usa `require()` en vez de `import`.
**Solución:** Usar sintaxis ES Modules en todos los archivos `.ts` y `.js` del proyecto.

### El build funciona pero en Capacitor no carga nada

**Causa:** El `webDir` en `capacitor.config.ts` no coincide con el `outDir` de Vite.
**Solución:** Ambos deben ser `'dist'`.

### Conflictos de merge frecuentes en `package-lock.json`

**Causa:** Dos personas instalaron paquetes distintos al mismo tiempo.
**Solución:** Siempre hacer `git pull` antes de instalar nuevos paquetes. Si hay conflicto en `package-lock.json`, borrarlo y correr `npm install` de nuevo.
