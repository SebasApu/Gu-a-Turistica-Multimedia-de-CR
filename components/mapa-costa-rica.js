const COLORES = {
  volcan: "#ef4444",
  playa: "#06b6d4",
  selva: "#10b981",
  ruinas: "#f59e0b",
  default: "#6366f1",
};

const ETIQUETAS_TIPO = {
  volcan: "Volcanes",
  playa: "Playas",
  selva: "Selvas",
  ruinas: "Ruinas",
};

const VIEW_BOX = "120 50 760 540";

// Mapeo de regiones del header a IDs de provincia en el SVG
const PROVINCIAS_POR_REGION = {
  "Caribe":          ["CRL"],
  "Pacífico Norte":  ["CRG"],
  "Región Central":  ["CRSJ", "CRH", "CRC", "CRA"],
  "Pacífico Sur":    ["CRP"],
};

class MapaCostaRica extends HTMLElement {
  constructor() {
    super();
    this.destinos = [];
    this._regionActiva = null;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.rutaJson = this.getAttribute("destinos") || "./data/destinos.json";
    this.rutaSvg  = this.getAttribute("svg")      || "./assets/img/cr.svg";
    this._render();
    this._cargarTodo();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>

        :host {
          display: block;
        }

        .wrap {
          max-width: 960px;
          margin: 0 auto;
          font-family: system-ui, sans-serif;
        }

        .mapa {
          background: linear-gradient(
            135deg,
            #ecfdf5,
            #ecfeff
          );
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        /* ─── Badge de provincia activa ─── */
        .provincia-badge {
          text-align: center;
          min-height: 28px;
          margin-bottom: 8px;
        }

        .provincia-badge span {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #166534;
          background: rgba(220, 252, 231, 0.95);
          border: 1px solid #86efac;
          border-radius: 20px;
          padding: 3px 18px;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          pointer-events: none;
        }

        .provincia-badge span.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── SVG contenedor ─── */
        .svg-contenedor {
          position: relative;
          width: 100%;
        }

        .svg-pais,
        .svg-pais > svg,
        .svg-pins {
          width: 100%;
          height: auto;
          display: block;
        }

        .svg-pins {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* ─── Provincias interactivas ─── */
        .svg-pais svg path {
          cursor: pointer;
          transition: fill 0.25s ease, opacity 0.25s ease, filter 0.25s ease;
        }

        .svg-pais svg path:hover,
        .svg-pais svg path.provincia-hover {
          fill: #4ade80 !important;
          filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.55));
        }

        /* Cuando hay región activa */
        .svg-pais svg path.prov-activa {
          fill: #22c55e !important;
          opacity: 1;
          filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.4));
        }

        .svg-pais svg path.prov-inactiva {
          opacity: 0.25;
          filter: none;
        }

        /* ─── Pins ─── */
        .pin {
          cursor: pointer;
          pointer-events: all;
        }

        .pin.oculto {
          display: none;
        }

        .tooltip {
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .pin:hover .tooltip {
          opacity: 1;
        }

        .tooltip text {
          font-family: system-ui, sans-serif;
        }

        /* ─── Leyenda ─── */
        .leyenda {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          margin-top: 20px;
        }

        .leyenda-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .leyenda-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

      </style>

      <div class="wrap">
        <div class="mapa">

          <div class="provincia-badge"><span></span></div>

          <div class="svg-contenedor">
            <div class="svg-pais"></div>

            <svg
              class="svg-pins"
              viewBox="${VIEW_BOX}"
              preserveAspectRatio="xMidYMid meet">
              <g class="marcadores"></g>
            </svg>
          </div>

          <div class="leyenda"></div>

        </div>
      </div>
    `;
  }

  async _cargarTodo() {
    await Promise.all([this._cargarSvg(), this._cargarDestinos()]);
    this._pintarMarcadores();
    this._pintarLeyenda();
  }

  async _cargarSvg() {
    try {
      const resp = await fetch(this.rutaSvg);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      let svgTexto = await resp.text();
      svgTexto = svgTexto.replace(/viewBox="[^"]*"/i, `viewBox="${VIEW_BOX}"`);

      this.shadowRoot.querySelector(".svg-pais").innerHTML = svgTexto;
      this._configurarProvincias();
    } catch (err) {
      console.error("[mapa-costa-rica] error cargando SVG:", err);
    }
  }

  _configurarProvincias() {
    const badge     = this.shadowRoot.querySelector(".provincia-badge span");
    const svgEl     = this.shadowRoot.querySelector(".svg-pais svg");
    if (!svgEl) return;

    svgEl.querySelectorAll("path[id]").forEach(path => {
      const nombre = path.getAttribute("name");
      if (!nombre) return;

      path.addEventListener("mouseenter", () => {
        // No sobreescribir si ya hay clase de región activa/inactiva en hover
        path.classList.add("provincia-hover");
        badge.textContent = nombre;
        badge.classList.add("visible");
      });

      path.addEventListener("mouseleave", () => {
        path.classList.remove("provincia-hover");
        badge.classList.remove("visible");
      });
    });
  }

  async _cargarDestinos() {
    try {
      const resp = await fetch(this.rutaJson);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.destinos = data.destinos || [];
    } catch (err) {
      console.error("[mapa-costa-rica] error cargando destinos:", err);
    }
  }

  /* ─── API pública ─── */

  /**
   * Filtra el mapa por región. Pasa null para mostrar todo.
   * @param {string|null} region
   */
  filtrarPorRegion(region) {
    this._regionActiva = region || null;
    this._aplicarFiltro();
  }

  _aplicarFiltro() {
    const region = this._regionActiva;
    const svgEl  = this.shadowRoot.querySelector(".svg-pais svg");

    // 1. Provincias
    if (svgEl) {
      const activas = region ? (PROVINCIAS_POR_REGION[region] || []) : [];

      svgEl.querySelectorAll("path[id]").forEach(path => {
        path.classList.remove("prov-activa", "prov-inactiva");

        if (region) {
          if (activas.includes(path.id)) {
            path.classList.add("prov-activa");
          } else {
            path.classList.add("prov-inactiva");
          }
        }
      });
    }

    // 2. Pins
    this.shadowRoot.querySelectorAll(".pin").forEach(pin => {
      const id      = pin.getAttribute("data-destino-id");
      const destino = this.destinos.find(d => d.id === id);

      if (!region || (destino && destino.region === region)) {
        pin.classList.remove("oculto");
      } else {
        pin.classList.add("oculto");
      }
    });
  }

  /* ─── Render de marcadores ─── */

  _pintarMarcadores() {
    const grupo = this.shadowRoot.querySelector(".marcadores");
    if (!grupo) return;

    grupo.innerHTML = "";

    this.destinos.forEach((d) => {
      const color = COLORES[d.tipo] || COLORES.default;

      const gPin = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gPin.setAttribute("class", "pin");
      gPin.setAttribute("transform", `translate(${d.x}, ${d.y})`);
      gPin.setAttribute("data-destino-id", d.id);

      // Partir tooltip en líneas de máx 32 chars
      const palabras = d.tooltip.split(" ");
      const lineas   = [];
      let lineaActual = "";

      palabras.forEach((palabra) => {
        const test = `${lineaActual} ${palabra}`.trim();
        if (test.length > 32) {
          lineas.push(lineaActual);
          lineaActual = palabra;
        } else {
          lineaActual = test;
        }
      });

      if (lineaActual) lineas.push(lineaActual);

      const altura = 42 + lineas.length * 14;

      const tspans = lineas
        .map(
          (linea, i) => `
          <tspan x="12" dy="${i === 0 ? 0 : 14}">
            ${linea}
          </tspan>
        `,
        )
        .join("");

      const moverIzquierda = d.x > 620;
      const tooltipX       = moverIzquierda ? -250 : 16;

      gPin.innerHTML = `
        <circle
          r="14"
          fill="${color}"
          opacity="0.25"
        />

        <circle
          r="8"
          fill="${color}"
          stroke="white"
          stroke-width="2"
        />

        <g class="tooltip"
           transform="translate(${tooltipX},-12)">

          <rect
            x="0"
            y="-18"
            rx="8"
            ry="8"
            width="240"
            height="${altura}"
            fill="white"
            stroke="${color}"
            stroke-width="1.5"
          />

          <text
            x="12"
            y="0"
            font-size="12"
            font-weight="700"
            fill="${color}">
            ${d.nombre}
          </text>

          <text
            x="12"
            y="20"
            font-size="10"
            fill="#374151">
            ${tspans}
          </text>

        </g>
      `;

      gPin.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("destino-seleccionado", {
            bubbles: true,
            composed: true,
            detail: { destinoId: d.id },
          }),
        );
      });

      grupo.appendChild(gPin);
    });
  }

  _pintarLeyenda() {
    const tiposPresentes = [...new Set(this.destinos.map((d) => d.tipo))];

    const html = tiposPresentes
      .map(
        (tipo) => `
        <span class="leyenda-item">
          <span
            class="leyenda-dot"
            style="background:${COLORES[tipo] || COLORES.default}">
          </span>
          ${ETIQUETAS_TIPO[tipo] || tipo}
        </span>
      `,
      )
      .join("");

    this.shadowRoot.querySelector(".leyenda").innerHTML = html;
  }
}

customElements.define("mapa-costa-rica", MapaCostaRica);
