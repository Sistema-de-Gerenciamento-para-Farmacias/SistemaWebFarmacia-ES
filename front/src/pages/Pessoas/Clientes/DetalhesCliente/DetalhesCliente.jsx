import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesCliente.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarCliente();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarCliente = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8080/pessoa/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const clienteData = await response.json();
        // CORREÇÃO: Adicionar campo id baseado no idPessoa
        setCliente({
          ...clienteData,
          id: clienteData.idPessoa  // ← CORREÇÃO AQUI
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

  const formatCpf = (cpf) => {
    if (!cpf) return 'Não informado';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

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

  const formatarTipoUsuario = (tipo) => {
    const tipos = {
      'USER': 'Cliente',
      'EMPLOY': 'Funcionário',
      'ADMIN': 'Administrador'
    };
    return tipos[tipo] || tipo;
  };

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

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Cliente</h2>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{cliente.nome}</span>
          </div>
          
          <div className={styles.box}>
            <strong>CPF:</strong> 
            <span className={styles.boxValue}>{formatCpf(cliente.cpf)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Email:</strong> 
            <span className={styles.boxValue}>{cliente.email}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Telefone:</strong> 
            <span className={styles.boxValue}>{formatarTelefone(cliente.telefone)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Tipo de Usuário:</strong> 
            <span className={styles.boxValue}>{formatarTipoUsuario(cliente.tipoUsuario)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{cliente.dataExclusao ? 'Excluído' : 'Ativo'}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaClientes")}>
          Voltar para Lista
        </button>
        
        {!cliente.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarCliente/${cliente.id}`)} // ← CORRIGIDO: usar cliente.id
          >
            Editar Cliente
          </button>
        )}
      </div>

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