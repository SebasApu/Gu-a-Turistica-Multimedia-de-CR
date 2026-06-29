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
    this.rutaSvg  = this.getAttribute("svg")      || "./assets/img/cr.svg";
    this._render();
    this._cargarTodo();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .wrap {
          max-width: 1040px;
          margin: 0 auto;
          font-family: Inter, system-ui, sans-serif;
        }

        .mapa {
          background:
            radial-gradient(circle at top left, rgba(220,252,231,.7) 0%, transparent 28%),
            linear-gradient(180deg, #f8fafc 0%, #f0fdf4 100%);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(15,23,42,.06);
        }

        .mapa-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 20px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .16em;
          color: #0f766e;
          font-weight: 800;
        }

        h2 {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          line-height: 1.1;
          color: #111827;
          letter-spacing: -.02em;
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
          background: rgba(220,252,231,.96);
          border: 1px solid #86efac;
          border-radius: 999px;
          padding: 6px 16px;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity .2s ease, transform .2s ease;
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
          background: rgba(236,253,245,.65);
        }

        .svg-pais,
        .svg-pais > svg,
        .svg-pins {
          width: 100%;
          height: auto;
          display: block;
        }

        .svg-pais { min-height: 280px; }

        .svg-pins {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .svg-pais svg path {
          cursor: pointer;
          transition: fill .25s ease, opacity .25s ease, filter .25s ease;
        }

        .svg-pais svg path:hover {
          fill: #4ade80 !important;
          filter: drop-shadow(0 0 6px rgba(34,197,94,.55));
        }

        .svg-pais svg path.prov-activa {
          fill: #22c55e !important;
          filter: drop-shadow(0 0 5px rgba(34,197,94,.34));
        }

        .svg-pais svg path.prov-inactiva {
          opacity: .22;
        }

        .pin {
          cursor: pointer;
          pointer-events: all;
        }

        .pin.activo .nucleo {
          stroke: #111827;
          stroke-width: 3;
        }

        .pin.activo .halo,
        .pin:hover .halo {
          opacity: .45;
        }

        .halo { opacity: .25; }

        .tooltip {
          pointer-events: none;
          opacity: 0;
          transition: opacity .2s ease;
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
          box-shadow: 0 0 0 3px rgba(255,255,255,.7);
        }

        @media (max-width: 768px) {
          .mapa {
            padding: 20px;
            border-radius: 22px;
          }

          .intro { font-size: .98rem; }
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

          <div class="provincia-badge"><span></span></div>

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

  // ─── Carga ────────────────────────────────────────────────────────────────

  async _cargarTodo() {
    try {
      const [svgTexto, data] = await Promise.all([
        fetch(this.rutaSvg).then((r) => {
          if (!r.ok) throw new Error(`SVG HTTP ${r.status}`);
          return r.text();
        }),
        fetch(this.rutaJson).then((r) => {
          if (!r.ok) throw new Error(`JSON HTTP ${r.status}`);
          return r.json();
        }),
      ]);

      // SVG
      this.shadowRoot.querySelector(".svg-pais").innerHTML =
        svgTexto.replace(/viewBox="[^"]*"/i, `viewBox="${VIEW_BOX}"`);
      this._configurarProvincias();

      // Destinos
      this.destinos = data.destinos || [];
      this._pintarMarcadores();
      this._pintarLeyenda();
      this._aplicarFiltro();
    } catch (err) {
      console.error("[mapa-costa-rica]", err);
    }
  }

  // ─── Provincias ───────────────────────────────────────────────────────────

  _configurarProvincias() {
    const badge = this.shadowRoot.querySelector(".provincia-badge span");
    const svgEl = this.shadowRoot.querySelector(".svg-pais svg");
    if (!svgEl) return;

    svgEl.querySelectorAll("path[id]").forEach((path) => {
      const nombre = path.getAttribute("name");
      if (!nombre) return;

      path.addEventListener("mouseenter", () => {
        badge.textContent = nombre;
        badge.classList.add("visible");
      });

      path.addEventListener("mouseleave", () => {
        badge.classList.remove("visible");
      });

      path.addEventListener("click", () => {
        if (this._regionActiva) this._limpiarFiltro();
      });
    });
  }

  // ─── Filtro ───────────────────────────────────────────────────────────────

  filtrarPorRegion(region) {
    this._regionActiva = region || null;
    this._aplicarFiltro();
  }

  _limpiarFiltro() {
    this._regionActiva = null;
    this._aplicarFiltro();
    this.dispatchEvent(
      new CustomEvent("region-cleared", { bubbles: true, composed: true }),
    );
  }

  _aplicarFiltro() {
    const region  = this._regionActiva;
    const activas = region ? (PROVINCIAS_POR_REGION[region] ?? []) : [];
    const svgEl   = this.shadowRoot.querySelector(".svg-pais svg");

    svgEl?.querySelectorAll("path[id]").forEach((path) => {
      path.classList.remove("prov-activa", "prov-inactiva");
      if (region) {
        path.classList.add(activas.includes(path.id) ? "prov-activa" : "prov-inactiva");
      }
    });
  }

  // ─── Marcadores ───────────────────────────────────────────────────────────

  marcarDestinoActivo(destinoId) {
    this._destinoActivoId = destinoId || null;
    this.shadowRoot.querySelectorAll(".pin").forEach((pin) => {
      pin.classList.toggle(
        "activo",
        pin.dataset.destinoId === this._destinoActivoId,
      );
    });
  }

  _pintarMarcadores() {
    const grupo = this.shadowRoot.querySelector(".marcadores");
    if (!grupo) return;
    grupo.innerHTML = "";

    this.destinos.forEach((d) => {
      const color      = COLORES[d.tipo] ?? COLORES.default;
      const tooltipX   = d.x > 620 ? -250 : 16;
      const lineas     = this._wrapText(d.tooltip || "", 32);
      const altura     = 42 + lineas.length * 14;
      const tspans     = lineas
        .map((l, i) => `<tspan x="12" dy="${i === 0 ? 0 : 14}">${l}</tspan>`)
        .join("");

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      Object.entries({
        class:            "pin",
        transform:        `translate(${d.x},${d.y})`,
        "data-destino-id": d.id,
        tabindex:         "0",
        role:             "button",
        "aria-label":     `Ver destino ${d.nombre}`,
      }).forEach(([k, v]) => g.setAttribute(k, v));

      g.innerHTML = `
        <circle class="halo"   r="14" fill="${color}" opacity=".25"/>
        <circle class="nucleo" r="8"  fill="${color}" stroke="white" stroke-width="2"/>
        <g class="tooltip" transform="translate(${tooltipX},-12)">
          <rect x="0" y="-18" rx="10" width="240" height="${altura}"
                fill="white" stroke="${color}" stroke-width="1.5"/>
          <text x="12" y="0"  font-size="12" font-weight="700" fill="${color}">${d.nombre}</text>
          <text x="12" y="20" font-size="10" fill="#374151">${tspans}</text>
        </g>
      `;

      const seleccionar = () => {
        this.dispatchEvent(
          new CustomEvent("destino-seleccionado", {
            bubbles: true,
            composed: true,
            detail: { destinoId: d.id },
          }),
        );
      };

      g.addEventListener("click", seleccionar);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          seleccionar();
        }
      });

      grupo.appendChild(g);
    });
  }

  // ─── Leyenda ──────────────────────────────────────────────────────────────

  _pintarLeyenda() {
    const tipos = [...new Set(this.destinos.map((d) => d.tipo))];
    this.shadowRoot.querySelector(".leyenda").innerHTML = tipos
      .map((tipo) => `
        <span class="leyenda-item">
          <span class="leyenda-dot" style="background:${COLORES[tipo] ?? COLORES.default}"></span>
          ${ETIQUETAS_TIPO[tipo] ?? tipo}
        </span>
      `)
      .join("");
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  _wrapText(texto, maxLen) {
    return texto.split(" ").reduce((lineas, palabra) => {
      const ultima = lineas.at(-1) ?? "";
      const test   = ultima ? `${ultima} ${palabra}` : palabra;
      return test.length > maxLen
        ? [...lineas, palabra]
        : [...lineas.slice(0, -1), test];
    }, []);
  }
}

customElements.define("mapa-costa-rica", MapaCostaRica);