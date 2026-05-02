/* eslint-env jest */
import {
  CHAVE_TOKEN,
  CHAVE_USUARIO,
  existeUsuarioSessao,
  obterTokenSessao,
  obterUsuarioSessao,
  removerUsuarioSessao,
  salvarUsuarioSessao,
} from "./sessao-usuario";

beforeEach(() => {
  localStorage.clear();
});

test("salva e remove usuario e token da sessao", () => {
  salvarUsuarioSessao({ id: 1, nome: "Paciente" }, "token-local");

  expect(existeUsuarioSessao()).toBe(true);
  expect(obterUsuarioSessao()).toEqual({ id: 1, nome: "Paciente" });
  expect(obterTokenSessao()).toBe("token-local");

  removerUsuarioSessao();

  expect(existeUsuarioSessao()).toBe(false);
  expect(obterTokenSessao()).toBe("");
});

test("limpa sessao corrompida em vez de quebrar a aplicacao", () => {
  localStorage.setItem(CHAVE_USUARIO, "{json-invalido");
  localStorage.setItem(CHAVE_TOKEN, "token-local");

  expect(obterUsuarioSessao()).toBeNull();
  expect(localStorage.getItem(CHAVE_USUARIO)).toBeNull();
  expect(localStorage.getItem(CHAVE_TOKEN)).toBeNull();
});
