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

const PROVINCIAS_POR_REGION = {
  Caribe: ["CRL"],
  "Pacífico Norte": ["CRG"],
  "Región Central": ["CRSJ", "CRH", "CRC", "CRA"],
  "Pacífico Sur": ["CRP"],
};

class MapaCostaRica extends HTMLElement {
  constructor() {
    super();
    this.destinos = [];
    this._regionActiva = null;
    this._destinoActivoId = null;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.rutaJson = this.getAttribute("destinos") || "./data/destinos.json";
    this.rutaSvg = this.getAttribute("svg") || "./assets/img/cr.svg";
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
          max-width: 1040px;
          margin: 0 auto;
          font-family: Inter, system-ui, sans-serif;
        }

        .mapa {
          background:
            radial-gradient(
              circle at top left,
              rgba(220, 252, 231, 0.7) 0%,
              transparent 28%
            ),
            linear-gradient(180deg, #f8fafc 0%, #f0fdf4 100%);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
        }

        .mapa-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 20px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #0f766e;
          font-weight: 800;
        }

        h2 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          line-height: 1.1;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .intro {
          margin: 14px auto 0;
          color: #4b5563;
          line-height: 1.8;
          max-width: 680px;
        }

        .provincia-badge {
          text-align: center;
          min-height: 34px;
          margin: 14px 0 8px;
        }

        .provincia-badge span {
          display: inline-block;
          font-size: 13px;
          font-weight: 700;
          color: #166534;
          background: rgba(220, 252, 231, 0.96);
          border: 1px solid #86efac;
          border-radius: 999px;
          padding: 6px 16px;
          opacity: 0;
          transform: translateY(-4px);
          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
          pointer-events: none;
        }

        .provincia-badge span.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .svg-contenedor {
          position: relative;
          width: 100%;
          border-radius: 22px;
          overflow: hidden;
          background: rgba(236, 253, 245, 0.65);
        }

        .svg-pais,
        .svg-pais > svg,
        .svg-pins {
          width: 100%;
          height: auto;
          display: block;
        }

        .svg-pais {
          min-height: 280px;
        }

        .svg-pins {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .svg-pais svg path {
          cursor: pointer;
          transition:
            fill 0.25s ease,
            opacity 0.25s ease,
            filter 0.25s ease,
            transform 0.25s ease;
        }

        .svg-pais svg path:hover,
        .svg-pais svg path.provincia-hover {
          fill: #4ade80 !important;
          filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.55));
        }

        .svg-pais svg path.prov-activa {
          fill: #22c55e !important;
          opacity: 1;
          filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.34));
        }

        .svg-pais svg path.prov-inactiva {
          opacity: 0.22;
          filter: none;
        }

        .pin {
          cursor: pointer;
          pointer-events: all;
        }

        .pin.oculto {
          display: none;
        }

        .pin.activo .nucleo {
          stroke: #111827;
          stroke-width: 3;
        }

        .pin.activo .halo {
          opacity: 0.45;
        }

        .halo {
          opacity: 0.25;
          transform-origin: center;
        }

        .tooltip {
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .pin:hover .tooltip,
        .pin.activo .tooltip {
          opacity: 1;
        }

        .tooltip text {
          font-family: Inter, system-ui, sans-serif;
        }

        .leyenda {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px 18px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #e5e7eb;
        }

        .leyenda-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          font-weight: 600;
        }

        .leyenda-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 768px) {
          .mapa {
            padding: 20px;
            border-radius: 22px;
          }

          .intro {
            font-size: 0.98rem;
          }
        }
      </style>

      <div class="wrap">
        <div class="mapa">
          <div class="mapa-header">
            <p class="eyebrow">Explora por región</p>
            <h2>Encuentra playas, volcanes y selvas en el mapa</h2>
            <p class="intro">
              Selecciona una región o pulsa un marcador para descubrir
              recomendaciones, actividades y audioguías de cada destino.
            </p>
          </div>

          <div class="provincia-badge">
            <span></span>
          </div>

          <div class="svg-contenedor">
            <div class="svg-pais"></div>

            <svg
              class="svg-pins"
              viewBox="${VIEW_BOX}"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true">
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
    this._aplicarFiltro();
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
    const badge = this.shadowRoot.querySelector(".provincia-badge span");
    const svgEl = this.shadowRoot.querySelector(".svg-pais svg");
    if (!svgEl) return;

    svgEl.querySelectorAll("path[id]").forEach((path) => {
      const nombre = path.getAttribute("name");
      if (!nombre) return;

      path.addEventListener("mouseenter", () => {
        path.classList.add("provincia-hover");
        badge.textContent = nombre;
        badge.classList.add("visible");
      });

      path.addEventListener("mouseleave", () => {
        path.classList.remove("provincia-hover");
        badge.classList.remove("visible");
      });
path.addEventListener("click", () => {
      if (this._regionActiva) {
        this._regionActiva = null;
        this._aplicarFiltro();
        this.dispatchEvent(
          new CustomEvent("region-cleared", {
            bubbles: true,
            composed: true,
          }),
        );
      }
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

  filtrarPorRegion(region) {
    this._regionActiva = region || null;
    this._aplicarFiltro();
  }

  marcarDestinoActivo(destinoId) {
    this._destinoActivoId = destinoId || null;

    this.shadowRoot.querySelectorAll(".pin").forEach((pin) => {
      pin.classList.toggle(
        "activo",
        pin.getAttribute("data-destino-id") === this._destinoActivoId,
      );
    });
  }

_aplicarFiltro() {
  const region = this._regionActiva;
  const svgEl = this.shadowRoot.querySelector(".svg-pais svg");

  if (svgEl) {
    const activas = region ? PROVINCIAS_POR_REGION[region] || [] : [];

    svgEl.querySelectorAll("path[id]").forEach((path) => {
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

  this.shadowRoot.querySelectorAll(".pin").forEach((pin) => {
    pin.classList.remove("oculto");
  });
}

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
      gPin.setAttribute("tabindex", "0");
      gPin.setAttribute("role", "button");
      gPin.setAttribute("aria-label", `Ver destino ${d.nombre}`);

      const palabras = (d.tooltip || "").split(" ");
      const lineas = [];
      let lineaActual = "";

      palabras.forEach((palabra) => {
        const test = `${lineaActual} ${palabra}`.trim();
        if (test.length > 32) {
          if (lineaActual) lineas.push(lineaActual);
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
      const tooltipX = moverIzquierda ? -250 : 16;

      gPin.innerHTML = `
        <circle
          class="halo"
          r="14"
          fill="${color}"
          opacity="0.25"
        />

        <circle
          class="nucleo"
          r="8"
          fill="${color}"
          stroke="white"
          stroke-width="2"
        />

        <g
          class="tooltip"
          transform="translate(${tooltipX},-12)">

          <rect
            x="0"
            y="-18"
            rx="10"
            ry="10"
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

      const seleccionar = () => {
        this.marcarDestinoActivo(d.id);
        this.dispatchEvent(
          new CustomEvent("destino-seleccionado", {
            bubbles: true,
            composed: true,
            detail: { destinoId: d.id },
          }),
        );
      };

      gPin.addEventListener("click", seleccionar);
      gPin.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          seleccionar();
        }
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
