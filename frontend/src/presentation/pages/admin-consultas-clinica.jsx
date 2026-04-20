import React, { useCallback, useEffect, useMemo, useState } from "react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { buscarConsultasClinica } from "../../application/agenda/agendamento-use-cases";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import { listarUsuarios } from "../../application/usuarios/usuarios-use-cases";
import MenuInferiorAdmin from "../components/menu-inferior-admin";

function obterDataHojeIso() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, "0");
  const d = String(hoje.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function extrairIntervaloFuncionamento(horarioTexto) {
  const match = String(horarioTexto || "").match(/(\d{2})h\s+(?:as|as)\s+(\d{2})h/i);
  if (!match) return null;
  return {
    inicio: `${match[1]}:00`,
    fim: `${match[2]}:00`,
  };
}

function parseAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;
  return {
    data: parsed[2],
    horario: `${parsed[3]}:${parsed[4]}`,
  };
}

function AdminConsultasClinica() {
  const usuario = obterUsuarioAtual();
  const [clinicaVinculada, setClinicaVinculada] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [consultasDoDia, setConsultasDoDia] = useState([]);
  const [carregandoConsultas, setCarregandoConsultas] = useState(false);
  const [erroConsultas, setErroConsultas] = useState("");
  const [modoEdicaoTabela, setModoEdicaoTabela] = useState(false);
  const [consultasEmEdicao, setConsultasEmEdicao] = useState([]);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const nomeClinica = clinicaVinculada?.nome || "Clinica nao identificada";

  useEffect(() => {
    async function carregarClinicaVinculada() {
      if (!usuario?.clinica_id) return;

      setErroConsultas("");
      try {
        const [clinica, usuariosApi] = await Promise.all([
          buscarClinicaPorId(usuario.clinica_id),
          listarUsuarios(),
        ]);
        setClinicaVinculada(clinica);
        setUsuarios(Array.isArray(usuariosApi) ? usuariosApi : []);
      } catch (erro) {
        setErroConsultas(erro.message || "Nao foi possivel carregar a clinica vinculada.");
      }
    }

    carregarClinicaVinculada();
  }, [usuario?.clinica_id]);

  const horarioFuncionamento = useMemo(
    () => extrairIntervaloFuncionamento(clinicaVinculada?.horario),
    [clinicaVinculada]
  );

  const carregarConsultas = useCallback(async () => {
    if (!clinicaVinculada) return;
    setCarregandoConsultas(true);
    setErroConsultas("");
    try {
      const dataHoje = obterDataHojeIso();
      const consultas = await buscarConsultasClinica(clinicaVinculada.id);
      const consultasFormatadas = consultas
        .map((consulta) => {
          const agenda = parseAgendaId(consulta.agenda_id);
          const data = consulta.data || consulta.data_consulta || agenda?.data;
          const horario = consulta.horario || consulta.hora || agenda?.horario || "-";
          const paciente =
            consulta.paciente ||
            usuarios.find((item) => Number(item.id) === Number(consulta.paciente_id))?.nome ||
            `Paciente ${consulta.paciente_id}`;

          return {
            ...consulta,
            data,
            horario,
            paciente,
            especialidade: consulta.especialidade || "Nao informada",
            medico: consulta.medico || `Medico ${consulta.medico_id}`,
            status: consulta.status || "agendada",
          };
        })
        .filter((consulta) => consulta.data === dataHoje)
        .sort((a, b) => String(a.horario).localeCompare(String(b.horario)));

      setConsultasDoDia(consultasFormatadas);
    } catch (e) {
      setErroConsultas(e.message || "Nao foi possivel carregar as consultas da clinica.");
    } finally {
      setCarregandoConsultas(false);
    }
  }, [clinicaVinculada, usuarios]);

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  function iniciarEdicaoEmMassa() {
    setConsultasEmEdicao(consultasDoDia.map((consulta) => ({ ...consulta })));
    setModoEdicaoTabela(true);
  }

  function cancelarEdicaoEmMassa() {
    setModoEdicaoTabela(false);
    setConsultasEmEdicao([]);
  }

  function alterarCampoConsulta(indice, campo, valor) {
    setConsultasEmEdicao((listaAtual) =>
      listaAtual.map((consulta, i) =>
        i === indice ? { ...consulta, [campo]: valor } : consulta
      )
    );
  }

  function salvarEdicaoEmMassa() {
    setConsultasDoDia(consultasEmEdicao);
    setModoEdicaoTabela(false);
    setConsultasEmEdicao([]);
  }

  function deletarConsulta(indice) {
    setConsultasEmEdicao((listaAtual) => listaAtual.filter((_, i) => i !== indice));
  }

  const resumoConsultas = useMemo(() => {
    return consultasDoDia.reduce(
      (acc, consulta) => {
        const status = String(consulta.status || "").toLowerCase();
        acc.total += 1;
        if (status === "realizada") acc.realizadas += 1;
        if (status === "cancelada") acc.canceladas += 1;
        if (["agendada", "confirmada"].includes(status)) acc.pendentes += 1;
        return acc;
      },
      { total: 0, pendentes: 0, realizadas: 0, canceladas: 0 }
    );
  }, [consultasDoDia]);

  function sairDaConta() {
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-blue-400 px-5 pb-6 pt-12 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100">Admin da Clinica</p>
            <h1 className="text-2xl font-bold leading-tight text-white">
              Consultas
            </h1>
          </div>
          <div className="relative z-30">
            <button
              type="button"
              onClick={() => setMenuUsuarioAberto((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white bg-opacity-20 text-xl text-white"
              aria-label="Perfil do usuario"
            >
              +
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                <button
                  type="button"
                  onClick={sairDaConta}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-blue-100">
          Consultas da clinica {nomeClinica}
        </p>
      </header>

      <main className="space-y-4 px-4 py-5">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Consultas hoje</p>
            <strong className="text-3xl text-gray-800">{resumoConsultas.total}</strong>
            <p className="mt-1 text-xs text-gray-400">Agendamentos reais</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pendentes</p>
            <strong className="text-3xl text-gray-800">{resumoConsultas.pendentes}</strong>
            <p className="mt-1 text-xs text-gray-400">Agendadas ou confirmadas</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Realizadas</p>
            <strong className="text-3xl text-gray-800">{resumoConsultas.realizadas}</strong>
            <p className="mt-1 text-xs text-gray-400">Atendimentos concluidos</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Canceladas</p>
            <strong className="text-3xl text-gray-800">{resumoConsultas.canceladas}</strong>
            <p className="mt-1 text-xs text-gray-400">Remarcacao necessaria</p>
          </div>
        </section>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold">Consultas do dia</h2>
            {!modoEdicaoTabela ? (
              <button
                type="button"
                onClick={iniciarEdicaoEmMassa}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                Editar todas
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={salvarEdicaoEmMassa}
                  className="rounded-lg bg-blue-400 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Salvar tudo
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicaoEmMassa}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {horarioFuncionamento && (
            <p className="mt-1 text-xs text-gray-400">
              Funcionamento: {horarioFuncionamento.inicio} as {horarioFuncionamento.fim}
            </p>
          )}

          {carregandoConsultas && (
            <p className="mt-4 text-sm text-gray-500">Carregando consultas...</p>
          )}

          {!carregandoConsultas && erroConsultas && (
            <p className="mt-4 text-sm text-red-500">{erroConsultas}</p>
          )}

          {!carregandoConsultas && !erroConsultas && consultasDoDia.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Nao ha consultas agendadas para hoje no horario de funcionamento.
            </p>
          )}

          {!carregandoConsultas && !erroConsultas && consultasDoDia.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] overflow-hidden rounded-xl border border-gray-100 text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Horario</th>
                    <th className="px-3 py-2 text-left font-semibold">Paciente</th>
                    <th className="px-3 py-2 text-left font-semibold">Especialidade</th>
                    <th className="px-3 py-2 text-left font-semibold">Medico</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(modoEdicaoTabela ? consultasEmEdicao : consultasDoDia).map(
                    (consulta, indice) => (
                      <tr key={consulta.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-semibold text-gray-700">
                          {modoEdicaoTabela ? (
                            <input
                              type="time"
                              value={consulta.horario}
                              onChange={(e) =>
                                alterarCampoConsulta(indice, "horario", e.target.value)
                              }
                              className="w-full rounded-lg border border-blue-200 px-2 py-1"
                            />
                          ) : (
                            consulta.horario
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {modoEdicaoTabela ? (
                            <input
                              type="text"
                              value={consulta.paciente}
                              onChange={(e) =>
                                alterarCampoConsulta(indice, "paciente", e.target.value)
                              }
                              className="w-full rounded-lg border border-blue-200 px-2 py-1"
                            />
                          ) : (
                            consulta.paciente
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {modoEdicaoTabela ? (
                            <input
                              type="text"
                              value={consulta.especialidade}
                              onChange={(e) =>
                                alterarCampoConsulta(indice, "especialidade", e.target.value)
                              }
                              className="w-full rounded-lg border border-blue-200 px-2 py-1"
                            />
                          ) : (
                            consulta.especialidade
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {modoEdicaoTabela ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={consulta.medico}
                                onChange={(e) =>
                                  alterarCampoConsulta(indice, "medico", e.target.value)
                                }
                                className="w-full rounded-lg border border-blue-200 px-2 py-1"
                              />
                              <button
                                type="button"
                                onClick={() => deletarConsulta(indice)}
                                className="text-xs font-semibold text-red-500 hover:text-red-600"
                              >
                                Deletar
                              </button>
                            </div>
                          ) : (
                            consulta.medico
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {modoEdicaoTabela ? (
                            <select
                              value={consulta.status}
                              onChange={(e) =>
                                alterarCampoConsulta(indice, "status", e.target.value)
                              }
                              className="w-full rounded-lg border border-blue-200 px-2 py-1"
                            >
                              <option value="agendada">Agendada</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="realizada">Realizada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                          ) : (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                              {consulta.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <MenuInferiorAdmin abaAtiva="consultas" />
      <div className="h-24" />
    </div>
  );
}

export default AdminConsultasClinica;
