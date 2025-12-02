// front/src/pages/Produtos/ProdutosAdministrador/CadastrarProdutos/CadastrarProdutos.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastrarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para cadastro de novos produtos no sistema
 * @component
 * @returns {JSX.Element} Formulário de cadastro de produto
 */
function CadastrarProdutos() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto de autenticação
  const { logout, token } = useContext(AuthContext);

  // Estado para dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    fabricante: "",
    preco: "",
    descricao: "",
    dataValidade: "",
    linkImagem: ""
  });

  // Estado para controlar carregamento durante envio
  const [loading, setLoading] = useState(false);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Atualiza estado do formulário quando campos são alterados
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Valida todos os campos do formulário antes do envio
   * @returns {boolean} true se todos os campos são válidos
   */
  const validarFormulario = () => {
    const { nome, fabricante, preco, dataValidade, linkImagem } = formData;

    // Valida campos obrigatórios
    if (!nome || !fabricante || !preco || !dataValidade) {
      setMessage("ERRO: Nome, fabricante, preço e data de validade são obrigatórios");
      return false;
    }

    // Valida comprimento máximo do nome
    if (nome.length > 100) {
      setMessage("ERRO: O nome não pode exceder 100 caracteres");
      return false;
    }

    // Valida valor do preço
    if (parseFloat(preco) <= 0) {
      setMessage("ERRO: O preço deve ser maior que zero");
      return false;
    }

    // Valida comprimento do link da imagem
    if (linkImagem && linkImagem.length > 255) {
      setMessage("ERRO: O link da imagem não pode exceder 255 caracteres");
      return false;
    }

    // Valida data de validade (não pode ser no passado)
    const dataValidadeObj = new Date(dataValidade);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataValidadeObj < hoje) {
      setMessage("ERRO: A data de validade deve ser hoje ou futura");
      return false;
    }

    return true;
  };

  /**
   * Processa o cadastro do produto
   * @async
   * @param {Event} e - Evento de submit do formulário
   */
  const salvarProduto = async (e) => {
    e.preventDefault();

    // Valida formulário antes de prosseguir
    if (!validarFormulario()) return;

    // Verifica se usuário está autenticado
    if (!token) {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      return;
    }

    // Inicia estado de carregamento
    setLoading(true);
    setMessage("");

    try {
      // Trunca o link da imagem se for muito longo (limite do backend)
      const linkImagemTruncado = formData.linkImagem?.trim().substring(0, 255) || "";

      // Prepara dados para envio ao backend
      const dadosParaEnviar = {
        nome: formData.nome.trim(),
        fabricante: formData.fabricante.trim(),
        preco: parseFloat(formData.preco),
        descricao: formData.descricao.trim() || "Sem descrição",
        dataValidade: formData.dataValidade + "T00:00:00.000Z", // Formato ISO
        linkImagem: linkImagemTruncado
      };

      // Requisição POST para criar novo produto
      const response = await fetch(`${API_URL}/produto/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      // Processa resposta do backend
      if (response.status >= 200 && response.status < 300) {
        setMessage("SUCESSO: Produto cadastrado com sucesso! Redirecionando...");
        
        // Redireciona para lista após 2 segundos
        setTimeout(() => {
          navigate("/listarProdutos");
        }, 2000);
        
      } else {
        // Tenta obter mensagem de erro específica
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Ignora erro de parse JSON
        }
        
        setMessage(`ERRO: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error('Erro de rede ao cadastrar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      // Finaliza estado de carregamento independente do resultado
      setLoading(false);
    }
  };

  /**
   * Retorna a data mínima permitida para validade (hoje)
   * @returns {string} Data no formato YYYY-MM-DD
   */
  const getDataMinima = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  /**
   * Renderiza o formulário de cadastro de produto
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />
      
      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Cadastrar Produto</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      {/* Container principal do formulário */}
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={salvarProduto}>
          {/* Campo: Nome do Produto */}
          <label className={styles.label}>Nome do Produto *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={formData.nome} 
            onChange={handleChange}
            placeholder="Ex: Paracetamol 500mg"
            maxLength={100}
            required
          />
          <span className={styles.hint}>Máximo 100 caracteres</span>

          {/* Campo: Fabricante */}
          <label className={styles.label}>Fabricante *</label>
          <input 
            className={styles.input} 
            name="fabricante"
            value={formData.fabricante} 
            onChange={handleChange}
            placeholder="Ex: Lab Farmaceutico XYZ"
            required
          />

          {/* Linha com Preço e Data de Validade */}
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Preço (R$) *</label>
              <input 
                className={styles.input} 
                type="number" 
                name="preco"
                value={formData.preco} 
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
              <span className={styles.hint}>Valor maior que zero</span>
            </div>

            <div>
              <label className={styles.label}>Data de Validade *</label>
              <input 
                className={styles.input} 
                type="date" 
                name="dataValidade"
                value={formData.dataValidade} 
                onChange={handleChange}
                min={getDataMinima()}
                required
              />
              <span className={styles.hint}>Data atual ou futura</span>
            </div>
          </div>

          {/* Campo: Descrição */}
          <label className={styles.label}>Descrição</label>
          <textarea 
            className={styles.textarea} 
            name="descricao"
            value={formData.descricao} 
            onChange={handleChange}
            placeholder="Descrição detalhada do produto..."
            rows="3"
            maxLength={255}
          />
          <span className={styles.hint}>Máximo 255 caracteres</span>

          {/* Campo: Link da Imagem */}
          <label className={styles.label}>Link da Imagem (URL)</label>
          <input 
            className={styles.input} 
            name="linkImagem"
            value={formData.linkImagem} 
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            type="url"
            maxLength={255}
          />
          <span className={styles.hint}>Opcional - Máximo 255 caracteres</span>
          
          {/* Contador de caracteres para link da imagem */}
          {formData.linkImagem && (
            <div className={styles.contadorCaracteres}>
              {formData.linkImagem.length}/255 caracteres
              {formData.linkImagem.length > 255 && (
                <span className={styles.erroContador}> - Link muito longo!</span>
              )}
            </div>
          )}

          {/* Preview da imagem (se link válido) */}
          {formData.linkImagem && formData.linkImagem.length <= 255 && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>Preview da imagem:</span>
              <img 
                src={formData.linkImagem} 
                alt="Preview" 
                className={styles.previewImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Botões de ação do formulário */}
          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancel} 
              onClick={() => navigate("/listarProdutos")}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              disabled={loading || (formData.linkImagem && formData.linkImagem.length > 255)}
            >
              {loading ? "Cadastrando..." : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      </div>

      {/* Componente de loading durante envio */}
      {loading && <Loading />}

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

export default CadastrarProdutos;