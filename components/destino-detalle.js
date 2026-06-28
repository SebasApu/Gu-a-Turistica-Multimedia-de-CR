import "./destino-card.js";
import "./audio-guia.js";

class DestinoDetalle extends HTMLElement {
  constructor() {
    super();

    this.destinos = [];
    this.audios = {};
    this.destinoSeleccionado = null;
    this._onDestinoSeleccionado =
      this._onDestinoSeleccionado.bind(this);

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.rutaJson = this.getAttribute("destinos") || "./data/destinos.json";
    this.rutaAudios = this.getAttribute("audios") || "./data/audios.json";

    this._render();
    document.addEventListener(
      "destino-seleccionado",
      this._onDestinoSeleccionado,
    );
    this._cargarDatos();
  }

  disconnectedCallback() {
    document.removeEventListener(
      "destino-seleccionado",
      this._onDestinoSeleccionado,
    );
  }

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
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #0f766e;
          font-weight: 800;
        }

        .encabezado h2 {
          margin: 0 0 0.55rem;
          color: #111827;
          font-size: clamp(2rem, 4vw, 2.7rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
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
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
          gap: 24px;
          align-items: start;
        }

        .principal {
          min-width: 0;
        }

        .estado,
        .estado-seleccion {
          padding: 1.1rem 1.2rem;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          color: #6b7280;
          line-height: 1.6;
        }

        .estado-seleccion {
          background:
            linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          color: #4b5563;
        }

        .aside {
          display: grid;
          gap: 18px;
        }

        .panel {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.05);
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

        .audio-seccion .audio-encabezado {
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.45rem;
        }

        .audio-seccion .audio-descripcion {
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

        destino-card {
          display: block;
        }

        @media (max-width: 920px) {
          .layout {
            grid-template-columns: 1fr;
          }
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
            <div class="estado" hidden>Cargando detalle...</div>

            <div class="estado-seleccion" hidden>
              Selecciona un punto del mapa para descubrir un destino de Costa Rica.
            </div>

            <destino-card hidden></destino-card>
          </div>

          <aside class="aside">
            <div class="panel audio-seccion">
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
                Lleva ropa ligera, protección solar, agua y prepárate para cambios
                de clima según la región que explores.
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

  async _cargarDatos() {
    await Promise.all([this._cargarDestinos(), this._cargarAudios()]);
  }

  async _cargarAudios() {
    try {
      const resp = await fetch(this.rutaAudios);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      this.audios = data.audios || {};
    } catch (err) {
      console.error("[destino-detalle] error cargando audios:", err);
      this.audios = {};
    }
  }

  async _cargarDestinos() {
    const estado = this.shadowRoot.querySelector(".estado");
    const seleccion = this.shadowRoot.querySelector(".estado-seleccion");

    try {
      if (estado) {
        estado.hidden = false;
        estado.textContent = "Cargando destinos...";
      }

      const resp = await fetch(this.rutaJson);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      this.destinos = data.destinos || [];

      if (estado) {
        estado.hidden = true;
      }

      if (seleccion) {
        seleccion.hidden = false;
      }
    } catch (err) {
      console.error("[destino-detalle] error cargando destinos:", err);

      if (estado) {
        estado.hidden = false;
        estado.textContent = "No se pudieron cargar los destinos.";
      }
    }
  }

_onDestinoSeleccionado(evento) {
  const destinoId = evento?.detail?.destinoId;
  if (!destinoId) return;

  const destino = this.destinos.find((item) => item.id === destinoId);
  if (!destino) return;

  this.destinoSeleccionado = destino;

  const seleccion = this.shadowRoot.querySelector(".estado-seleccion");
  if (seleccion) seleccion.hidden = true;

  const card = this.shadowRoot.querySelector("destino-card");
  card?.mostrar(destino);

  // ✅ Obtén el elemento audio-guia y los datos del objeto audios
  const audioEl = this.shadowRoot.querySelector("audio-guia");
  const audioMeta = this.audios[destinoId] || {};

  const nuevoSrc = destino.audio || audioMeta.src || "";
  const nuevoLabel =
    destino.audioLabel ||
    audioMeta.label ||
    `Guía de audio de ${destino.nombre}`;
  const nuevaDuracion = destino.audioDuration || audioMeta.duration || "";

  if (audioEl) {
    if (audioEl.getAttribute("src") !== nuevoSrc) {
      audioEl.setAttribute("src", nuevoSrc);
    }
    if (audioEl.getAttribute("label") !== nuevoLabel) {
      audioEl.setAttribute("label", nuevoLabel);
    }
    if (String(audioEl.getAttribute("duration")) !== String(nuevaDuracion)) {
      if (nuevaDuracion) {
        audioEl.setAttribute("duration", nuevaDuracion);
      } else {
        audioEl.removeAttribute("duration");
      }
    }
  }

  this.dispatchEvent(
    new CustomEvent("detalle-actualizado", {
      bubbles: true,
      composed: true,
      detail: { destinoId: destino.id },
    }),
  );
}
}

customElements.define("destino-detalle", DestinoDetalle);