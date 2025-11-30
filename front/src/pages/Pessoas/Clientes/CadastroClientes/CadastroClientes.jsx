// front/src/pages/Pessoas/Clientes/CadastroClientes.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastroClientes.module.css";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

/**
 * Componente de Cadastro de Clientes - Registra novos usuários no sistema
 * Valida dados localmente e envia para o backend com tratamento completo de erros
 */
function CadastroClientes() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  /**
   * Atualiza estado do formulário conforme digitação
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Valida todos os campos do formulário localmente
   * @returns {boolean} True se todos os campos são válidos
   */
  const validarCampos = () => {
    // Valida campos obrigatórios
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
      setMessage("ERRO: você deve preencher todos os campos");
      return false;
    }

    // Remove formatação para validação numérica
    const cpfNumerico = formData.cpf.replace(/\D/g, '');
    const telefoneNumerico = formData.telefone.replace(/\D/g, '');

    // Validações específicas
    const cpfOK = /^\d{11}$/.test(cpfNumerico);
    const telOK = /^\d{10,11}$/.test(telefoneNumerico);
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const senhaOK = formData.senha.length >= 3;

    // Mensagens específicas para cada erro de validação
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
   * Processa o cadastro do cliente
   * Envia dados para o backend e trata a resposta
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação local antes de enviar para o backend
    if (!validarCampos()) return;

    setLoading(true);
    setMessage(null);
    
    try {
      // Prepara dados para o backend (remove formatação e define tipo de usuário)
      const dadosParaEnviar = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        tipoUsuario: "USER" // Sempre USER para cadastro de cliente
      };

      console.log("📤 Enviando dados para cadastro:", dadosParaEnviar);

      // Requisição para o endpoint de registro
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      // Processa resposta do backend
      if (response.ok) {
        const data = await response.json();
        
        // ✅ SUCESSO: Cadastro realizado
        setMessage("✅ SUCESSO: Cliente cadastrado com sucesso! Redirecionando para login...");
        
        // Redireciona para login após sucesso
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        
      } else {
        // ❌ ERRO: Backend retornou erro
        const errorData = await response.json();
        
        // Extrai mensagem de erro do backend
        let backendErrorMessage = "Falha no cadastro";
        
        if (errorData.message) {
          // Erro único (RestErrorMessage)
          backendErrorMessage = errorData.message;
        } else if (Array.isArray(errorData) && errorData.length > 0) {
          // Múltiplos erros de validação
          backendErrorMessage = errorData[0].message || errorData[0].defaultMessage;
        } else if (errorData.error) {
          // Erro do Spring Security
          backendErrorMessage = errorData.error_description || errorData.error;
        }
        
        setMessage(`❌ ERRO: ${backendErrorMessage}`);
      }
      
    } catch (error) {
      // ❌ ERRO: Falha na comunicação com o servidor
      console.error("Erro completo:", error);
      
      let errorMessage = "Erro desconhecido";
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`❌ ERRO: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata CPF durante a digitação (XXX.XXX.XXX-XX)
   */
  const formatarCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  /**
   * Formata telefone durante a digitação ((XX) XXXXX-XXXX)
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
   * Handlers específicos para campos formatados
   */
  const handleCpfChange = (e) => {
    const formatted = formatarCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleTelefoneChange = (e) => {
    const formatted = formatarTelefone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
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
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
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
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className={styles.textoLogin}>
          Já tem uma conta?{" "}
          <span 
            className={styles.linkLogin} 
            onClick={() => navigate("/login")}
          >
            Fazer Login
          </span>
        </p>
      </div>

      {/* Componentes de feedback visual */}
      {loading && <Loading />}
      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default CadastroClientes;