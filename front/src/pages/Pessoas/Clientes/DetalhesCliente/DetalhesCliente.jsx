// front/src/pages/Pessoas/Clientes/DetalhesCliente/DetalhesCliente.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesCliente.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para visualização detalhada de um cliente
 * @component
 * @returns {JSX.Element} Página de detalhes do cliente
 */
function DetalhesCliente() {
  // Obtém ID do cliente da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);

  // Estado para dados do cliente
  const [cliente, setCliente] = useState(null);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar dados do cliente quando componente é montado
   * Executa sempre que token ou ID mudam
   */
  useEffect(() => {
    if (token && id) {
      carregarCliente();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega dados do cliente do backend
   * @async
   */
  const carregarCliente = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter detalhes do cliente
      const response = await fetch(`${API_URL}/pessoa/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const clienteData = await response.json();
        
        // CORREÇÃO: Normaliza dados para uso interno (padroniza nome do campo ID)
        setCliente({
          ...clienteData,
          id: clienteData.idPessoa  // ← CORREÇÃO: usa idPessoa do backend como id local
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Cliente não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes do cliente'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
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
          <p>Carregando detalhes do cliente...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de cliente não encontrado
   */
  if (!cliente) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Cliente não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaClientes")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza página de detalhes do cliente
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Cliente</h2>
        </div>
      </div>

      {/* Card com informações do cliente */}
      <div className={styles.card}>
        <div className={styles.info}>
          {/* Campo: Nome */}
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{cliente.nome}</span>
          </div>
          
          {/* Campo: CPF */}
          <div className={styles.box}>
            <strong>CPF:</strong> 
            <span className={styles.boxValue}>{formatCpf(cliente.cpf)}</span>
          </div>
          
          {/* Campo: Email */}
          <div className={styles.box}>
            <strong>Email:</strong> 
            <span className={styles.boxValue}>{cliente.email}</span>
          </div>
          
          {/* Campo: Telefone */}
          <div className={styles.box}>
            <strong>Telefone:</strong> 
            <span className={styles.boxValue}>{formatarTelefone(cliente.telefone)}</span>
          </div>
          
          {/* Campo: Tipo de Usuário */}
          <div className={styles.box}>
            <strong>Tipo de Usuário:</strong> 
            <span className={styles.boxValue}>{formatarTipoUsuario(cliente.tipoUsuario)}</span>
          </div>
          
          {/* Campo: Status (Ativo/Excluído) */}
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{cliente.dataExclusao ? 'Excluído' : 'Ativo'}</span>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className={styles.actions}>
        {/* Botão para voltar à lista */}
        <button className={styles.backButton} onClick={() => navigate("/listaClientes")}>
          Voltar para Lista
        </button>
        
        {/* Botão para editar (apenas se cliente estiver ativo) */}
        {!cliente.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarCliente/${cliente.id}`)} // ← CORRIGIDO: usar cliente.id normalizado
          >
            Editar Cliente
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

export default DetalhesCliente;