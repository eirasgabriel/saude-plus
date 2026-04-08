
// ROTAS DO SISTEMA 
// Define todos os caminhos de navegação da aplicação
// Inclui proteção por nível de acesso


import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Importação das Telas ---
import Login from "../telas/login";
import HomePaciente from "../telas/home-paciente";
import HomeMaster from "../telas/home-master";
import HomeAdmin from "../telas/home-admin";
import HomeMedico from "../telas/home-medico";
// import HomeMedico from "../telas/home-medico";         // TODO: implementar
// import HomeAdmin from "../telas/home-admin";           // TODO: implementar
// import AgendarConsulta from "../telas/agendar-consulta"; // TODO: implementar

// --- Importação da lógica de autenticação ---
import { estaAutenticado, obterUsuarioAtual } from "../logica-de-controle/auth";

/**
 * Componente de Rota Protegida
 * Redireciona para login se o usuário não estiver autenticado
 * @param {string} nivelNecessario - Nível mínimo de acesso (opcional)
 */
function RotaProtegida({ children, nivelNecessario }) {
  const autenticado = estaAutenticado();
  const usuario = obterUsuarioAtual();

  // Se não estiver logado, vai para o login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Se exige um nível específico e o usuário não tem, bloqueia
  if (nivelNecessario && usuario?.nivel_acesso !== nivelNecessario) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
}

/**
 * Componente principal de rotas do Saúde+
 * Organiza todos os caminhos da aplicação
 */
function RotasPrincipais() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública — Tela de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota padrão — redireciona para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />


        {/* ROTAS DO PACIENTE                          */}

        <Route
          path="/paciente/inicio"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <HomePaciente />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/agendar"
          element={
            <RotaProtegida nivelNecessario="paciente">
              {/* TODO: <AgendarConsulta /> */}
              <div>Tela de Agendamento — em breve</div>
            </RotaProtegida>
          }
        />

        {/* ROTAS DO MÉDICO (RN2: apenas sua clínica)  */}

        <Route
          path="/medico/agenda"
          element={
            <RotaProtegida nivelNecessario="medico">
              {/* TODO: <HomeMedico /> */}
              <HomeMedico />
            </RotaProtegida>
          }
        />

        {/* ROTAS DO ADMIN (Clínica e Master)          */}
   
        <Route
          path="/admin/painel"
          element={
            <RotaProtegida nivelNecessario="admin_clinica">
              {/* TODO: <HomeAdmin /> */}
              <HomeAdmin />
            </RotaProtegida>
          }
        />
        
        {/*Admin master (prefeitura)*/}
        <Route
          path="/admin/master"
          element={
            <RotaProtegida nivelNecessario="admin_master">
              <HomeMaster />
            </RotaProtegida>
          }
        />
        
        {/* Rota de acesso negado */}
        <Route
          path="/sem-permissao"
          element={
            <div className="flex items-center justify-center h-screen">
              <p className="text-red-500 text-lg">
                Você não tem permissão para acessar esta página.
              </p>
            </div>
          }
        />

        {/* Rota 404 — página não encontrada */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <p className="text-gray-500 text-lg">
                Página não encontrada.
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default RotasPrincipais;
