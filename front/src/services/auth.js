// auth.js
// Este arquivo simula funções de login (mock).
// Em vez de chamar uma API real, ele retorna tokens fictícios.
// DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO para chamar a API de login.

import clientes from "../db/DbTempClientes";
import usuarios from "../db/DbTempUsuarios";

export function loginAdm(email, senha) {
  // Simulação de login do administrador
  const usuario = usuarios.find(
    (u) => u.email === email && u.senha === senha && u.EhAdmin
  );
  if (usuario) {
    return { token: usuario.token, ...usuario };
  }
  return null;
}

export function loginCliente(email, senha) {
  // Simulação de login do cliente
  const cliente = clientes.find(
    (c) => c.email === email && c.senha === senha && c.existe
  );
  if (cliente) {
    return { token: cliente.token, ...cliente };
  }
  return null;
}
