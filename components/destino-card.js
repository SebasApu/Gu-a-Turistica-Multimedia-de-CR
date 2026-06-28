import "./galeria-imagenes.js";

const COLORES_CARD = {
  volcan: "#ef4444",
  playa: "#06b6d4",
  selva: "#10b981",
  ruinas: "#f59e0b",
  default: "#6366f1",
};



class DestinoCard extends HTMLElement {
  static get observedAttributes() {
    return ["destino-id", "nombre", "imagen", "region"];
  }

  constructor() {
  super();
  this._destino = null;
  this._renderizado = false;
  this.attachShadow({ mode: "open" });
}

  connectedCallback() {
    if (!this._renderizado) {
      this._render();
      this._renderizado = true;
    }
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

if (!this._renderizado) {
  this._render();
  this._renderizado = true;
}

this._actualizar();
    }
  }

  mostrar(destino) {
    this._destino = destino;
    this.removeAttribute("hidden");

    if (!this._renderizado) {
      this._render();
      this._renderizado = true;
    }

    this._actualizar();
  }

  cerrar() {
    this._destino = null;
    this.setAttribute("hidden", "");
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
          color: #111827;
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
            <div class="region"></div>
            <h3></h3>
          </div>
          <button type="button" class="cerrar">×</button>
        </div>

        <p class="descripcion"></p>

        <div class="galeria">
          <galeria-imagenes></galeria-imagenes>
        </div>

        <div class="contenido">
  <section class="bloque actividades">
    <h4>Qué hacer</h4>
    <ul></ul>
  </section>
  <section class="bloque highlights">
    <h4>Imperdibles</h4>
    <div class="chips"></div>
  </section>
</div>
    </article>
  `;

    const galeria = this.shadowRoot.querySelector("galeria-imagenes");

    galeria?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const btnCerrar = this.shadowRoot.querySelector(".cerrar");

    btnCerrar?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.cerrar();
    });
  }

    _actualizar() {
  if (!this._destino) return;

  const d = this._destino;
  const color = COLORES_CARD[d.tipo] || COLORES_CARD.default;

  this.shadowRoot.querySelector(".region").textContent = d.region || "";
  this.shadowRoot.querySelector(".region").style.color = color;
  this.shadowRoot.querySelector("h3").textContent = d.nombre;
  this.shadowRoot.querySelector(".descripcion").textContent =
    d.descripcion || "";

  // ✅ Solo actualiza el atributo, nunca destruyas el elemento
  const galeria = this.shadowRoot.querySelector("galeria-imagenes");
  galeria.setAttribute("imagenes", JSON.stringify(d.galeria || []));

  // ✅ Actualiza solo el contenido interno de los bloques,
  //    sin tocar el <section> completo
  const listaActividades = this.shadowRoot.querySelector(
    ".actividades ul",
  );
  listaActividades.innerHTML = (d.actividades || [])
    .map((a) => `<li>${a}</li>`)
    .join("");

  const chipsHighlights = this.shadowRoot.querySelector(
    ".highlights .chips",
  );
  chipsHighlights.innerHTML = (d.highlights || [])
    .map((h) => `<span class="chip">${h}</span>`)
    .join("");
}
}

customElements.define("destino-card", DestinoCard);
