import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RELATORIO_VAZIO,
  obterRelatoriosSistema,
} from "../../application/sistema/relatorios-use-cases";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { ouvirConsultasAtualizadas } from "../../application/agenda/consultas-eventos";
import { ouvirUsuariosAtualizados } from "../../application/usuarios/usuarios-eventos";
import CabecalhoApp from "../components/cabecalho-app";

const ROTULOS_STATUS = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

function formatarData(data) {
  if (!data) return "-";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarAtualizacao(dataIso) {
  if (!dataIso) return "Atualizando em tempo real";

  return new Date(dataIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminRelatoriosSistema() {
  const navigate = useNavigate();
  const [relatorio, setRelatorio] = useState(RELATORIO_VAZIO);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarRelatorios() {
    setCarregando(true);
    setErro("");
    try {
      setRelatorio(await obterRelatoriosSistema());
    } catch (falha) {
      setErro(falha.message || "Nao foi possivel carregar os relatorios.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRelatorios();
  }, []);

  useEffect(() => ouvirClinicasAtualizadas(carregarRelatorios), []);
  useEffect(() => ouvirConsultasAtualizadas(carregarRelatorios), []);
  useEffect(() => ouvirUsuariosAtualizados(carregarRelatorios), []);

  const { atualizadoEm, periodo, resumo, porClinica, porEspecialidade, porStatus, consultasRecentes } = relatorio;
  const maiorVolumeEspecialidade = Math.max(
    ...porEspecialidade.map((item) => item.total),
    1
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        compacto
        aoVoltar={() => navigate("/admin/master")}
        textoVoltar="Voltar ao painel"
        voltarSomenteIcone
        titulo="Relatorios do sistema"
        descricao={
          <>
            Indicadores calculados a partir das clinicas, usuarios e consultas cadastradas.
            <span className="mt-1 block text-xs">
              Atualizado em {formatarAtualizacao(atualizadoEm)}
            </span>
          </>
        }
      />

      <main className="app-content space-y-5">
        {carregando && (
          <p className="text-center text-sm text-gray-500">Carregando relatorios...</p>
        )}

        {!carregando && erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{erro}</p>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Consultas no mes</p>
            <strong className="text-3xl text-gray-800">{resumo.consultasMes}</strong>
            <p className="text-xs text-gray-400 mt-1">
              Periodo {periodo.rotulo || "atual"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Realizadas</p>
            <strong className="text-3xl text-gray-800">{resumo.consultasRealizadas}</strong>
            <p className="text-xs text-gray-400 mt-1">Atendimentos concluidos</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Usuarios ativos</p>
            <strong className="text-3xl text-gray-800">{resumo.usuariosAtivos}</strong>
            <p className="text-xs text-gray-400 mt-1">De {resumo.totalUsuarios} cadastrados</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Taxa de cancelamento</p>
            <strong className="text-3xl text-gray-800">{resumo.taxaCancelamento}%</strong>
            <p className="text-xs text-gray-400 mt-1">{resumo.consultasCanceladas} canceladas</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Desempenho por clinica
                </h2>
                <p className="text-gray-500 text-sm">
                  Compara volume, ocupacao e satisfacao das unidades.
                </p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                {resumo.clinicasAtivas}/{resumo.totalClinicas} ativas
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-3 font-semibold rounded-l-xl">Clinica</th>
                    <th className="text-left px-3 py-3 font-semibold">Consultas</th>
                    <th className="text-left px-3 py-3 font-semibold">Realizadas</th>
                    <th className="text-left px-3 py-3 font-semibold">Canceladas</th>
                    <th className="text-left px-3 py-3 font-semibold">Ocupacao</th>
                    <th className="text-left px-3 py-3 font-semibold rounded-r-xl">Satisfacao</th>
                  </tr>
                </thead>
                <tbody>
                  {porClinica.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-800">{item.nome}</p>
                        <p className="text-gray-500">{item.bairro}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700">{item.consultas}</td>
                      <td className="px-3 py-3 text-gray-700">{item.realizadas}</td>
                      <td className="px-3 py-3 text-gray-700">{item.canceladas}</td>
                      <td className="px-3 py-3">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400"
                            style={{ width: `${item.ocupacao}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.ocupacao}% hoje</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700">{item.satisfacao}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Especialidades mais buscadas
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Volume de consultas por area de atendimento.
              </p>
              <div className="space-y-3">
                {porEspecialidade.map((item) => (
                  <div key={item.especialidade}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">{item.especialidade}</span>
                      <span className="text-gray-500">{item.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400"
                        style={{
                          width: `${Math.round((item.total / maiorVolumeEspecialidade) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Status das consultas</h2>
              <p className="text-gray-500 text-sm mb-4">
                Visao operacional dos agendamentos do mes.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(porStatus).map(([status, total]) => (
                  <div key={status} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-500 text-sm">{ROTULOS_STATUS[status] || status}</p>
                    <strong className="text-2xl text-gray-800">{total}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Consultas recentes</h2>
          <p className="text-gray-500 text-sm">
            Registro usado para compor os indicadores do painel.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-3 font-semibold rounded-l-xl">Data</th>
                  <th className="text-left px-3 py-3 font-semibold">Paciente</th>
                  <th className="text-left px-3 py-3 font-semibold">Clinica</th>
                  <th className="text-left px-3 py-3 font-semibold">Especialidade</th>
                  <th className="text-left px-3 py-3 font-semibold">Medico</th>
                  <th className="text-left px-3 py-3 font-semibold rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {consultasRecentes.map((consulta) => (
                  <tr key={consulta.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 text-gray-600">
                      {formatarData(consulta.data)} as {consulta.horario}
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{consulta.paciente}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {consulta.clinica || "Sem clinica"}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{consulta.especialidade}</td>
                    <td className="px-3 py-3 text-gray-600">{consulta.medico}</td>
                    <td className="px-3 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                        {ROTULOS_STATUS[consulta.status] || consulta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminRelatoriosSistema;
