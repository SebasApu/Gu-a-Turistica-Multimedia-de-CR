# De volcanes a selvas: explorando Costa Rica

Guía Turística Multimedia interactiva de Costa Rica, desarrollada como aplicación web con **Web Components nativos** (sin frameworks externos). Proyecto del curso **IF-7102 Multimedios**, I Ciclo 2026, Universidad de Costa Rica – Sede Regional de Guanacaste.

---

## Estado del proyecto

**Fase actual:** Fase 1 — Propuesta y primer Custom Element funcional.

En esta entrega se incluye:

- Definición de la temática y selección de regiones/destinos
- Wireframe en Figma de la aplicación completa
- Estructura del archivo `destinos.json` con 8 destinos y los campos del enunciado
- Dos Custom Elements funcionales: `<app-header>` y `<mapa-costa-rica>`
- Mapa interactivo de Costa Rica con marcadores por destino y panel de información

Los recursos multimedia (imágenes, audio, video) y los componentes restantes (`<destino-card>`, `<destino-detalle>`, `<galeria-imagenes>`, `<audio-guia>`) se entregarán en las fases siguientes según el cronograma.

---

## Temática

**"De volcanes a selvas: explorando Costa Rica"** — recorrido por la diversidad geográfica del país, desde las costas del Pacífico Norte hasta las selvas primarias del Sur, pasando por los volcanes de la Cordillera Central y la cultura afrocaribeña del Atlántico.

### Destinos por región

| Región | Destinos |
|---|---|
| Pacífico Norte | Las Catalinas · Volcán Miravalles |
| Caribe | Tortuguero · Puerto Viejo de Talamanca |
| Región Central | Volcán Irazú · Sanatorio Durán |
| Región Sur | Corcovado · Península de Osa |

---

## Estructura del proyecto

```
proyecto-guia-turistica/
├── index.html
├── package.json
├── README.md
├── components/
│   ├── app-header.js          ← Custom Element: barra de navegación
│   └── mapa-costa-rica.js     ← Custom Element: mapa interactivo
├── data/
│   └── destinos.json          ← 8 destinos con campos del enunciado
├── assets/
│   └── img/
│       └── cr.svg             ← Mapa de Costa Rica con provincias
├── css/
│   └── global.css             ← Reset y estilos base
└── docs/
    └── ...                    ← Documentación de fases
```

---

## Custom Elements implementados

### `<app-header>`

Barra de navegación con el nombre de la guía y un menú de regiones. Usa Shadow DOM para encapsular sus estilos completamente.

**Eventos emitidos:**

| Evento | Detalle | Cuándo se dispara |
|---|---|---|
| `region-selected` | `{ region: string }` | Al hacer clic en uno de los botones de región |

**Uso:**

```html
<app-header></app-header>
```

### `<mapa-costa-rica>`

Mapa SVG interactivo de Costa Rica que carga los destinos desde el JSON y los muestra como pines coloreados según el tipo (volcán, playa, selva, ruinas). Al hacer clic en un pin se despliega un panel de información con descripción y puntos destacados.

**Atributos opcionales:**

| Atributo | Default | Descripción |
|---|---|---|
| `destinos` | `./data/destinos.json` | Ruta al JSON de destinos |
| `svg` | `./assets/img/cr.svg` | Ruta al SVG del mapa base |

**Uso:**

```html
<mapa-costa-rica></mapa-costa-rica>
```

---

## Estructura del JSON

Cada destino sigue esta estructura:

```json
{
  "id": "guanacaste-001",
  "nombre": "Las Catalinas",
  "region": "Pacífico Norte",
  "tipo": "playa",
  "x": 380,
  "y": 240,
  "lat": 10.4814,
  "lng": -85.7866,
  "descripcion": "Un pueblo costero de ensueño...",
  "imagen_portada": "",
  "galeria": [],
  "audio": "",
  "video": "",
  "actividades": ["Snorkeling en aguas cristalinas", "..."],
  "highlights": ["Playas vírgenes con arenas blancas", "..."]
}
```

Los campos `imagen_portada`, `galeria`, `audio` y `video` están preparados pero vacíos. Se completarán en Fase 2 cuando se incorporen los recursos multimedia.

Los campos `x` e `y` son coordenadas en píxeles dentro del viewBox del mapa SVG (calibradas matemáticamente a partir de la lat/lng real). Permiten posicionar los pines en el mapa interactivo.

---

## Ejecución local

El proyecto utiliza **ES Modules** y `fetch()` para cargar el JSON y el SVG, por lo que no se puede abrir `index.html` directamente con doble clic (genera un error de CORS por el protocolo `file://`). Es necesario levantar un servidor local.

### Requisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [pnpm](https://pnpm.io/) — alternativa moderna a npm

Si no tenés `pnpm` instalado:

```bash
npm install -g pnpm
```

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repo>
   cd proyecto-guia-turistica
   ```

2. Instalar dependencias:

   ```bash
   pnpm install
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   pnpm run dev
   ```

4. Abrir el navegador en la URL que indique la consola (típicamente <http://localhost:8080>).

---

## Tecnologías utilizadas

- **HTML5** + **CSS3** + **JavaScript ES6+**
- **Web Components API** (Custom Elements v1, Shadow DOM v1, ES Modules)
- **SVG** para el mapa base y los marcadores
- **pnpm** + **servor** como servidor de desarrollo
- Sin frameworks ni librerías de UI

---

## Wireframe

El diseño completo de la aplicación (todas las fases) se desarrolló en Figma:

🔗 [Ver wireframe en Figma](https://www.figma.com/make/ixXpUY44O4Jz7aO3IBUhDA/Gu%C3%ADa-Tur%C3%ADstica-Multimedia-Costa-Rica)

---

## Recursos

El mapa de Costa Rica (`assets/img/cr.svg`) está basado en el mapa SVG de [SimpleMaps](https://simplemaps.com), bajo licencia de uso comercial gratuito ([SVG License](https://simplemaps.com/resources/svg-license)).

Los recursos multimedia se documentarán en `CREDITOS.md` a partir de la Fase 2.

---

## Equipo

| Nombre | Carné |
|---|---|
| Martín Barquero Membreño | C20990 |
| Kristel Mariana Córdoba Carrillo | C22355 |
| José Esteban Jarquín Espinoza | C23968 |
| Sebastián Apu Guillén | C20501 |
| Michelle Rodríguez Oviedo | C26650 |

**Docente:** Lic. Iván Alonso Chavarría Cubero

Universidad de Costa Rica – Sede Regional de Guanacaste, Recinto de Liberia
Curso IF-7102 Multimedios – I Ciclo 2026