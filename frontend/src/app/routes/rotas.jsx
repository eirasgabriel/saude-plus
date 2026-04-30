
// ROTAS DO SISTEMA 
// Define todos os caminhos de navegação da aplicação
// Inclui proteção por nível de acesso


import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- Importação das Telas ---
import Login from "../../presentation/pages/login";
import CadastroPaciente from "../../presentation/pages/cadastro-paciente";
import HomePaciente from "../../presentation/pages/home-paciente";
import HomeMaster from "../../presentation/pages/home-master";
import HomeAdmin from "../../presentation/pages/home-admin";
import HomeMedico from "../../presentation/pages/home-medico";
import AgendarConsulta from "../../presentation/pages/agendar-consulta";
import AgendarExame from "../../presentation/pages/agendar-exame";
import AdminConsultasClinica from "../../presentation/pages/admin-consultas-clinica";
import AdminExamesClinica from "../../presentation/pages/admin-exames-clinica";
import PacienteConsultas from "../../presentation/pages/paciente-consultas";
import PacienteDownloads from "../../presentation/pages/paciente-downloads";
import PacienteExames from "../../presentation/pages/paciente-exames";
import PacienteHistorico from "../../presentation/pages/paciente-historico";
import PacientePerfil from "../../presentation/pages/paciente-perfil";
import PacienteClinicaDetalhes from "../../presentation/pages/paciente-clinica-detalhes";
import AdminGerenciarClinicas from "../../presentation/pages/admin-gerenciar-clinicas";
import AdminGerenciarUsuarios from "../../presentation/pages/admin-gerenciar-usuarios";
import AdminRelatoriosSistema from "../../presentation/pages/admin-relatorios-sistema";

// --- Importação da lógica de autenticação ---
import { estaAutenticado, temPermissao } from "../../application/auth/auth-service";

/**
 * Componente de Rota Protegida
 * Redireciona para login se o usuário não estiver autenticado
 * @param {string} nivelNecessario - Nível mínimo de acesso (opcional)
 */
function RotaProtegida({ children, nivelNecessario }) {
  const autenticado = estaAutenticado();

  // Se não estiver logado, vai para o login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Se exige um nível específico e o usuário não tem, bloqueia
  if (nivelNecessario && !temPermissao(nivelNecessario)) {
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
        <Route path="/cadastro" element={<CadastroPaciente />} />

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
              <AgendarConsulta />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/agendar-exame"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <AgendarExame />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/consultas"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacienteConsultas />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/exames"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacienteExames />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/clinicas/:id"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacienteClinicaDetalhes />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/historico"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacienteHistorico />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/downloads"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacienteDownloads />
            </RotaProtegida>
          }
        />
        <Route
          path="/paciente/perfil"
          element={
            <RotaProtegida nivelNecessario="paciente">
              <PacientePerfil />
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
        <Route
          path="/admin/painel/consultas"
          element={
            <RotaProtegida nivelNecessario="admin_clinica">
              <AdminConsultasClinica />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/painel/exames"
          element={
            <RotaProtegida nivelNecessario="admin_clinica">
              <AdminExamesClinica />
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
        <Route
          path="/admin/master/clinicas"
          element={
            <RotaProtegida nivelNecessario="admin_master">
              <AdminGerenciarClinicas />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/master/usuarios"
          element={
            <RotaProtegida nivelNecessario="admin_master">
              <AdminGerenciarUsuarios />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/master/relatorios"
          element={
            <RotaProtegida nivelNecessario="admin_master">
              <AdminRelatoriosSistema />
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
