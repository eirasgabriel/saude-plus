import React from "react";
import { useNavigate } from "react-router-dom";
import MenuUsuario from "./menu-usuario";

function MenuUsuarioPaciente({ mostrarPerfil = true }) {
  const navigate = useNavigate();

  function irParaPerfil() {
    navigate("/paciente/perfil");
  }

  return <MenuUsuario mostrarPerfil={mostrarPerfil} aoPerfil={irParaPerfil} />;
}

export default MenuUsuarioPaciente;
