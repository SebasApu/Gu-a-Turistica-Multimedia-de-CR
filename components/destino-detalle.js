import "./destino-card.js";
import "./audio-guia.js";

class DestinoDetalle extends HTMLElement {
  constructor() {
    super();

    this.destinos = [];
    this.audios = {};
    this.destinoSeleccionado = null;
    this._onDestinoSeleccionado = this._onDestinoSeleccionado.bind(this);

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.rutaJson = this.getAttribute("destinos") || "./data/destinos.json";
    this.rutaAudios = this.getAttribute("audios") || "./data/audios.json";

    this._render();
    document.addEventListener("destino-seleccionado", this._onDestinoSeleccionado);
    this._cargarDatos();
  }

	disconnectedCallback() {
		document.removeEventListener("destino-seleccionado", this._onDestinoSeleccionado);
	}

  _render() {
	this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					margin-top: 2rem;
					font-family: system-ui, sans-serif;
				}

				.contenedor {
					max-width: 960px;
					margin: 0 auto;
				}

				.encabezado {
					margin-bottom: 1rem;
				}

				.encabezado h2 {
					margin: 0 0 0.35rem;
					color: #111827;
					font-size: 1.4rem;
				}

				.encabezado p {
					margin: 0;
					color: #4b5563;
					line-height: 1.5;
				}

				.estado {
					padding: 1rem;
					background: #f8fafc;
					border: 1px solid #e5e7eb;
					border-radius: 12px;
					color: #6b7280;
				}

				destino-card {
					display: block;
					margin-top: 1.25rem;
				}

					.audio-seccion {
						margin-top: 1.75rem;
						padding: 1.25rem;
						background: #f8fafc;
						border: 1px solid #e5e7eb;
						border-radius: 18px;
					}

					.audio-encabezado {
						font-weight: 700;
						color: #111827;
						margin-bottom: 0.45rem;
					}

					.audio-descripcion {
						margin: 0;
						color: #4b5563;
						line-height: 1.5;
						margin-bottom: 1rem;
					}
				</style>

				<section class="contenedor">
					<div class="encabezado">
						<h2>Detalle del destino</h2>
						<p>Selecciona un punto del mapa para ver sus datos aquí.</p>
					</div>

					<div class="estado" hidden>
						Cargando detalle...
					</div>

					<div class="estado-seleccion" hidden>
						Esperando selección del mapa...
					</div>

					<destino-card hidden></destino-card>

					<div class="audio-seccion">
				<div class="audio-encabezado">Guía de audio</div>
				<p class="audio-descripcion">Escucha una breve narración del destino con controles sencillos.</p>
				<audio-guia></audio-guia>
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
		if (seleccion) {
			seleccion.hidden = true;
		}

		this.shadowRoot.querySelector("destino-card").mostrar(destino);

		const audioMeta = this.audios[destino.id] || {};
		const audioEl = this.shadowRoot.querySelector("audio-guia");
		if (audioEl) {
			audioEl.setAttribute("src", destino.audio || audioMeta.src || "");
			audioEl.setAttribute(
				"label",
				destino.audioLabel || audioMeta.label || `Guía de audio de ${destino.nombre}`
				);
		}
	}
}

customElements.define("destino-detalle", DestinoDetalle);
