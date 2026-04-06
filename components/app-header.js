class AppHeader extends HTMLElement {

    connectedCallback() {
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
      <style>
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
}

        header {
          background: #536d5f;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .marca {
          display: flex;
          flex-direction: column;
        }

        .titulo {
          color: #f4a11a;
          font-size: 1.2rem;
          font-weight: bold;
          font-family: Georgia, serif;
        }

        .subtitulo {
          color: #a8c4a2;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        nav {
          display: flex;
          gap: 0.5rem;
        }

        button {
          background: transparent;
          border: 1px solid transparent;
          color: #a8c4a2;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: all 200ms ease;
        }

        button:hover {
          border-color: #f4a11a;
          color: #f0ede4;
        }

        button.active {
          background: rgba(244, 161, 26, 0.15);
          border-color: #f4a11a;
          color: #f4a11a;
          font-weight: bold;
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