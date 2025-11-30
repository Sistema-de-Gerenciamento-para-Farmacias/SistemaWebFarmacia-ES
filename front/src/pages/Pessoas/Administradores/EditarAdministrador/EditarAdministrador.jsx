import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarAdministrador.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function EditarAdministrador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [administrador, setAdministrador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar administrador'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar administrador:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdministrador(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nome, cpf, email } = administrador;

    if (!nome?.trim()) {
      setMessage("ERRO: Nome é obrigatório");
      return false;
    }

    if (!cpf?.trim()) {
      setMessage("ERRO: CPF é obrigatório");
      return false;
    }

    if (!email?.trim()) {
      setMessage("ERRO: Email é obrigatório");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("ERRO: Email inválido");
      return false;
    }

    return true;
  };

  const salvarAdministrador = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      const dadosParaEnviar = {
        nome: administrador.nome.trim(),
        cpf: administrador.cpf.trim(),
        telefone: administrador.telefone?.trim() || "",
        email: administrador.email.trim(),
        senha: administrador.senha || "",
        tipoUsuario: "ADMIN"
      };

      const response = await fetch(`http://localhost:8080/pessoa/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (response.ok) {
        setMessage("SUCESSO: Administrador atualizado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listaAdministradores");
        }, 2000);
        
      } else {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignora erro de parse
        }
        
        setMessage(`ERRO: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error('Erro ao atualizar administrador:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando administrador...</p>
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
        <h2 className={styles.title}>Editar Administrador</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={administrador.nome || ''} 
            onChange={handleChange}
            placeholder="Ex: João Silva"
            required
          />

          <label className={styles.label}>CPF *</label>
          <input 
            className={styles.input} 
            name="cpf"
            value={administrador.cpf || ''} 
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
          />

          <label className={styles.label}>Email *</label>
          <input 
            className={styles.input} 
            name="email"
            type="email"
            value={administrador.email || ''} 
            onChange={handleChange}
            placeholder="exemplo@email.com"
            required
          />

          <label className={styles.label}>Telefone</label>
          <input 
            className={styles.input} 
            name="telefone"
            value={administrador.telefone || ''} 
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <label className={styles.label}>Senha</label>
          <input 
            className={styles.input} 
            name="senha"
            type="password"
            value={administrador.senha || ''} 
            onChange={handleChange}
            placeholder="Deixe em branco para manter a senha atual"
          />

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaAdministradores")}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              onClick={salvarAdministrador}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      {saving && <Loading />}

      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")}
          type={message.includes('SUCESSO') ? 'success' : 'error'}
        />
      )}
    </div>
  );
}

export default EditarAdministrador;