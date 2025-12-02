// front/src/pages/Login/Login.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Login.module.css";
import BotaoRetorno from "../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../components/Loading/Loading";
import MessageBox from "../../components/MessageBox/MessageBox";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente de página de login
 * @component
 * @returns {JSX.Element} Formulário de autenticação de usuários
 * @description Permite que usuários existentes façam login no sistema
 */
function Login() {
  // Estado para email do usuário
  const [email, setEmail] = useState("");
  
  // Estado para senha do usuário
  const [senha, setSenha] = useState("");
  
  // Estado para controlar carregamento durante login
  const [loading, setLoading] = useState(false);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState(null);
  
  // Obtém função de login do contexto de autenticação
  const { login: authLogin } = useContext(AuthContext);
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();

  /**
   * Manipula o envio do formulário de login
   * @async
   * @param {Event} e - Evento de submit do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valida se ambos os campos estão preenchidos
    if (!email || !senha) {
      setMessage("ERRO: você deve preencher todos os campos");
      return;
    }

    // Inicia estado de carregamento
    setLoading(true);
    setMessage(null);
    
    try {
      // Chama serviço de autenticação para realizar login
      const userData = await authService.login(email, senha);
      
      // Atualiza contexto de autenticação com dados do usuário
      authLogin(userData);
      
      // Determina tipo de usuário para redirecionamento
      const userType = userData.user?.tipoUsuario || 'USER';
      
      // Redireciona após pequeno delay para melhor UX
      setTimeout(() => {
        // ADMIN ou EMPLOY: redireciona para dashboard administrativo
        // USER: redireciona para home do cliente
        if (userType === 'ADMIN' || userType === 'EMPLOY') {
          navigate("/homeAdmin");
        } else {
          navigate("/homeCliente");
        }
        setLoading(false);
      }, 800);

    } catch (error) {
      // Exibe mensagem de erro em caso de falha
      setMessage(`ERRO: ${error.message}`);
      setLoading(false);
    }
  };

  /**
   * Renderiza o formulário de login
   * Inclui campos para email e senha, botão de submit e link para cadastro
   */
  return (
    <div className={styles.container}>
      {/* Botão para voltar à página anterior */}
      <BotaoRetorno />
      
      {/* Card principal do formulário */}
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        
        {/* Formulário de login */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Campo de email */}
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={styles.input}
            required
          />
          
          {/* Campo de senha */}
          <input 
            name="senha" 
            type="password" 
            placeholder="Senha" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            className={styles.input}
            required
          />
          
          {/* Botão de submit do formulário */}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        {/* Link para página de cadastro */}
        <p className={styles.textoCadastro}>
          Não tem uma conta?{" "}
          <span 
              className={styles.linkCadastro} 
              onClick={() => navigate("/cadastro-cliente")}
          >
              Cadastre-se
          </span>
        </p>
      </div>
      
      {/* Componente de loading durante autenticação */}
      {loading && <Loading />}
      
      {/* Componente de mensagem para feedback */}
      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default Login;