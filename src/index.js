import React from "react";
import ReactDOM from "react-dom/client";

// Importa sua tela de login

import "./index.css";

import Rotas from "./caminhos-do-sistema/rotas";



const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Rotas />
  </React.StrictMode>
);