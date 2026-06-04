# De volcanes a selvas: Explorando Costa Rica

Guía Turística Multimedia de Costa Rica — Proyecto Final IF7102 Multimedios, I Ciclo 2026.

Aplicación web interactiva construida con **Web Components nativos** (Custom Elements v1, Shadow DOM v1, ES Modules). Sin frameworks externos.

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6+
- API nativa de Web Components
- `<audio>` nativo (HTMLMediaElement)
- Datos en JSON cargados dinámicamente con `fetch()`

## Cómo ejecutar

Los ES Modules requieren un servidor HTTP local. Dos opciones:

### Opción 1 — con pnpm (recomendado)

```bash
pnpm install
pnpm run dev
```

Abre el navegador en: `http://localhost:1234`

### Opción 2 — con Node.js (npx)

```bash
npx serve .
```

### Opción 3 — con Python

```bash
python -m http.server 8080
```

Abre: `http://localhost:8080`

> ⚠️ No abrir `index.html` directamente con `file://` — los ES Modules no funcionan sin servidor.

## Estructura del proyecto

```
├── index.html
├── data/
│   └── destinos.json
├── components/
│   ├── app-header.js
│   ├── mapa-costa-rica.js
│   ├── destino-card.js
│   ├── destino-detalle.js
│   ├── galeria-imagenes.js
│   └── audio-guia.js
├── assets/
│   ├── img/
│   ├── audio/
│   └── video/
├── css/
│   └── global.css
└── docs/
    ├── README.md
    └── CREDITOS.md
```

## Custom Elements

| Elemento | Descripción |
|---|---|
| `<app-header>` | Barra de navegación con filtro por región. Emite `region-selected`. |
| `<mapa-costa-rica>` | Mapa SVG interactivo con pins por destino. Emite `destino-seleccionado`. |
| `<destino-detalle>` | Vista completa del destino seleccionado. |
| `<destino-card>` | Tarjeta con galería, descripción y actividades. Emite `destino-selected`. |
| `<galeria-imagenes>` | Galería con navegación anterior/siguiente. |
| `<audio-guia>` | Reproductor de audio con barra de progreso y controles play/pause. |

## Regiones cubiertas

- **Caribe**: Tortuguero, Puerto Viejo de Talamanca
- **Pacífico Norte**: Las Catalinas, Volcán Miravalles
- **Región Central**: Volcán Irazú, Sanatorio Durán
- **Pacífico Sur**: Corcovado, Península de Osa

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md) y [`docs/CREDITOS.md`](docs/CREDITOS.md).

---

## Equipo

| Nombre | Carné |
|---|---|
| Martín Barquero Membreño | C20990 |
| Kristel Mariana Córdoba Carrillo | C22355 |
| José Esteban Jarquín Espinoza | C23968 |
| Sebastián Apu Guillén | C20501 |
| Michelle Rodríguez Oviedo | C26655 |

**Docente:** Lic. Iván Alonso Chavarría Cubero

Universidad de Costa Rica – Sede Regional de Guanacaste, Recinto de Liberia
Curso IF-7102 Multimedios – I Ciclo 2026