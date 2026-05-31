class GaleriaImagenes extends HTMLElement {
  static get observedAttributes() {
    return ["imagenes"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._imagenes = [];
    this._indice = 0;
  }

  connectedCallback() {
    const attr = this.getAttribute("imagenes");
    if (attr) this._imagenes = JSON.parse(attr);
    this._render();
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (nombre === "imagenes" && nuevo !== anterior) {
      this._imagenes = JSON.parse(nuevo);
      this._indice = 0;
      this._actualizar();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
        }

        .galeria {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fondo {
          position: absolute;
          inset: -20px;
          background-size: cover;
          background-position: center;
          filter: blur(6px) brightness(0.95);
          transform: scale(1.1);
          z-index: 0;
        }

        img {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .vacio {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          border: none;
          color: #fff;
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 1;
        }

        button:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        #btn-anterior { left: 0.75rem; }
        #btn-siguiente { right: 0.75rem; }

        .contador {
          position: absolute;
          bottom: 0.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
        }
      </style>

      <div class="galeria">
        <div class="fondo" id="fondo"></div>
        <img id="foto" src="" alt="Imagen del destino" />
        <span class="vacio" id="vacio" hidden>Sin imágenes disponibles</span>
        <button id="btn-anterior" aria-label="Anterior">&#8249;</button>
        <button id="btn-siguiente" aria-label="Siguiente">&#8250;</button>
        <span class="contador" id="contador"></span>
      </div>
    `;

    this.shadowRoot.getElementById("btn-anterior").addEventListener("click", () => this._navegar(-1));
    this.shadowRoot.getElementById("btn-siguiente").addEventListener("click", () => this._navegar(1));

    this._actualizar();
  }

  _navegar(direccion) {
    if (!this._imagenes.length) return;
    this._indice = (this._indice + direccion + this._imagenes.length) % this._imagenes.length;
    this._actualizar();
  }

  _actualizar() {
    if (!this.shadowRoot.getElementById) return;

    const foto = this.shadowRoot.getElementById("foto");
    const vacio = this.shadowRoot.getElementById("vacio");
    const contador = this.shadowRoot.getElementById("contador");
    const btnAnterior = this.shadowRoot.getElementById("btn-anterior");
    const btnSiguiente = this.shadowRoot.getElementById("btn-siguiente");

    if (!foto) return;

    const hayImagenes = this._imagenes.length > 0;

    foto.hidden = !hayImagenes;
    vacio.hidden = hayImagenes;
    btnAnterior.hidden = !hayImagenes;
    btnSiguiente.hidden = !hayImagenes;
    contador.hidden = !hayImagenes;

    const fondo = this.shadowRoot.getElementById("fondo");

    if (hayImagenes) {
      const src = this._imagenes[this._indice];
      foto.style.opacity = '0';
      foto.src = src;
      foto.alt = `Imagen ${this._indice + 1} de ${this._imagenes.length}`;
      contador.textContent = `${this._indice + 1} / ${this._imagenes.length}`;
      foto.onload = () => {
        if (fondo) fondo.style.backgroundImage = `url('${src}')`;
        foto.style.opacity = '1';
      };
    }
  }
}

customElements.define("galeria-imagenes", GaleriaImagenes);
