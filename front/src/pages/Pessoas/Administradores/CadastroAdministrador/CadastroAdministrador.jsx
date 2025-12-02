// front/src/pages/Pessoas/Administradores/CadastroAdministrador/CadastroAdministrador.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastroAdministrador.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para cadastro de novos administradores
 * @component
 * @returns {JSX.Element} Formulário de cadastro de administrador
 */
function CadastroAdministrador() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto de autenticação
  const { logout, token } = useContext(AuthContext);

  // Estado para dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
  });
  
  // Estado para controlar carregamento durante envio
  const [loading, setLoading] = useState(false);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState(null);

  /**
   * Atualiza estado do formulário quando campos são alterados
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Valida todos os campos do formulário antes do envio
   * @returns {boolean} true se todos os campos são válidos
   */
  const validarCampos = () => {
    // Verifica campos obrigatórios
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
      setMessage("ERRO: você deve preencher todos os campos");
      return false;
    }

    // Remove caracteres não numéricos para validação
    const cpfNumerico = formData.cpf.replace(/\D/g, '');
    const telefoneNumerico = formData.telefone.replace(/\D/g, '');

    // Expressões regulares para validação
    const cpfOK = /^\d{11}$/.test(cpfNumerico);
    const telOK = /^\d{10,11}$/.test(telefoneNumerico);
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const senhaOK = formData.senha.length >= 3;

    // Validações individuais com mensagens específicas
    if (!cpfOK) {
      setMessage("ERRO: CPF deve ter 11 dígitos");
      return false;
    }
    if (!telOK) {
      setMessage("ERRO: Telefone deve ter 10 ou 11 dígitos");
      return false;
    }
    if (!emailOK) {
      setMessage("ERRO: Email inválido");
      return false;
    }
    if (!senhaOK) {
      setMessage("ERRO: Senha deve ter pelo menos 3 caracteres");
      return false;
    }

    return true;
  };

  /**
   * Manipula o envio do formulário de cadastro
   * @async
   * @param {Event} e - Evento de submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valida campos antes de prosseguir
    if (!validarCampos()) return;

    // Inicia estado de carregamento
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepara dados para envio ao backend
      const dadosParaEnviar = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        tipoUsuario: "ADMIN" // Tipo fixo para administrador
      };

      console.log("Enviando dados para cadastro de administrador:", dadosParaEnviar);

      // Requisição POST para criar novo administrador
      const response = await fetch(`${API_URL}/pessoa/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Token de admin necessário
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      // Processa resposta do backend
      if (response.ok) {
        const data = await response.json();
        
        // Sucesso: mostra mensagem e redireciona
        setMessage("SUCESSO: Administrador cadastrado com sucesso! Redirecionando...");
        
        // Redireciona para lista após 2 segundos
        setTimeout(() => {
          navigate("/listaAdministradores");
        }, 2000);
        
      } else {
        // Erro: tenta obter mensagem específica do backend
        const errorData = await response.json();
        
        let backendErrorMessage = "Falha no cadastro";
        
        // Extrai mensagem de erro de diferentes formatos de resposta
        if (errorData.message) {
          backendErrorMessage = errorData.message;
        } else if (Array.isArray(errorData) && errorData.length > 0) {
          backendErrorMessage = errorData[0].message || errorData[0].defaultMessage;
        } else if (errorData.error) {
          backendErrorMessage = errorData.error_description || errorData.error;
        }
        
        setMessage(`ERRO: ${backendErrorMessage}`);
      }
      
    } catch (error) {
      console.error("Erro completo:", error);
      
      let errorMessage = "Erro desconhecido";
      
      // Trata diferentes tipos de erro
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`❌ ERRO: ${errorMessage}`);
      
    } finally {
      // Finaliza estado de carregamento independente do resultado
      setLoading(false);
    }
  };

  /**
   * Formata CPF para exibição: 12345678901 -> 123.456.789-01
   * @param {string} value - CPF sem formatação
   * @returns {string} CPF formatado
   */
  const formatarCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  /**
   * Formata telefone para exibição: 11999998888 -> (11) 99999-8888
   * @param {string} value - Telefone sem formatação
   * @returns {string} Telefone formatado
   */
  const formatarTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  /**
   * Manipula mudança no campo CPF com formatação automática
   * @param {Event} e - Evento de mudança do input
   */
  const handleCpfChange = (e) => {
    const formatted = formatarCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  /**
   * Manipula mudança no campo telefone com formatação automática
   * @param {Event} e - Evento de mudança do input
   */
  const handleTelefoneChange = (e) => {
    const formatted = formatarTelefone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  /**
   * Renderiza o formulário de cadastro de administrador
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Cadastro de Administrador</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Container principal do formulário */}
      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Campo: Nome Completo */}
          <label className={styles.label}>Nome Completo *</label>
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            className={styles.input}
            required
          />

          {/* Campo: Email */}
          <label className={styles.label}>Email *</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          {/* Campo: Senha */}
          <label className={styles.label}>Senha *</label>
          <input
            type="password"
            name="senha"
            placeholder="Senha (mínimo 3 caracteres)"
            value={formData.senha}
            onChange={handleChange}
            className={styles.input}
            minLength="3"
            required
          />

          {/* Campo: CPF com formatação automática */}
          <label className={styles.label}>CPF *</label>
          <input
            type="text"
            name="cpf"
            placeholder="CPF (apenas números)"
            value={formData.cpf}
            onChange={handleCpfChange}
            className={styles.input}
            maxLength="14"
            required
          />

          {/* Campo: Telefone com formatação automática */}
          <label className={styles.label}>Telefone *</label>
          <input
            type="text"
            name="telefone"
            placeholder="Telefone (apenas números)"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            className={styles.input}
            maxLength="15"
            required
          />

          {/* Botões de ação do formulário */}
          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaAdministradores")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Administrador"}
            </button>
          </div>
        </form>
      </div>

      {/* Componente de loading durante envio */}
      {loading && <Loading />}
      
      {/* Componente de mensagem para feedback */}
      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default CadastroAdministrador;