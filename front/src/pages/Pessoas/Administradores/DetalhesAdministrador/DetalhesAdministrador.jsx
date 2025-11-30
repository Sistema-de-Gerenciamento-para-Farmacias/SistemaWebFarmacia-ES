// front/src/pages/Pessoas/Administradores/DetalhesAdministrador/DetalhesAdministrador.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesAdministrador.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function DetalhesAdministrador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [administrador, setAdministrador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarAdministrador();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarAdministrador = async () => {
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
        const administradorData = await response.json();
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
          <p>Carregando detalhes do administrador...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Administrador</h2>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{administrador.nome}</span>
          </div>
          
          <div className={styles.box}>
            <strong>CPF:</strong> 
            <span className={styles.boxValue}>{formatCpf(administrador.cpf)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Email:</strong> 
            <span className={styles.boxValue}>{administrador.email}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Telefone:</strong> 
            <span className={styles.boxValue}>{formatarTelefone(administrador.telefone)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Tipo de Usuário:</strong> 
            <span className={styles.boxValue}>{formatarTipoUsuario(administrador.tipoUsuario)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{administrador.dataExclusao ? 'Inativo' : 'Ativo'}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaAdministradores")}>
          Voltar para Lista
        </button>
        
        {!administrador.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarAdministrador/${administrador.id}`)}
          >
            Editar Administrador
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

export default DetalhesAdministrador;