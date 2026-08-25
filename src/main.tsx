// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/kanban.css"; // Se você tiver estilos Kanban
import "react-grid-layout/css/styles.css"; // Adicione ou confirme
import "react-resizable/css/styles.css"; // Adicione ou confirme

const container = document.getElementById("root")!;

/*
 * A home pública é servida pré-renderizada (ver scripts/prerender.mjs) para que
 * o texto esteja no HTML inicial, indexável e visível antes do bundle carregar.
 * O React assume a partir daqui: esvaziamos o container primeiro para o
 * conteúdo estático não conflitar com a primeira renderização do app.
 */
if (container.dataset.prerendered === "true") {
  container.replaceChildren();
  delete container.dataset.prerendered;
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
