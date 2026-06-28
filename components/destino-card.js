import "./galeria-imagenes.js";

const COLORES_CARD = {
  volcan: "#ef4444",
  playa: "#06b6d4",
  selva: "#10b981",
  ruinas: "#f59e0b",
  default: "#6366f1",
};

const ETIQUETAS_TIPO = {
  volcan: "Volcán",
  playa: "Playa",
  selva: "Selva",
  ruinas: "Ruinas",
};

class DestinoCard extends HTMLElement {
  static get observedAttributes() {
    return ["destino-id", "nombre", "imagen", "region"];
  }

  constructor() {
    super();
    this._destino = null;
    this.attachShadow({ mode: "open" });
  }

  attributeChangedCallback(attr, anterior, nuevo) {
    if (anterior === nuevo) return;

    const id = this.getAttribute("destino-id");
    const nombre = this.getAttribute("nombre");

    if (id && nombre) {
      this._destino = {
        id,
        nombre,
        imagen_portada: this.getAttribute("imagen") || "",
        region: this.getAttribute("region") || "",
      };

      this.removeAttribute("hidden");
      this._render();
    }
  }

  mostrar(destino) {
    if (this._destino?.id === destino.id) {
      this.cerrar();
      return;
    }

    this._destino = destino;
    this.removeAttribute("hidden");
    this._render();
  }

  cerrar() {
    this._destino = null;
    this.setAttribute("hidden", "");
    this.shadowRoot.innerHTML = "";
  }

  _renderLista(items = []) {
    if (!items.length) return "";
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  _renderChips(items = []) {
    if (!items.length) return "";
    return items.map((item) => `<span class="chip">${item}</span>`).join("");
  }

  _render() {
    const d = this._destino;
    if (!d) return;

    const color = COLORES_CARD[d.tipo] || COLORES_CARD.default;
    const tipoEtiqueta = ETIQUETAS_TIPO[d.tipo] || d.tipo || "Destino";
    const actividades = d.actividades || [];
    const highlights = d.highlights || [];
    const imagen = d.imagen_portada || "";
    const descripcion =
      d.descripcion ||
      "Descubre este destino emblemático con paisajes naturales, experiencias locales y recomendaciones para tu visita.";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 20px;
          font-family: Inter, system-ui, sans-serif;
        }

        :host([hidden]) {
          display: none;
        }

        .card {
          overflow: hidden;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(229, 231, 235, 0.95);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          animation: aparecer 0.35s ease;
        }

        @keyframes aparecer {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

       

        .fallback {
          display: grid;
          place-items: center;
          background:
            linear-gradient(135deg, rgba(20, 83, 45, 0.18), rgba(6, 182, 212, 0.18)),
            #f3f4f6;
          color: #374151;
          font-size: 1rem;
          font-weight: 700;
        }

        .overlay {
          position: absolute;
          inset: auto 0 0 0;
          padding: 20px;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.54) 100%
            );
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.92);
          color: #111827;
          backdrop-filter: blur(12px);
        }

        .body {
          padding: 24px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }

        .region {
          margin: 0 0 8px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 800;
          color: ${color};
        }

        h3 {
          margin: 0;
          color: #111827;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          font-family: "Playfair Display", Georgia, serif;
        }

        .cerrar {
          appearance: none;
          border: none;
          background: #f9fafb;
          color: #6b7280;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
          flex-shrink: 0;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .cerrar:hover {
          background: #eef2f7;
          color: #111827;
          transform: scale(1.04);
        }

        .cerrar:focus-visible {
          outline: 3px solid rgba(17, 24, 39, 0.2);
          outline-offset: 3px;
        }

        .descripcion {
          margin: 18px 0 0;
          color: #4b5563;
          line-height: 1.85;
          font-size: 1rem;
        }

        .contenido {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr;
          gap: 24px;
          margin-top: 24px;
        }

        .bloque {
          background: #fcfcfd;
          border: 1px solid #eef2f7;
          border-radius: 18px;
          padding: 18px;
        }

        .bloque h4 {
          margin: 0 0 12px;
          color: #111827;
          font-size: 1rem;
        }

        ul {
          margin: 0;
          padding-left: 18px;
        }

        li {
          margin: 8px 0;
          color: #374151;
          line-height: 1.6;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #1f2937;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .galeria {
          margin-top: 22px;
        }

        .acciones {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        @media (max-width: 860px) {
          .body {
            padding: 20px;
          }

          .contenido {
            grid-template-columns: 1fr;
          }

          .topbar {
            align-items: center;
          }
        }
      </style>

      <article class="card">
        <div class="body">
          <div class="topbar">
            <div>
              ${d.region ? `<div class="region">${d.region}</div>` : ""}
              <h3>${d.nombre}</h3>
            </div>

            <button class="cerrar" aria-label="Cerrar detalle">×</button>
          </div>

          <p class="descripcion">${descripcion}</p>

          <div class="galeria">
            ${
              d.galeria?.length
                ? `<galeria-imagenes imagenes='${JSON.stringify(d.galeria)}'></galeria-imagenes>`
                : ""
            }
          </div>

          <div class="contenido">
            <section class="bloque">
              <h4>Qué hacer</h4>
              ${
                actividades.length
                  ? `<ul>${this._renderLista(actividades)}</ul>`
                  : `<p class="descripcion">Explora senderos, paisajes y experiencias locales en este destino.</p>`
              }
            </section>

            <section class="bloque">
              <h4>Imperdibles</h4>
              ${
                highlights.length
                  ? `<div class="chips">${this._renderChips(highlights)}</div>`
                  : `<p class="descripcion">Naturaleza, cultura y paisajes inolvidables.</p>`
              }
            </section>
          </div>
          </div>
        </div>
      </article>
    `;

    this.shadowRoot.querySelector(".cerrar")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.cerrar();
    });

    this.shadowRoot
      .querySelector('[data-action="cerrar"]')
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.cerrar();
      });

    const emitirSeleccion = () => {
      if (!this._destino?.id) return;
      this.dispatchEvent(
        new CustomEvent("destino-seleccionado", {
          bubbles: true,
          composed: true,
          detail: { destinoId: this._destino.id },
        }),
      );
    };

    this.shadowRoot
      .querySelector('[data-action="seleccionar"]')
      ?.addEventListener("click", emitirSeleccion);

    this.shadowRoot.querySelector(".card")?.addEventListener("click", () => {
      emitirSeleccion();
    });
  }
}

customElements.define("destino-card", DestinoCard);
