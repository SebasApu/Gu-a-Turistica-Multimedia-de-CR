import "./destino-card.js";
import "./audio-guia.js";

class DestinoDetalle extends HTMLElement {
  constructor() {
    super();
    this.destinos = [];
    this.audios   = {};
    this.destinoSeleccionado = null;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.rutaJson   = this.getAttribute("destinos") || "./data/destinos.json";
    this.rutaAudios = this.getAttribute("audios")   || "./data/audios.json";

    this._render();
    this._cargarDatos();

    // Arrow function: no necesita bind ni propiedad extra
    this._onDestinoSeleccionado = ({ detail } = {}) => {
      const destino = this.destinos.find((d) => d.id === detail?.destinoId);
      if (!destino) return;

      this.destinoSeleccionado = destino;
      this.shadowRoot.querySelector(".estado-seleccion").hidden = true;
      this.shadowRoot.querySelector("destino-card")?.mostrar(destino);

      this._actualizarAudio(destino);

      this.dispatchEvent(
        new CustomEvent("detalle-actualizado", {
          bubbles: true,
          composed: true,
          detail: { destinoId: destino.id },
        }),
      );
    };

    document.addEventListener("destino-seleccionado", this._onDestinoSeleccionado);
  }

  disconnectedCallback() {
    document.removeEventListener("destino-seleccionado", this._onDestinoSeleccionado);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 2.5rem;
          font-family: Inter, system-ui, sans-serif;
        }

        .contenedor {
          max-width: 1040px;
          margin: 0 auto;
        }

        .encabezado {
          text-align: left;
          margin-bottom: 1.4rem;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .16em;
          color: #0f766e;
          font-weight: 800;
        }

        .encabezado h2 {
          margin: 0 0 .55rem;
          color: #111827;
          font-size: clamp(2rem, 4vw, 2.7rem);
          line-height: 1.08;
          letter-spacing: -.02em;
          font-family: "Playfair Display", Georgia, serif;
        }

        .encabezado p {
          margin: 0;
          color: #4b5563;
          line-height: 1.75;
          max-width: 740px;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, .8fr);
          gap: 24px;
          align-items: start;
        }

        .principal { min-width: 0; }

        .estado-seleccion {
          padding: 1.1rem 1.2rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          color: #4b5563;
          line-height: 1.6;
        }

        .aside { display: grid; gap: 18px; }

        .panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 14px 30px rgba(15,23,42,.05);
        }

        .panel h3 {
          margin: 0 0 8px;
          color: #111827;
          font-size: 1.05rem;
        }

        .panel p {
          margin: 0;
          color: #4b5563;
          line-height: 1.7;
        }

        .audio-encabezado {
          font-weight: 800;
          color: #111827;
          margin-bottom: .45rem;
        }

        .audio-descripcion {
          margin: 0 0 1rem;
          color: #4b5563;
          line-height: 1.6;
        }

        .tip-lista {
          margin: 12px 0 0;
          padding-left: 18px;
        }

        .tip-lista li {
          margin: 8px 0;
          color: #374151;
          line-height: 1.6;
        }

        destino-card { display: block; }

        @media (max-width: 920px) {
          .layout { grid-template-columns: 1fr; }
        }
      </style>

      <section class="contenedor">
        <div class="encabezado">
          <p class="eyebrow">Descubre cada parada</p>
          <h2>Explora cada destino con imágenes, actividades y audioguía</h2>
          <p>
            Selecciona un punto del mapa para conocer su historia, sus
            experiencias destacadas y recomendaciones para tu visita.
          </p>
        </div>

        <div class="layout">
          <div class="principal">
            <div class="estado-seleccion">
              ¡Tu próximo destino te espera!
            </div>
            <destino-card hidden></destino-card>
          </div>

          <aside class="aside">
            <div class="panel">
              <div class="audio-encabezado">Audioguía</div>
              <p class="audio-descripcion">
                Escucha una breve narración para conocer mejor el destino
                seleccionado antes o durante tu visita.
              </p>
              <audio-guia></audio-guia>
            </div>

            <div class="panel">
              <h3>Consejos para viajeros</h3>
              <p>
                Lleva ropa ligera, protección solar, agua y prepárate para
                cambios de clima según la región que explores.
              </p>
              <ul class="tip-lista">
                <li>Consulta la temporada ideal para cada zona.</li>
                <li>Reserva actividades con anticipación en temporada alta.</li>
                <li>Respeta senderos, fauna y áreas protegidas.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  // ─── Carga ────────────────────────────────────────────────────────────────

  async _cargarDatos() {
    try {
      const [destData, audioData] = await Promise.all([
        fetch(this.rutaJson).then((r) => {
          if (!r.ok) throw new Error(`Destinos HTTP ${r.status}`);
          return r.json();
        }),
        fetch(this.rutaAudios).then((r) => {
          if (!r.ok) throw new Error(`Audios HTTP ${r.status}`);
          return r.json();
        }),
      ]);

      this.destinos = destData.destinos  || [];
      this.audios   = audioData.audios   || {};
    } catch (err) {
      console.error("[destino-detalle]", err);
    }
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  _actualizarAudio(destino) {
    const audioEl = this.shadowRoot.querySelector("audio-guia");
    if (!audioEl) return;

    const meta = this.audios[destino.id] ?? {};

    const src      = destino.audio        ?? meta.src      ?? "";
    const label    = destino.audioLabel   ?? meta.label    ?? `Guía de audio de ${destino.nombre}`;
    const duration = destino.audioDuration ?? meta.duration ?? null;

    this._setAttr(audioEl, "src",      src);
    this._setAttr(audioEl, "label",    label);
    duration
      ? this._setAttr(audioEl, "duration", String(duration))
      : audioEl.removeAttribute("duration");
  }

  // Solo actualiza el atributo si cambió — evita ciclos innecesarios
  _setAttr(el, attr, value) {
    if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
  }
}

customElements.define("destino-detalle", DestinoDetalle);