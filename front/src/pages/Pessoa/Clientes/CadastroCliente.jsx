// CadastroCliente.jsx
// Tela de cadastro com campos: nome, email, senha, cpf, telefone

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/cadastrar.module.css";
import BotaoRetorno from "../../../components/BotaoRetorno/BotaoRetorno";
import MessageBox from "../../../components/MessageBox/MessageBox";
// (Sem Loading no cadastro, conforme pedido)

function CadastroCliente() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isInvalid = () => {
    // Validar campos vazios
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
      setMessage("ERRO: você deve preencher todos os campos");
      return true;
    }
    // Validações simples
    const cpfOK = /^\d{11}$/.test(formData.cpf);
    const telOK = /^\d{11}$/.test(formData.telefone);
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    if (!cpfOK || !telOK || !emailOK) {
      setMessage("ERRO: os campos estão com algum valor inválido");
      return true;
    }
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInvalid()) return;

    // Simulação de persistência em mock
    // DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO (POST para API)
    console.log("Dados cadastrados (mock):", formData);

    setMessage("Cliente cadastrado com sucesso!");
    // Após fechar a mensagem, pode navegar para login
    // (deixe a navegação a cargo do usuário, ou navegue após um pequeno delay)
    setTimeout(() => navigate("/login-cliente"), 1200);
  };

  return (
    <div className={styles.container}>
      <BotaoRetorno />
      <div className={styles.card}>
        <h2 className={styles.title}>Cadastro</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="text"
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleChange}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Cadastrar</button>
        </form>
      </div>

      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default CadastroCliente;
