// ============================================================
// mapa-costa-rica.js
// Web Component: <mapa-costa-rica></mapa-costa-rica>
// ============================================================

const COLORES = {
  volcan:  '#ef4444',
  playa:   '#06b6d4',
  selva:   '#10b981',
  ruinas:  '#f59e0b',
  default: '#6366f1'
};

const ETIQUETAS_TIPO = {
  volcan: 'Volcanes',
  playa:  'Playas',
  selva:  'Selvas',
  ruinas: 'Ruinas'
};

// viewBox recortado al mainland (sin Isla del Coco).
// El SVG original es 0 0 1000 1000; el continente está aprox en x:130-870, y:60-560
const VIEW_BOX = '120 50 760 540';

class MapaCostaRica extends HTMLElement {
  constructor() {
    super();
    this.destinos = [];
    this.activo = null;
  }

  connectedCallback() {
    this.rutaJson = this.getAttribute('destinos') || './data/destinos.json';
    this.rutaSvg  = this.getAttribute('svg')      || './assets/img/cr.svg';

    this._render();
    this._cargarTodo();
  }

  _render() {
    this.innerHTML = `
      <div class="mcr-wrap">
        <div class="mcr-mapa">
          <div class="mcr-svg-contenedor">
            <div class="mcr-svg-pais"></div>
            <svg class="mcr-svg-pins" viewBox="${VIEW_BOX}"
                 preserveAspectRatio="xMidYMid meet">
              <g class="mcr-marcadores"></g>
            </svg>
          </div>
        </div>

        <div class="mcr-leyenda"></div>
        <div class="mcr-info" hidden></div>
      </div>
    `;

    this._inyectarEstilos();
  }

  _inyectarEstilos() {
    if (document.getElementById('mcr-estilos')) return;
    const css = `
      mapa-costa-rica { display: block; }

      .mcr-wrap {
        max-width: 960px;
        margin: 0 auto;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .mcr-mapa {
        background: linear-gradient(135deg, #ecfdf5, #ecfeff);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      .mcr-svg-contenedor {
        position: relative;
        width: 100%;
      }
      .mcr-svg-pais,
      .mcr-svg-pais > svg,
      .mcr-svg-pins {
        width: 100%;
        height: auto;
        display: block;
      }
      .mcr-svg-pins {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .mcr-pin {
        cursor: pointer;
        pointer-events: all;
      }

      .mcr-tooltip {
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .mcr-pin:hover .mcr-tooltip { opacity: 1; }

      .mcr-leyenda {
        display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;
        margin-top: 20px;
      }
      .mcr-leyenda-item {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 14px; color: #374151;
      }
      .mcr-leyenda-dot {
        width: 12px; height: 12px; border-radius: 50%;
      }
      .mcr-info {
        margin-top: 20px; padding: 18px; background: white;
        border-left: 5px solid #10b981; border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .mcr-info h3 { margin: 0 0 4px 0; color: #111827; }
      .mcr-info-region {
        font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
        font-weight: 600; margin-bottom: 6px;
      }
      .mcr-info p { margin: 8px 0; color: #4b5563; line-height: 1.5; }
      .mcr-info ul { margin: 8px 0 0 0; padding-left: 20px; color: #374151; }
      .mcr-info li { margin: 3px 0; }
      .mcr-info-cerrar {
        float: right; background: none; border: none; cursor: pointer;
        font-size: 24px; line-height: 1; color: #9ca3af;
      }
      .mcr-info-cerrar:hover { color: #374151; }
    `;
    const style = document.createElement('style');
    style.id = 'mcr-estilos';
    style.textContent = css;
    document.head.appendChild(style);
  }

  async _cargarTodo() {
    await Promise.all([
      this._cargarSvg(),
      this._cargarDestinos()
    ]);
    this._pintarMarcadores();
    this._pintarLeyenda();
  }

  async _cargarSvg() {
    try {
      const resp = await fetch(this.rutaSvg);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      let svgTexto = await resp.text();

      // Reemplazar el viewBox del SVG cargado para recortar la Isla del Coco
      svgTexto = svgTexto.replace(
        /viewBox="[^"]*"/i,
        `viewBox="${VIEW_BOX}"`
      );

      this.querySelector('.mcr-svg-pais').innerHTML = svgTexto;
    } catch (err) {
      console.error('[mapa-costa-rica] error cargando SVG:', err);
      this.querySelector('.mcr-svg-pais').innerHTML =
        `<p style="color:#b91c1c; text-align:center; padding:40px">
           No se pudo cargar el mapa: ${err.message}
         </p>`;
    }
  }

  async _cargarDestinos() {
    try {
      const resp = await fetch(this.rutaJson);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.destinos = data.destinos || [];
    } catch (err) {
      console.error('[mapa-costa-rica] error cargando destinos:', err);
    }
  }

  _pintarMarcadores() {
    const grupo = this.querySelector('.mcr-marcadores');
    if (!grupo) return;
    grupo.innerHTML = '';

    this.destinos.forEach(d => {
      const color = COLORES[d.tipo] || COLORES.default;

      const gPin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gPin.setAttribute('class', 'mcr-pin');
      gPin.setAttribute('transform', `translate(${d.x}, ${d.y})`);
      gPin.setAttribute('data-id', d.id);

      gPin.innerHTML = `
        <circle r="14" fill="${color}" opacity="0.25" />
        <circle r="8"  fill="${color}" stroke="white" stroke-width="2" />
        <g class="mcr-tooltip" transform="translate(14, -12)">
          <rect x="0" y="-12" rx="6" ry="6"
                width="${d.nombre.length * 6.5 + 14}" height="22"
                fill="white" stroke="${color}" stroke-width="1.5" />
          <text x="${(d.nombre.length * 6.5 + 14) / 2}" y="3"
                text-anchor="middle" font-size="11" font-weight="600"
                fill="${color}">${d.nombre}</text>
        </g>
      `;

      gPin.addEventListener('click', () => this._mostrarInfo(d));
      grupo.appendChild(gPin);
    });
  }

  _pintarLeyenda() {
    const tiposPresentes = [...new Set(this.destinos.map(d => d.tipo))];
    const html = tiposPresentes.map(tipo => `
      <span class="mcr-leyenda-item">
        <span class="mcr-leyenda-dot" style="background:${COLORES[tipo] || COLORES.default}"></span>
        ${ETIQUETAS_TIPO[tipo] || tipo}
      </span>
    `).join('');
    this.querySelector('.mcr-leyenda').innerHTML = html;
  }

  _mostrarInfo(destino) {
    const panel = this.querySelector('.mcr-info');
    const color = COLORES[destino.tipo] || COLORES.default;

    if (this.activo === destino.id) {
      panel.hidden = true;
      this.activo = null;
      return;
    }

    this.activo = destino.id;
    panel.hidden = false;
    panel.style.borderLeftColor = color;

    panel.innerHTML = `
      <button class="mcr-info-cerrar" aria-label="Cerrar">×</button>
      <div class="mcr-info-region" style="color:${color}">${destino.region}</div>
      <h3>${destino.nombre}</h3>
      <p>${destino.descripcion}</p>
      ${destino.highlights?.length ? `
        <ul>${destino.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
      ` : ''}
    `;

    panel.querySelector('.mcr-info-cerrar').addEventListener('click', () => {
      panel.hidden = true;
      this.activo = null;
    });
  }
}

if (!customElements.get('mapa-costa-rica')) {
  customElements.define('mapa-costa-rica', MapaCostaRica);
}