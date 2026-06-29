import "./galeria-imagenes.js";

const COLORES_CARD = {
  volcan:  "#ef4444",
  playa:   "#06b6d4",
  selva:   "#10b981",
  ruinas:  "#f59e0b",
  default: "#6366f1",
};

class DestinoCard extends HTMLElement {
  static get observedAttributes() {
    return ["destino-id", "nombre", "imagen", "region"];
  }

  constructor() {
    super();
    this._destino = null;
    this._sincronizando = false;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
    this.setAttribute("hidden", "");
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (anterior === nuevo || this._sincronizando) return;
    if (!this._destino) this._destino = {};
    if (nombre === "destino-id") this._destino.id = nuevo;
    if (nombre === "nombre")     this._destino.nombre = nuevo;
    if (nombre === "imagen")     this._destino.imagen_portada = nuevo;
    if (nombre === "region")     this._destino.region = nuevo;
    if (this.shadowRoot?.querySelector(".card")) this._actualizar();
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  mostrar(destino) {
    this._destino = destino;
    this.removeAttribute("hidden");
    this._sincronizando = true;
    this.setAttribute("destino-id", destino.id || "");
    this.setAttribute("nombre",     destino.nombre || "");
    this.setAttribute("imagen",     destino.imagen_portada || "");
    this.setAttribute("region",     destino.region || "");
    this._sincronizando = false;
    this._actualizar();
  }

  cerrar() {
    this._destino = null;
    this.setAttribute("hidden", "");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 20px;
          font-family: Inter, system-ui, sans-serif;
        }

        :host([hidden]) { display: none !important; }

        .card {
          overflow: hidden;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(229,231,235,.95);
          box-shadow: 0 18px 40px rgba(15,23,42,.08);
          animation: aparecer .35s ease;
        }

        @keyframes aparecer {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fallback {
          display: grid;
          place-items: center;
          background:
            linear-gradient(135deg, rgba(20,83,45,.18), rgba(6,182,212,.18)),
            #f3f4f6;
          color: #374151;
          font-size: 1rem;
          font-weight: 700;
        }

        .overlay {
          position: absolute;
          inset: auto 0 0 0;
          padding: 20px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.54) 100%);
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
          background: rgba(255,255,255,.92);
          color: #111827;
          backdrop-filter: blur(12px);
        }

        .body { padding: 24px; }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }

        .region {
          margin: 0 0 8px;
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .14em;
          font-weight: 800;
          color: #111827;
        }

        h3 {
          margin: 0;
          color: #111827;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1.08;
          letter-spacing: -.02em;
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
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }

        .cerrar:hover {
          background: #eef2f7;
          color: #111827;
          transform: scale(1.04);
        }

        .cerrar:focus-visible {
          outline: 3px solid rgba(17,24,39,.2);
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
          grid-template-columns: 1.2fr .9fr;
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
          font-size: .92rem;
          font-weight: 700;
        }

        .galeria { margin-top: 22px; }

        @media (max-width: 860px) {
          .body { padding: 20px; }
          .contenido { grid-template-columns: 1fr; }
          .topbar { align-items: center; }
        }
      </style>

      <article class="card">
        <div class="body">
          <div class="topbar">
            <div>
              <div class="region"></div>
              <h3></h3>
            </div>
            <button type="button" class="cerrar" aria-label="Cerrar">×</button>
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
        </div>
      </article>
    `;

    this.shadowRoot.querySelector("galeria-imagenes")
      .addEventListener("click", (e) => e.stopPropagation());

    this.shadowRoot.querySelector(".cerrar")
      .addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.cerrar();
      });

    this.shadowRoot.querySelector(".card")
      .addEventListener("click", () => {
        if (!this._destino?.id) return;
        this.dispatchEvent(new CustomEvent("destino-selected", {
          bubbles: true,
          composed: true,
          detail: { destinoId: this._destino.id },
        }));
      });
  }

  // ─── Actualizar ───────────────────────────────────────────────────────────

  _actualizar() {
    if (!this._destino) return;
    const d     = this._destino;
    const color = COLORES_CARD[d.tipo] ?? COLORES_CARD.default;

    const regionEl = this.shadowRoot.querySelector(".region");
    regionEl.textContent = d.region || "";
    regionEl.style.color = color;

    this.shadowRoot.querySelector("h3").textContent           = d.nombre;
    this.shadowRoot.querySelector(".descripcion").textContent = d.descripcion || "";

    this.shadowRoot.querySelector("galeria-imagenes")
      .setAttribute("imagenes", JSON.stringify(d.galeria || []));

    this.shadowRoot.querySelector(".actividades ul").innerHTML =
      (d.actividades || []).map((a) => `<li>${a}</li>`).join("");

    this.shadowRoot.querySelector(".highlights .chips").innerHTML =
      (d.highlights || []).map((h) => `<span class="chip">${h}</span>`).join("");
  }
}

customElements.define("destino-card", DestinoCard);