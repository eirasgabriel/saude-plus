const http = require("http");
const { enviarJson, enviarSemConteudo, lerJson, tratarErro } = require("./http-utils");

function normalizarPath(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

function criarServidorHttp(useCases) {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        enviarSemConteudo(res);
        return;
      }

      const url = new URL(req.url, "http://localhost");
      const pathname = normalizarPath(url.pathname);

      if (req.method === "GET" && pathname === "/health") {
        enviarJson(res, 200, { status: "ok", service: "saude-plus-backend" });
        return;
      }

      if (req.method === "POST" && pathname === "/api/auth/login") {
        const body = await lerJson(req);
        const resultado = await useCases.autenticarUsuario(body);
        enviarJson(res, 200, resultado);
        return;
      }

      if (req.method === "GET" && pathname === "/api/clinicas") {
        const clinicas = await useCases.listarClinicas();
        enviarJson(res, 200, clinicas);
        return;
      }

      if (req.method === "POST" && pathname === "/api/clinicas") {
        const body = await lerJson(req);
        const clinica = await useCases.salvarClinica(body);
        enviarJson(res, 201, clinica);
        return;
      }

      const clinicaMatch = /^\/api\/clinicas\/([^/]+)$/.exec(pathname);
      if (req.method === "GET" && clinicaMatch) {
        const clinica = await useCases.obterClinica(clinicaMatch[1]);
        enviarJson(res, 200, clinica);
        return;
      }

      if (req.method === "PUT" && clinicaMatch) {
        const body = await lerJson(req);
        const clinica = await useCases.salvarClinica({ ...body, id: clinicaMatch[1] });
        enviarJson(res, 200, clinica);
        return;
      }

      if (req.method === "GET" && pathname === "/api/usuarios") {
        const usuarios = await useCases.listarUsuarios();
        enviarJson(res, 200, usuarios);
        return;
      }

      if (req.method === "POST" && pathname === "/api/usuarios") {
        const body = await lerJson(req);
        const usuario = await useCases.salvarUsuario(body);
        enviarJson(res, 201, usuario);
        return;
      }

      if (req.method === "POST" && pathname === "/api/notificacoes/subscriptions") {
        const body = await lerJson(req);
        const resultado = await useCases.salvarPushSubscription(body);
        enviarJson(res, 201, resultado);
        return;
      }

      const usuarioMatch = /^\/api\/usuarios\/([^/]+)$/.exec(pathname);
      if (req.method === "PUT" && usuarioMatch) {
        const body = await lerJson(req);
        const usuario = await useCases.salvarUsuario({ ...body, id: usuarioMatch[1] });
        enviarJson(res, 200, usuario);
        return;
      }

      if (req.method === "GET" && pathname === "/api/relatorios/sistema") {
        const relatorios = await useCases.obterRelatoriosSistema();
        enviarJson(res, 200, relatorios);
        return;
      }

      if (req.method === "GET" && pathname === "/api/agendas") {
        const horarios = await useCases.listarHorariosAgenda({
          clinicaId: url.searchParams.get("clinica"),
          data: url.searchParams.get("data"),
          medicoId: url.searchParams.get("medico"),
          especialidade: url.searchParams.get("especialidade") || "",
        });
        enviarJson(res, 200, horarios);
        return;
      }

      const verificarAgendaMatch = /^\/api\/agendas\/([^/]+)\/verificar$/.exec(pathname);
      if (req.method === "GET" && verificarAgendaMatch) {
        const resultado = await useCases.verificarDisponibilidade({
          agendaId: decodeURIComponent(verificarAgendaMatch[1]),
          medicoId: url.searchParams.get("medico"),
          especialidade: url.searchParams.get("especialidade") || "",
        });
        enviarJson(res, 200, resultado);
        return;
      }

      if (req.method === "POST" && pathname === "/api/consultas") {
        const body = await lerJson(req);
        const resultado = await useCases.criarConsulta(body);
        enviarJson(res, 201, resultado);
        return;
      }

      if (req.method === "GET" && pathname === "/api/consultas") {
        const clinicaId = url.searchParams.get("clinica");
        const pacienteId = url.searchParams.get("paciente");
        const consultas = clinicaId
          ? await useCases.listarConsultasClinica(clinicaId)
          : await useCases.listarConsultasPaciente(pacienteId);
        enviarJson(res, 200, consultas);
        return;
      }

      const cancelarConsultaMatch = /^\/api\/consultas\/([^/]+)\/cancelar$/.exec(pathname);
      if (req.method === "PATCH" && cancelarConsultaMatch) {
        const body = await lerJson(req);
        const resultado = await useCases.cancelarConsulta({
          consultaId: cancelarConsultaMatch[1],
          motivo: body.motivo,
        });
        enviarJson(res, 200, resultado);
        return;
      }

      enviarJson(res, 404, { mensagem: "Rota nao encontrada.", codigo: "ROTA_NAO_ENCONTRADA" });
    } catch (erro) {
      tratarErro(res, erro);
    }
  });
}

module.exports = { criarServidorHttp };
