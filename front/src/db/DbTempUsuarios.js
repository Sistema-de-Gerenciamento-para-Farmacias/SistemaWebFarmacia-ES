// DbTempUsuarios.js
// Simulação de tabela USUARIO com dois usuários fictícios

const usuarios = [
  {
    id: 1,
    nome: "Administrador",
    EhAdmin: true,
    email: "admin@gmail.com",
    senha: "123",
    token: "token-admin-abc",
  },
  {
    id: 2,
    nome: "Funcionário Carlos",
    EhAdmin: false,
    email: "carlos@farmacia.com",
    senha: "func123",
    token: "token-func-xyz",
  },
];

export default usuarios;
