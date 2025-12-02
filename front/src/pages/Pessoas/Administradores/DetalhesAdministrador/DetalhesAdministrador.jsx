// front/src/pages/Pessoas/Administradores/DetalhesAdministrador/DetalhesAdministrador.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesAdministrador.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para visualização detalhada de um administrador
 * @component
 * @returns {JSX.Element} Página de detalhes do administrador
 */
function DetalhesAdministrador() {
  // Obtém ID do administrador da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);

  // Estado para dados do administrador
  const [administrador, setAdministrador] = useState(null);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar dados do administrador quando componente é montado
   * Executa sempre que token ou ID mudam
   */
  useEffect(() => {
    if (token && id) {
      carregarAdministrador();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega dados do administrador do backend
   * @async
   */
  const carregarAdministrador = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter detalhes do administrador
      const response = await fetch(`${API_URL}/pessoa/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const administradorData = await response.json();
        
        // Normaliza dados para uso interno (padroniza nome do campo ID)
        setAdministrador({
          ...administradorData,
          id: administradorData.idPessoa
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Administrador não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes do administrador'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do administrador:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata CPF para exibição: 12345678901 -> 123.456.789-01
   * @param {string} cpf - CPF sem formatação
   * @returns {string} CPF formatado ou mensagem padrão
   */
  const formatCpf = (cpf) => {
    if (!cpf) return 'Não informado';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  /**
   * Formata telefone para exibição: 11999998888 -> (11) 99999-8888
   * @param {string} telefone - Telefone sem formatação
   * @returns {string} Telefone formatado ou mensagem padrão
   */
  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    const tel = telefone.replace(/\D/g, "");
    if (tel.length === 11) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    } else if (tel.length === 10) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
    }
    return telefone;
  };

  /**
   * Traduz código do tipo de usuário para nome amigável
   * @param {string} tipo - Código do tipo de usuário (USER, EMPLOY, ADMIN)
   * @returns {string} Nome amigável do tipo
   */
  const formatarTipoUsuario = (tipo) => {
    const tipos = {
      'USER': 'Cliente',
      'EMPLOY': 'Funcionário',
      'ADMIN': 'Administrador'
    };
    return tipos[tipo] || tipo;
  };

  /**
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes do administrador...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de administrador não encontrado
   */
  if (!administrador) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Administrador não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaAdministradores")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza página de detalhes do administrador
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Administrador</h2>
        </div>
      </div>

      {/* Card com informações do administrador */}
      <div className={styles.card}>
        <div className={styles.info}>
          {/* Campo: Nome */}
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{administrador.nome}</span>
          </div>
          
          {/* Campo: CPF */}
          <div className={styles.box}>
            <strong>CPF:</strong> 
            <span className={styles.boxValue}>{formatCpf(administrador.cpf)}</span>
          </div>
          
          {/* Campo: Email */}
          <div className={styles.box}>
            <strong>Email:</strong> 
            <span className={styles.boxValue}>{administrador.email}</span>
          </div>
          
          {/* Campo: Telefone */}
          <div className={styles.box}>
            <strong>Telefone:</strong> 
            <span className={styles.boxValue}>{formatarTelefone(administrador.telefone)}</span>
          </div>
          
          {/* Campo: Tipo de Usuário */}
          <div className={styles.box}>
            <strong>Tipo de Usuário:</strong> 
            <span className={styles.boxValue}>{formatarTipoUsuario(administrador.tipoUsuario)}</span>
          </div>
          
          {/* Campo: Status (Ativo/Inativo) */}
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{administrador.dataExclusao ? 'Inativo' : 'Ativo'}</span>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className={styles.actions}>
        {/* Botão para voltar à lista */}
        <button className={styles.backButton} onClick={() => navigate("/listaAdministradores")}>
          Voltar para Lista
        </button>
        
        {/* Botão para editar (apenas se administrador estiver ativo) */}
        {!administrador.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarAdministrador/${administrador.id}`)}
          >
            Editar Administrador
          </button>
        )}
      </div>

      {/* Componente de mensagem para feedback */}
      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")}
          type="error"
        />
      )}
    </div>
  );
}

export default DetalhesAdministrador;