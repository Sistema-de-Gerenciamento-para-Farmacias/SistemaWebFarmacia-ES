// front/src/pages/Pessoas/Funcionarios/EditarFuncionario/EditarFuncionario.jsx

import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarFuncionario.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para edição de funcionários existentes
 * @component
 * @returns {JSX.Element} Formulário de edição de funcionário
 */
function EditarFuncionario() {
  // Obtém ID do funcionário da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto
  const { logout, token } = useContext(AuthContext);

  // Estado para dados do funcionário
  const [funcionario, setFuncionario] = useState(null);
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar salvamento de alterações
  const [saving, setSaving] = useState(false);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar dados do funcionário quando componente é montado
   */
  useEffect(() => {
    if (token && id) {
      carregarFuncionario();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega dados do funcionário do backend
   * @async
   */
  const carregarFuncionario = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter dados do funcionário
      const response = await fetch(`${API_URL}/pessoa/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const funcionarioData = await response.json();
        
        // Normaliza dados para uso interno
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

  /**
   * Atualiza estado do funcionário quando campos são alterados
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFuncionario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Valida todos os campos do formulário antes do envio
   * @returns {boolean} true se todos os campos são válidos
   */
  const validarFormulario = () => {
    const { nome, cpf, email } = funcionario;

    // Validações de campos obrigatórios
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

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("ERRO: Email inválido");
      return false;
    }

    return true;
  };

  /**
   * Salva alterações do funcionário no backend
   * @async
   */
  const salvarFuncionario = async () => {
    // Valida formulário antes de enviar
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      // Prepara dados para envio ao backend
      const dadosParaEnviar = {
        nome: funcionario.nome.trim(),
        cpf: funcionario.cpf.trim(),
        telefone: funcionario.telefone?.trim() || "",
        email: funcionario.email.trim(),
        senha: funcionario.senha || "", // Senha vazia mantém a atual
        tipoUsuario: "EMPLOY" // Tipo fixo para funcionário
      };

      // Requisição PUT para atualizar funcionário
      const response = await fetch(`${API_URL}/pessoa/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      // Processa resposta do backend
      if (response.ok) {
        setMessage("SUCESSO: Funcionário atualizado com sucesso! Redirecionando...");
        
        // Redireciona para lista após 2 segundos
        setTimeout(() => {
          navigate("/listaFuncionarios");
        }, 2000);
        
      } else {
        // Tenta obter mensagem de erro específica
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Ignora erro de parse JSON
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

  /**
   * Renderiza estado de carregamento
   */
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

  /**
   * Renderiza estado de funcionário não encontrado
   */
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

  /**
   * Renderiza formulário de edição
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />
      
      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Editar Funcionário</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      {/* Container principal do formulário */}
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Campo: Nome */}
          <label className={styles.label}>Nome *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={funcionario.nome || ''} 
            onChange={handleChange}
            placeholder="Ex: João Silva"
            required
          />

          {/* Campo: CPF */}
          <label className={styles.label}>CPF *</label>
          <input 
            className={styles.input} 
            name="cpf"
            value={funcionario.cpf || ''} 
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
          />

          {/* Campo: Email */}
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

          {/* Campo: Telefone (opcional) */}
          <label className={styles.label}>Telefone</label>
          <input 
            className={styles.input} 
            name="telefone"
            value={funcionario.telefone || ''} 
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          {/* Campo: Senha (opcional - manter atual) */}
          <label className={styles.label}>Senha</label>
          <input 
            className={styles.input} 
            name="senha"
            type="password"
            value={funcionario.senha || ''} 
            onChange={handleChange}
            placeholder="Deixe em branco para manter a senha atual"
          />

          {/* Botões de ação do formulário */}
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

      {/* Componente de loading durante salvamento */}
      {saving && <Loading />}

      {/* Componente de mensagem para feedback */}
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