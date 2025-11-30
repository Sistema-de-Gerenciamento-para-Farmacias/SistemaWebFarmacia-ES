import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarFuncionario.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function EditarFuncionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarFuncionario();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarFuncionario = async () => {
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
        const funcionarioData = await response.json();
        setFuncionario({
          ...funcionarioData,
          id: funcionarioData.idPessoa
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Funcionário não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar funcionário'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFuncionario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nome, cpf, email } = funcionario;

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

  const salvarFuncionario = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      const dadosParaEnviar = {
        nome: funcionario.nome.trim(),
        cpf: funcionario.cpf.trim(),
        telefone: funcionario.telefone?.trim() || "",
        email: funcionario.email.trim(),
        senha: funcionario.senha || "",
        tipoUsuario: "EMPLOY"
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
        setMessage("SUCESSO: Funcionário atualizado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listaFuncionarios");
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
      console.error('Erro ao atualizar funcionário:', error);
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
          <p>Carregando funcionário...</p>
        </div>
      </div>
    );
  }

  if (!funcionario) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Funcionário não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaFuncionarios")}
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
        <h2 className={styles.title}>Editar Funcionário</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={funcionario.nome || ''} 
            onChange={handleChange}
            placeholder="Ex: João Silva"
            required
          />

          <label className={styles.label}>CPF *</label>
          <input 
            className={styles.input} 
            name="cpf"
            value={funcionario.cpf || ''} 
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
          />

          <label className={styles.label}>Email *</label>
          <input 
            className={styles.input} 
            name="email"
            type="email"
            value={funcionario.email || ''} 
            onChange={handleChange}
            placeholder="exemplo@email.com"
            required
          />

          <label className={styles.label}>Telefone</label>
          <input 
            className={styles.input} 
            name="telefone"
            value={funcionario.telefone || ''} 
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <label className={styles.label}>Senha</label>
          <input 
            className={styles.input} 
            name="senha"
            type="password"
            value={funcionario.senha || ''} 
            onChange={handleChange}
            placeholder="Deixe em branco para manter a senha atual"
          />

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaFuncionarios")}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              onClick={salvarFuncionario}
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

export default EditarFuncionario;