class AppHeader extends HTMLElement {
  static get observedAttributes() {
    return ["active-region"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (nombre !== "active-region" || !this.shadowRoot) return;

    this.shadowRoot.querySelectorAll(".filtro").forEach((btn) => {
      const activo = btn.dataset.region === nuevo;
      btn.classList.toggle("activo", activo);
      btn.setAttribute("aria-pressed", activo ? "true" : "false");
    });
  }

  connectedCallback() {
    this.render();
    this.eventos();

    document.addEventListener("region-cleared", () => this.desmarcar());
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Inter, system-ui, sans-serif;
          color: white;
        }

        .hero {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            linear-gradient(
              rgba(8, 15, 20, 0.34),
              rgba(8, 15, 20, 0.6)
            ),
            url("assets/img/header.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.16) 0%,
              rgba(0, 0, 0, 0.4) 52%,
              rgba(0, 0, 0, 0.58) 100%
            );
        }

        .contenido {
          position: relative;
          z-index: 2;
          width: min(1120px, 92%);
          text-align: center;
          color: white;
          padding: 72px 0 56px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(14px);
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .eyebrow {
          margin: 0 0 12px;
          font-size: 0.92rem;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: clamp(2.7rem, 6vw, 5.2rem);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.03em;
          font-family: "Playfair Display", Georgia, serif;
          text-shadow: 0 10px 28px rgba(0, 0, 0, 0.34);
        }

        p {
          margin: 18px auto 0;
          max-width: 720px;
          font-size: 1.06rem;
          line-height: 1.8;
          color: rgba(243, 244, 246, 0.96);
        }

        .acciones {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .cta {
          appearance: none;
          border: none;
          border-radius: 999px;
          padding: 14px 22px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .cta:hover {
          transform: translateY(-2px);
        }

        .cta:focus-visible,
        .filtro:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.88);
          outline-offset: 3px;
        }

        .cta.primaria {
          background: #ffffff;
          color: #14532d;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.16);
        }

        .cta.primaria:hover {
          background: #f9fafb;
        }

        .meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 18px;
          margin-top: 18px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.92rem;
        }

        .meta span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .filtros {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 34px;
        }

        .filtro {
          padding: 12px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          color: white;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.94rem;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .filtro:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.18);
        }

        .filtro.activo {
          background: rgba(20, 83, 45, 0.95);
          border-color: rgba(255, 255, 255, 0.24);
          color: white;
          box-shadow: 0 10px 26px rgba(20, 83, 45, 0.32);
        }

        .scroll {
          margin-top: 42px;
          font-size: 0.82rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.92;
          animation: float 2.2s infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(7px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .contenido {
            padding: 54px 0 40px;
          }

          p {
            font-size: 1rem;
          }

          .acciones {
            flex-direction: column;
            align-items: center;
          }

          .cta {
            width: min(320px, 100%);
          }
        }
      </style>

      <section class="hero">
        <div class="contenido">
          <div class="badge">🇨🇷 Costa Rica</div>

          <div class="eyebrow">Guía interactiva de viaje</div>

          <h1>De volcanes a selvas</h1>

          <p>
            Recorre Costa Rica desde volcanes activos y bosques nubosos
            hasta playas del Caribe y del Pacífico con un mapa interactivo,
            recomendaciones visuales y audioguías para cada destino.
          </p>

          <div class="acciones">
            <button class="cta primaria" type="button" data-action="explorar">
              Explorar destinos
            </button>
          </div>

          <div class="meta" aria-label="Categorías destacadas">
            <span>🌊 Playas</span>
            <span>🌋 Volcanes</span>
            <span>🌿 Selvas</span>
            <span>🏛️ Historia</span>
          </div>

          <div class="filtros" role="group" aria-label="Filtrar por región">
            <button
              class="filtro"
              type="button"
              data-region="Caribe"
              aria-pressed="false">
              🌴 Caribe
            </button>

            <button
              class="filtro"
              type="button"
              data-region="Pacífico Norte"
              aria-pressed="false">
              🏖 Pacífico Norte
            </button>

            <button
              class="filtro"
              type="button"
              data-region="Región Central"
              aria-pressed="false">
              🌋 Región Central
            </button>

            <button
              class="filtro"
              type="button"
              data-region="Pacífico Sur"
              aria-pressed="false">
              🌿 Pacífico Sur
            </button>
          </div>

          <div class="scroll">▼ Explora el mapa ▼</div>
        </div>
      </section>
    `;
  }

  eventos() {
    this.shadowRoot.querySelectorAll(".filtro").forEach((btn) => {
      btn.addEventListener("click", () => {
        const activo = btn.classList.contains("activo");
        const region = activo ? null : btn.dataset.region;

        this.shadowRoot.querySelectorAll(".filtro").forEach((b) => {
          b.classList.remove("activo");
          b.setAttribute("aria-pressed", "false");
        });

        if (!activo) {
          btn.classList.add("activo");
          btn.setAttribute("aria-pressed", "true");
          this.setAttribute("active-region", region);
        } else {
          this.removeAttribute("active-region");
        }

        this.dispatchEvent(
          new CustomEvent("region-selected", {
            bubbles: true,
            composed: true,
            detail: { region },
          }),
        );
      if (region) {
        const mapa = document.querySelector("mapa-costa-rica");
        mapa?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

    const explorar = this.shadowRoot.querySelector('[data-action="explorar"]');

    explorar?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("hero-action", {
          bubbles: true,
          composed: true,
          detail: { action: "explorar" },
        }),
      );
    });
  }

  desmarcar() {
  this.shadowRoot.querySelectorAll(".filtro").forEach((b) => {
    b.classList.remove("activo");
    b.setAttribute("aria-pressed", "false");
  });
  this.removeAttribute("active-region");
}
}



customElements.define("app-header", AppHeader);