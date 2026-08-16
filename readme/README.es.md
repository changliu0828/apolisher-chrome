<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>Pule tu texto con IA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ja.md">日本語</a> |
  <strong>Español</strong> |
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

Una extensión de Chrome que prioriza la privacidad y pule texto en cualquier página web usando IA. Selecciona texto, haz clic en el botón de pulir y obtén sugerencias mejoradas con IA y comparación visual de diferencias.

## Características

- **Soporte Multi-Proveedor de IA**: Elige entre OpenAI, Claude o Gemini usando tu propia clave API
- **Pulido de Texto**: Selecciona cualquier texto y púlelo con IA
- **Múltiples Presets**: Prompts estándar, profesional, nativo, simplificado, inteligencia emocional o personalizado
- **Elección de Modelo**: Elige cualquier modelo al que tenga acceso tu clave API, por proveedor; la lista se obtiene en vivo
- **Interruptor Rápido**: Activa o desactiva la extensión desde el popup de la barra de herramientas
- **Diferencias Visuales**: Ve los cambios resaltados con inserciones (verde) y eliminaciones (rojo)
- **Privacidad Primero**: Tu clave API se queda local, sin recolección de datos ni telemetría
- **Compatibilidad Universal**: Funciona en cualquier página web, incluyendo Gmail, Google Docs y más

## Instalación

### Desde el Código Fuente

1. Clonar el repositorio:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. Instalar dependencias:
```bash
npm install
```

3. Construir la extensión:
```bash
npm run build
```

4. Cargar en Chrome:
   - Abrir `chrome://extensions`
   - Activar "Modo de desarrollador"
   - Hacer clic en "Cargar extensión sin empaquetar"
   - Seleccionar la carpeta `dist`

## Uso

1. **Configuración**: Elige tu proveedor de IA (OpenAI, Claude o Gemini) y agrega tu clave API en la configuración de la extensión
2. **Seleccionar**: Resalta texto en cualquier página web
3. **Pulir**: Haz clic en el botón <img src="../public/icons/icon32.png" width="16" height="16" alt="Ícono APolish" style="vertical-align: middle;"> que aparece
4. **Revisar**: Ve la comparación de diferencias en el modal
5. **Aceptar**: Haz clic en la marca de verificación para aplicar los cambios

## Configuración

Accede a la configuración haciendo clic en el ícono de la extensión o haciendo clic derecho y seleccionando "Opciones":

- **Proveedor de IA**: Elige entre OpenAI (GPT-5.6 Luna), Claude (Haiku 4.5) o Gemini (3.1 Flash Lite)
- **Clave API**: Tu clave API específica del proveedor (almacenada de forma segura en el almacenamiento de sincronización de Chrome)
- **Modelo**: Elige el modelo del proveedor seleccionado; la lista se obtiene con tu clave API (por defecto, el modelo anterior)
- **Presets de Prompt**: Elige entre estándar, profesional, nativo, simplificado, Inteligencia Emocional o personalizado
- **Máximo de Token**: Controla la longitud de respuesta (100-4000 Token, predeterminado: 2000)

## Stack Tecnológico

- **React** + **TypeScript** - Componentes de UI
- **Vite** - Sistema de construcción con @crxjs/vite-plugin
- **Tailwind CSS** - Estilos
- **Chrome Extension Manifest V3** - Arquitectura de extensión
- **IA Multi-Proveedor**: OpenAI (GPT-5.6 Luna), Claude (Haiku 4.5) o Gemini (3.1 Flash Lite)
- **Shadow DOM** - Aislamiento de estilos para script de contenido
- **chrome.i18n** - Internacionalización nativa (10 idiomas)
- **Vitest** + **happy-dom** - Pruebas unitarias (264 pruebas)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Construcción de desarrollo (con HMR)
npm run dev

# Construcción de producción
npm run build

# Ejecutar linter
npm run lint

# Verificación de tipos
npm run type-check

# Ejecutar pruebas
npm run test:run

# Compilar y empaquetar para Chrome Web Store
npm run package
```

## Estructura del Proyecto

```
src/
├── background/      # Service worker para llamadas API
├── content/         # Script de contenido y componentes UI
├── hooks/           # Hook de configuración compartido
├── i18n/            # Utilidades de Chrome i18n y claves de mensajes tipadas
├── options/         # Página de configuración
├── popup/           # Popup de la barra de herramientas (activar/desactivar)
├── prompts/         # Presets de prompts
├── services/        # Servicios de IA multi-proveedor (OpenAI, Claude, Gemini)
├── test/            # Configuración, mocks y fixtures de Vitest
├── types/           # Tipos TypeScript
└── utils/           # Utilidades
```

## Apoya este Proyecto

Si encuentras útil apolisher-chrome, ¡considera patrocinarlo! Tu apoyo ayuda a mantener este proyecto gratuito y de código abierto.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**Formas de apoyar:**
- ⭐ Dale una estrella a este repositorio
- 💖 [Conviértete en patrocinador](https://github.com/sponsors/changliu0828) (desde $3/mes)
- 🐛 Reporta errores y contribuye con código
- 📢 Comparte con otros que puedan encontrarlo útil

### Patrocinadores

¡Gracias a todos nuestros patrocinadores! 🙏

<!-- sponsors --><!-- sponsors -->

*¡Conviértete en el primer patrocinador y pon tu nombre aquí!*

## Licencia

MIT
