import "./galeria-imagenes.js";

const COLORES_CARD = {
  volcan: '#ef4444',
  playa: '#06b6d4',
  selva: '#10b981',
  ruinas: '#f59e0b',
  default: '#6366f1'
};

class DestinoCard extends HTMLElement {

  static get observedAttributes() {
    return ['destino-id', 'nombre', 'imagen', 'region'];
  }

  constructor() {
    super();

    this._destino = null;

    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(attr, anterior, nuevo) {
    if (anterior === nuevo) return;
    // Si llegan los atributos básicos, renderizar con ellos
    const id = this.getAttribute('destino-id');
    const nombre = this.getAttribute('nombre');
    if (id && nombre) {
      this._destino = {
        id,
        nombre,
        imagen_portada: this.getAttribute('imagen') || '',
        region: this.getAttribute('region') || ''
      };
      this.removeAttribute('hidden');
      this._render();
    }
  }

  mostrar(destino) {

    if (this._destino?.id === destino.id) {
      this.cerrar();
      return;
    }

    this._destino = destino;

    this.removeAttribute('hidden');

    this._render();
  }

  cerrar() {

    this._destino = null;

    this.setAttribute('hidden', '');

    this.shadowRoot.innerHTML = '';
  }

  _render() {

    const d = this._destino;

    const color =
      COLORES_CARD[d.tipo] ||
      COLORES_CARD.default;

    this.shadowRoot.innerHTML = `
      <style>

        :host {
          display: block;
          margin-top: 20px;
          font-family: system-ui, sans-serif;
        }

        :host([hidden]) {
          display: none;
        }

        .card {
          padding: 18px;
          background: white;
          border-left: 5px solid ${color};
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .cerrar {
          float: right;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          color: #9ca3af;
        }

        .cerrar:hover {
          color: #374151;
        }

        .region {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 6px;
          color: ${color};
        }

        h3 {
          margin: 0 0 8px;
          color: #111827;
        }

        p {
          color: #4b5563;
          line-height: 1.5;
        }

        ul {
          margin-top: 10px;
          padding-left: 20px;
        }

        li {
          margin: 4px 0;
          color: #374151;
        }

      </style>

      <div class="card" role="button" tabindex="0" style="cursor:pointer;">

        <button class="cerrar" aria-label="Cerrar">×</button>

        <div class="region">
          ${d.region}
        </div>

        <h3>
          ${d.nombre}
        </h3>

        <p>
          ${d.descripcion}
        </p>

        ${
          d.galeria?.length
            ? `<galeria-imagenes imagenes='${JSON.stringify(d.galeria)}'></galeria-imagenes>`
            : d.imagen_portada
              ? `<img src="${d.imagen_portada}" alt="${d.nombre}" style="width:100%;border-radius:8px;margin:10px 0;" />`
              : ''
        }

        ${
          d.actividades?.length
            ? `<ul>${d.actividades.map(a => `<li>${a}</li>`).join('')}</ul>`
            : d.highlights?.length
              ? `<ul>${d.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
              : ''
        }

      </div>
    `;

    this.shadowRoot
      .querySelector('.cerrar')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        this.cerrar();
      });

    // Emite 'destino-selected' al hacer clic en la tarjeta
    this.shadowRoot
      .querySelector('.card')
      .addEventListener('click', () => {
        if (!this._destino?.id) return;
        this.dispatchEvent(new CustomEvent('destino-selected', {
          bubbles: true,
          composed: true,
          detail: { destinoId: this._destino.id }
        }));
      });
  }
}

customElements.define(
  'destino-card',
  DestinoCard
);