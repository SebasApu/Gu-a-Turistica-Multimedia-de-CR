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

class MapaCostaRica extends HTMLElement {
  constructor() {
    super();

    this.destinos = [];

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

          box-shadow:
            0 10px 30px rgba(0,0,0,0.08);
        }

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

        .pin {
          cursor: pointer;
          pointer-events: all;
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
          font-family:
            system-ui,
            sans-serif;
        }

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
          <div class="leyenda"></div>

          <div class="svg-contenedor">

            <div class="svg-pais"></div>

            <svg
              class="svg-pins"
              viewBox="${VIEW_BOX}"
              preserveAspectRatio="xMidYMid meet">

              <g class="marcadores"></g>

            </svg>

          </div>

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

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      let svgTexto = await resp.text();

      svgTexto = svgTexto.replace(/viewBox="[^"]*"/i, `viewBox="${VIEW_BOX}"`);

      this.shadowRoot.querySelector(".svg-pais").innerHTML = svgTexto;
    } catch (err) {
      console.error("[mapa-costa-rica] error cargando SVG:", err);
    }
  }

  async _cargarDestinos() {
    try {
      const resp = await fetch(this.rutaJson);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();

      this.destinos = data.destinos || [];
    } catch (err) {
      console.error("[mapa-costa-rica] error cargando destinos:", err);
    }
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

      const palabras = d.tooltip.split(" ");

      const lineas = [];

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

      if (lineaActual) {
        lineas.push(lineaActual);
      }

      const altura = 42 + lineas.length * 14;

      const tspans = lineas
        .map(
          (linea, i) => `
          <tspan
            x="12"
            dy="${i === 0 ? 0 : 14}">
            ${linea}
          </tspan>
        `,
        )
        .join("");

      const moverIzquierda = d.x > 620;

      const tooltipX = moverIzquierda ? -250 : 16;

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
            style="
              background:
              ${COLORES[tipo] || COLORES.default}
            ">
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
