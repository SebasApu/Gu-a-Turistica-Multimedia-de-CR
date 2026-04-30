class AppHeader extends HTMLElement {

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --color-fondo: #2d4a3e;
          --color-fondo-claro: #3d5d50;
          --color-acento: #f4a11a;
          --color-acento-suave: rgba(244, 161, 26, 0.12);
          --color-texto: #e8ddc7;
          --color-texto-suave: #a8c4a2;
          --sombra: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        /* Franja de bandera con sombra suave debajo */
        .franja {
          height: 6px;
          background: linear-gradient(
            to right,
            #0057a8 20%,
            #ffffff 20%,
            #ffffff 27%,
            #e8112d 27%,
            #e8112d 73%,
            #ffffff 73%,
            #ffffff 80%,
            #0057a8 80%
          );
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        /* Header con gradiente sutil y textura de profundidad */
        header {
          background: linear-gradient(135deg, var(--color-fondo) 0%, var(--color-fondo-claro) 100%);
          padding: 1.25rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          box-shadow: var(--sombra);
          position: relative;
          overflow: hidden;
        }

        /* Patrón decorativo sutil de fondo */
        header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background:
            radial-gradient(circle at 80% 50%, rgba(244, 161, 26, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .marca {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          position: relative;
          z-index: 1;
        }

        .titulo {
          color: var(--color-acento);
          font-size: 1.4rem;
          font-weight: 700;
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.01em;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .subtitulo {
          color: var(--color-texto-suave);
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 500;
        }

        nav {
          display: flex;
          gap: 0.4rem;
          position: relative;
          z-index: 1;
        }

        button {
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-texto-suave);
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          font-family: inherit;
        }

        /* Línea inferior animada en hover */
        button::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 4px;
          width: 0;
          height: 2px;
          background: var(--color-acento);
          transition: all 250ms ease;
          transform: translateX(-50%);
          border-radius: 2px;
        }

        button:hover {
          color: var(--color-texto);
          background: rgba(255, 255, 255, 0.04);
        }

        button:hover::after {
          width: 60%;
        }

        button:focus-visible {
          outline: 2px solid var(--color-acento);
          outline-offset: 2px;
        }

        button.active {
          background: var(--color-acento-suave);
          border-color: var(--color-acento);
          color: var(--color-acento);
          box-shadow: 0 2px 8px rgba(244, 161, 26, 0.2);
        }

        button.active::after {
          width: 0;
        }

        button:active {
          transform: translateY(1px);
        }
      </style>

      <div class="franja"></div>

      <header>
        <div class="marca">
          <span class="titulo">De volcanes a selvas</span>
          <span class="subtitulo">Explorando Costa Rica</span>
        </div>

        <nav>
          <button data-region="Caribe">Caribe</button>
          <button data-region="Pacífico Norte">Pacífico Norte</button>
          <button data-region="Región Central">Región Central</button>
          <button data-region="Pacífico Sur">Pacífico Sur</button>
        </nav>
      </header>
    `;

    this.shadowRoot.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.shadowRoot.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.dispatchEvent(new CustomEvent('region-selected', {
          bubbles: true,
          composed: true,
          detail: { region: btn.dataset.region }
        }));
      });
    });
  }

}

customElements.define('app-header', AppHeader);