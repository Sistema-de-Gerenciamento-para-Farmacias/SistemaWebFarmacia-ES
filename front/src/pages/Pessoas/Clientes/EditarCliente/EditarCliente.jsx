import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarCliente.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar cliente'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nome, cpf, email } = cliente;

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

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("ERRO: Email inválido");
      return false;
    }

    return true;
  };

  const salvarCliente = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      const dadosParaEnviar = {
        nome: cliente.nome.trim(),
        cpf: cliente.cpf.trim(),
        telefone: cliente.telefone?.trim() || "",
        email: cliente.email.trim(),
        senha: cliente.senha || "", // Mantém a senha atual se não for alterada
        tipoUsuario: cliente.tipoUsuario || "USER"
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
        setMessage("SUCESSO: Cliente atualizado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listaClientes");
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
      console.error('Erro ao atualizar cliente:', error);
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
          <p>Carregando cliente...</p>
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
        <h2 className={styles.title}>Editar Cliente</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={cliente.nome || ''} 
            onChange={handleChange}
            placeholder="Ex: João Silva"
            required
          />

          <label className={styles.label}>CPF *</label>
          <input 
            className={styles.input} 
            name="cpf"
            value={cliente.cpf || ''} 
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
          />

          <label className={styles.label}>Email *</label>
          <input 
            className={styles.input} 
            name="email"
            type="email"
            value={cliente.email || ''} 
            onChange={handleChange}
            placeholder="exemplo@email.com"
            required
          />

          <label className={styles.label}>Telefone</label>
          <input 
            className={styles.input} 
            name="telefone"
            value={cliente.telefone || ''} 
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaClientes")}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              onClick={salvarCliente}
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

export default EditarCliente;