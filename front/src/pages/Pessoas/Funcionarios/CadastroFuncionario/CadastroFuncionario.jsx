// front/src/pages/Pessoas/Funcionarios/CadastroFuncionario/CadastroFuncionario.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastroFuncionario.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function CadastroFuncionario() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarCampos = () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf || !formData.telefone) {
      setMessage("ERRO: você deve preencher todos os campos");
      return false;
    }

    const cpfNumerico = formData.cpf.replace(/\D/g, '');
    const telefoneNumerico = formData.telefone.replace(/\D/g, '');

    const cpfOK = /^\d{11}$/.test(cpfNumerico);
    const telOK = /^\d{10,11}$/.test(telefoneNumerico);
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const senhaOK = formData.senha.length >= 3;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCampos()) return;

    setLoading(true);
    setMessage(null);
    
    try {
      const dadosParaEnviar = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        tipoUsuario: "EMPLOY" // ✅ Funcionário
      };

      console.log("📤 Enviando dados para cadastro de funcionário:", dadosParaEnviar);

      const response = await fetch('http://localhost:8080/pessoa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Token de admin necessário
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (response.ok) {
        const data = await response.json();
        
        setMessage("✅ SUCESSO: Funcionário cadastrado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listaFuncionarios");
        }, 2000);
        
      } else {
        const errorData = await response.json();
        
        let backendErrorMessage = "Falha no cadastro";
        
        if (errorData.message) {
          backendErrorMessage = errorData.message;
        } else if (Array.isArray(errorData) && errorData.length > 0) {
          backendErrorMessage = errorData[0].message || errorData[0].defaultMessage;
        } else if (errorData.error) {
          backendErrorMessage = errorData.error_description || errorData.error;
        }
        
        setMessage(`❌ ERRO: ${backendErrorMessage}`);
      }
      
    } catch (error) {
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

  const formatarCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatarTelefone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

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
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Cadastro de Funcionário</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Nome Completo *</label>
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Email *</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Senha *</label>
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

          <label className={styles.label}>CPF *</label>
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

          <label className={styles.label}>Telefone *</label>
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

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listaFuncionarios")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Funcionário"}
            </button>
          </div>
        </form>
      </div>

      {loading && <Loading />}
      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default CadastroFuncionario;