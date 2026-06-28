import "./components/app-header.js";
import "./components/mapa-costa-rica.js";
import "./components/destino-detalle.js";

console.log("Aplicación iniciada", Date.now());

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("app-header");
  const mapa = document.querySelector("mapa-costa-rica");
  const detalle = document.querySelector("destino-detalle");

  header?.addEventListener("region-selected", ({ detail }) => {
    mapa?.filtrarPorRegion(detail.region);
  });

  document.addEventListener("destino-seleccionado", ({ detail }) => {
    mapa?.marcarDestinoActivo(detail.destinoId);
  });

  header?.addEventListener("hero-action", ({ detail }) => {
    switch (detail.action) {
      case "explorar":
        mapa?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;

      case "audio":
        detalle?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        break;
    }
  });
});