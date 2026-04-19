import React, { useCallback, useEffect, useMemo, useState } from "react";
import { obterUsuarioAtual } from "../logica-de-controle/auth";
import { buscarClinicaPorId } from "../dados/clinicas-mock";
import { listarHorariosAgenda } from "../logica-de-controle/agenda";

function obterDataHojeIso() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, "0");
  const d = String(hoje.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function paraMinutos(hora) {
  const [h, m] = String(hora).split(":").map(Number);
  return h * 60 + m;
}

function extrairIntervaloFuncionamento(horarioTexto) {
  const match = String(horarioTexto || "").match(/(\d{2})h\s+às\s+(\d{2})h/);
  if (!match) return null;
  return {
    inicio: `${match[1]}:00`,
    fim: `${match[2]}:00`,
  };
}

/**
 * TELA: Admin Clínica
 * painel da clínica
 */
function HomeAdmin() {
  const usuario = obterUsuarioAtual();
  const clinicaVinculada = buscarClinicaPorId(usuario?.clinica_id);
  const nomeClinica = clinicaVinculada?.nome || "Clínica não identificada";
  const [consultasDoDia, setConsultasDoDia] = useState([]);
  const [carregandoConsultas, setCarregandoConsultas] = useState(false);
  const [erroConsultas, setErroConsultas] = useState("");
  const [modoEdicaoTabela, setModoEdicaoTabela] = useState(false);
  const [consultasEmEdicao, setConsultasEmEdicao] = useState([]);

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
      const especialidades = clinicaVinculada.especialidades || [];
      const listas = await Promise.all(
        especialidades.map((esp) =>
          listarHorariosAgenda(clinicaVinculada.id, dataHoje, null, esp).then(
            (slots) =>
              slots.map((slot) => ({
                id: `${esp}-${slot.id}`,
                horario: slot.hora,
                especialidade: esp,
                medico: `Médico ${slot.medico_id}`,
                disponivel: slot.disponivel,
              }))
          )
        )
      );

      const todas = listas.flat();
      const apenasOcupadas = todas.filter((item) => !item.disponivel);
      const dentroDoFuncionamento = horarioFuncionamento
        ? apenasOcupadas.filter((item) => {
            const minuto = paraMinutos(item.horario);
            return (
              minuto >= paraMinutos(horarioFuncionamento.inicio) &&
              minuto <= paraMinutos(horarioFuncionamento.fim)
            );
          })
        : apenasOcupadas;

      dentroDoFuncionamento.sort((a, b) => a.horario.localeCompare(b.horario));
      setConsultasDoDia(dentroDoFuncionamento);
    } catch (e) {
      setErroConsultas(e.message || "Não foi possível carregar as consultas da clínica.");
    } finally {
      setCarregandoConsultas(false);
    }
  }, [clinicaVinculada, horarioFuncionamento]);

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
    setConsultasEmEdicao((listaAtual) =>
      listaAtual.filter((_, i) => i !== indice)
    );
  }

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <p className="text-blue-100 text-sm">Admin da Clínica</p>
        <h1 className="text-white text-2xl font-bold leading-tight">
          Painel da Clínica
        </h1>
        <p className="text-blue-100 text-sm mt-2">
          Seja bem-vindo ao sistema de gerenciamento da clínica {nomeClinica}
        </p>
      </header>

      <main className="px-4 py-5 space-y-4">

        {/* CARD: Consultas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold">Consultas do dia</h2>
            {!modoEdicaoTabela ? (
              <button
                type="button"
                onClick={iniciarEdicaoEmMassa}
                className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-100 transition"
              >
                ✏️ Editar todas
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={salvarEdicaoEmMassa}
                  className="bg-blue-400 text-white px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-500 transition"
                >
                  Salvar tudo
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicaoEmMassa}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold text-sm hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {horarioFuncionamento && (
            <p className="text-xs text-gray-400 mt-1">
              Funcionamento: {horarioFuncionamento.inicio} às {horarioFuncionamento.fim}
            </p>
          )}

          {carregandoConsultas && (
            <p className="text-sm text-gray-500 mt-4">Carregando consultas...</p>
          )}

          {!carregandoConsultas && erroConsultas && (
            <p className="text-sm text-red-500 mt-4">{erroConsultas}</p>
          )}

          {!carregandoConsultas && !erroConsultas && consultasDoDia.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Não há consultas agendadas para hoje no horário de funcionamento.
            </p>
          )}

          {!carregandoConsultas && !erroConsultas && consultasDoDia.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Horário</th>
                    <th className="text-left px-3 py-2 font-semibold">Especialidade</th>
                    <th className="text-left px-3 py-2 font-semibold">Médico</th>
                  </tr>
                </thead>
                <tbody>
                  {(modoEdicaoTabela ? consultasEmEdicao : consultasDoDia).map((consulta, indice) => (
                    <tr key={consulta.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-semibold text-gray-700">
                        {modoEdicaoTabela ? (
                          <input
                            type="time"
                            value={consulta.horario}
                            onChange={(e) =>
                              alterarCampoConsulta(indice, "horario", e.target.value)
                            }
                            className="w-full border border-blue-200 rounded-lg px-2 py-1"
                          />
                        ) : (
                          consulta.horario
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
                            className="w-full border border-blue-200 rounded-lg px-2 py-1"
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
                              className="w-full border border-blue-200 rounded-lg px-2 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => deletarConsulta(indice)}
                              className="text-red-500 hover:text-red-600 text-xs font-semibold"
                            >
                              Deletar
                            </button>
                          </div>
                        ) : (
                          consulta.medico
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default HomeAdmin;