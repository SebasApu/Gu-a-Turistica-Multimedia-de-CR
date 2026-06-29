class GaleriaImagenes extends HTMLElement {
  static get observedAttributes() {
    return ["imagenes"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._imagenes = [];
    this._indice   = 0;
  }

  connectedCallback() {
    const attr = this.getAttribute("imagenes");
    if (attr) this._imagenes = JSON.parse(attr);
    this._render();
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (nombre === "imagenes" && nuevo !== anterior) {
      this._imagenes = JSON.parse(nuevo);
      this._indice   = 0;
      this._actualizar();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: system-ui, sans-serif;
        }

        .galeria {
          position: relative;
          width: 100%;
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
          filter: blur(6px) brightness(.95);
          transform: scale(1.1);
          z-index: 0;
        }

        img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity .3s ease;
          z-index: 1;
        }

        .vacio {
          color: #9ca3af;
          font-size: .9rem;
        }

        button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,.5);
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
          transition: background .2s;
          z-index: 2;
        }

        button:hover { background: rgba(0,0,0,.8); }

        #btn-anterior  { left: .75rem; }
        #btn-siguiente { right: .75rem; }

        .contador {
          position: absolute;
          bottom: .5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,.5);
          color: #fff;
          font-size: .75rem;
          padding: .2rem .6rem;
          border-radius: 99px;
          z-index: 2;
        }
      </style>

      <div class="galeria">
        <div class="fondo" id="fondo"></div>
        <img id="foto" src="" alt="" />
        <span class="vacio" id="vacio" hidden>Sin imágenes disponibles</span>
        <button type="button" id="btn-anterior"  aria-label="Anterior">&#8249;</button>
        <button type="button" id="btn-siguiente" aria-label="Siguiente">&#8250;</button>
        <span class="contador" id="contador"></span>
      </div>
    `;

    // Cache de elementos — evita getElementById en cada actualización
    this._els = {
      foto:         this.shadowRoot.getElementById("foto"),
      fondo:        this.shadowRoot.getElementById("fondo"),
      vacio:        this.shadowRoot.getElementById("vacio"),
      contador:     this.shadowRoot.getElementById("contador"),
      btnAnterior:  this.shadowRoot.getElementById("btn-anterior"),
      btnSiguiente: this.shadowRoot.getElementById("btn-siguiente"),
    };

    this._els.btnAnterior.addEventListener("click",  (e) => { e.stopPropagation(); this._navegar(-1); });
    this._els.btnSiguiente.addEventListener("click", (e) => { e.stopPropagation(); this._navegar(1);  });

    this._actualizar();
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  _navegar(direccion) {
    if (!this._imagenes.length) return;
    this._indice = (this._indice + direccion + this._imagenes.length) % this._imagenes.length;
    this._actualizar();
  }

  // ─── Actualizar ───────────────────────────────────────────────────────────

  _actualizar() {
    const { foto, fondo, vacio, contador, btnAnterior, btnSiguiente } = this._els ?? {};
    if (!foto) return;

    const hay = this._imagenes.length > 0;

    foto.hidden         = !hay;
    vacio.hidden        =  hay;
    btnAnterior.hidden  = !hay;
    btnSiguiente.hidden = !hay;
    contador.hidden     = !hay;

    if (!hay) return;

    const src = this._imagenes[this._indice];

    foto.style.opacity = "0";
    foto.addEventListener("load", () => {
      fondo.style.backgroundImage = `url('${src}')`;
      foto.style.opacity = "1";
    }, { once: true });

    foto.src = src;
    foto.alt = `Imagen ${this._indice + 1} de ${this._imagenes.length}`;
    contador.textContent = `${this._indice + 1} / ${this._imagenes.length}`;
  }
}

customElements.define("galeria-imagenes", GaleriaImagenes);