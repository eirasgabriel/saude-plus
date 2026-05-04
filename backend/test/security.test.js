const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { gerarHashSenha, verificarSenha } = require("../src/infrastructure/security/passwords");
const { gerarTokenSessao, verificarTokenSessao } = require("../src/infrastructure/security/tokens");
const validar = require("../src/infrastructure/security/validacao");
const { criarExame } = require("../src/domain/entities/exame");
const { criarSalvarClinica } = require("../src/application/clinicas/salvar-clinica");
const { criarSalvarUsuario } = require("../src/application/usuarios/salvar-usuario");
const { criarClinicaRepositoryMemory } = require("../src/infrastructure/repositories/memory/clinica-repository-memory");
const { criarUsuarioRepositoryMemory } = require("../src/infrastructure/repositories/memory/usuario-repository-memory");

function testeHashSenha() {
  const senha = "SenhaForte123!";
  const hash = gerarHashSenha(senha);

  assert.notEqual(hash, senha);
  assert.equal(verificarSenha(senha, hash), true);
  assert.equal(verificarSenha("senha-errada", hash), false);
}

function testeTokenSessao() {
  const usuario = {
    id: 10,
    nivel_acesso: "admin_clinica",
    clinica_id: 2,
  };
  const token = gerarTokenSessao(usuario, {
    jwtSecret: "segredo-local-de-teste-com-tamanho-suficiente",
    ttlSegundos: 60,
  });

  const payload = verificarTokenSessao(token, {
    jwtSecret: "segredo-local-de-teste-com-tamanho-suficiente",
  });

  assert.deepEqual(payload, usuario);
  assert.throws(
    () => verificarTokenSessao(token, { jwtSecret: "outro-segredo-local-de-teste" }),
    /Token invalido/
  );
}

async function testeTextosAcentuadosSaoPreservados() {
  const temporario = fs.mkdtempSync(path.join(os.tmpdir(), "saude-plus-acentos-"));
  const caminhoUsuarios = path.join(temporario, "usuarios.json");
  const caminhoClinicas = path.join(temporario, "clinicas.json");

  try {
    const nomeUsuario = "João Ávila";
    const endereco = "Rua das Câmeras";
    const bairro = "Itaúna";
    const cidade = "Saquarema";
    const nomeClinica = "Clínica São José";
    const enderecoClinica = "Estrada de Sampaio Corrêa";
    const tipoExame = "Ressonância Magnética";

    assert.equal(validar.texto(nomeUsuario, "Nome", { min: 2 }), nomeUsuario);

    const usuarioRepository = criarUsuarioRepositoryMemory([], {
      caminhoDados: caminhoUsuarios,
    });
    const salvarUsuario = criarSalvarUsuario({ usuarioRepository });
    const usuario = await salvarUsuario({
      nome: nomeUsuario,
      email: "joao.avila@example.com",
      senha: "SenhaForte123!",
      nivel_acesso: "paciente",
      endereco,
      bairro,
      cidade,
      estado: "RJ",
    });

    const usuarioRepositoryRecarregado = criarUsuarioRepositoryMemory([], {
      caminhoDados: caminhoUsuarios,
    });
    const usuarioPersistido = await usuarioRepositoryRecarregado.buscarPorId(usuario.id);

    assert.equal(usuario.nome, nomeUsuario);
    assert.equal(usuarioPersistido.nome, nomeUsuario);
    assert.equal(usuarioPersistido.endereco, endereco);
    assert.match(fs.readFileSync(caminhoUsuarios, "utf8"), /João Ávila/);

    const clinicaRepository = criarClinicaRepositoryMemory([], {
      caminhoDados: caminhoClinicas,
    });
    const salvarClinica = criarSalvarClinica({ clinicaRepository });
    const clinica = await salvarClinica({
      nome: nomeClinica,
      bairro,
      endereco: enderecoClinica,
      latitude: -22.92,
      longitude: -42.5,
      especialidades: ["Clínico geral"],
      especialidadesExames: [tipoExame],
    });
    const clinicaRecarregada = criarClinicaRepositoryMemory([], {
      caminhoDados: caminhoClinicas,
    });
    const clinicaPersistida = await clinicaRecarregada.buscarPorId(clinica.id);

    assert.equal(clinica.nome, nomeClinica);
    assert.equal(clinicaPersistida.endereco, enderecoClinica);
    assert.deepEqual(clinicaPersistida.especialidadesExames, [tipoExame]);
    assert.match(fs.readFileSync(caminhoClinicas, "utf8"), /Ressonância Magnética/);

    const exame = criarExame({
      paciente_id: usuario.id,
      clinica_id: clinica.id,
      paciente: nomeUsuario,
      clinica_nome: nomeClinica,
      tipo: tipoExame,
      observacoes: "Solicitação médica com acentuação preservada.",
    });

    assert.equal(exame.paciente, nomeUsuario);
    assert.equal(exame.tipo, tipoExame);
    assert.equal(exame.observacoes, "Solicitação médica com acentuação preservada.");
  } finally {
    fs.rmSync(temporario, { recursive: true, force: true });
  }
}

module.exports = {
  testeHashSenha,
  testeTokenSessao,
  testeTextosAcentuadosSaoPreservados,
};
