// front/src/pages/Produtos/ProdutosAdministrador/CadastrarProdutos/CadastrarProdutos.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastrarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function CadastrarProdutos() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nome: "",
    fabricante: "",
    preco: "",
    descricao: "",
    dataValidade: "",
    linkImagem: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nome, fabricante, preco, dataValidade, linkImagem } = formData;

    if (!nome || !fabricante || !preco || !dataValidade) {
      setMessage("ERRO: Nome, fabricante, preço e data de validade são obrigatórios");
      return false;
    }

    if (nome.length > 100) {
      setMessage("ERRO: O nome não pode exceder 100 caracteres");
      return false;
    }

    if (parseFloat(preco) <= 0) {
      setMessage("ERRO: O preço deve ser maior que zero");
      return false;
    }

    // Validação do link da imagem
    if (linkImagem && linkImagem.length > 255) {
      setMessage("ERRO: O link da imagem não pode exceder 255 caracteres");
      return false;
    }

    const dataValidadeObj = new Date(dataValidade);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataValidadeObj < hoje) {
      setMessage("ERRO: A data de validade deve ser hoje ou futura");
      return false;
    }

    return true;
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    if (!token) {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Trunca o link da imagem se for muito longo
      const linkImagemTruncado = formData.linkImagem?.trim().substring(0, 255) || "";

      const dadosParaEnviar = {
        nome: formData.nome.trim(),
        fabricante: formData.fabricante.trim(),
        preco: parseFloat(formData.preco),
        descricao: formData.descricao.trim() || "Sem descrição",
        dataValidade: formData.dataValidade + "T00:00:00.000Z",
        linkImagem: linkImagemTruncado
      };

      const response = await fetch('http://localhost:8080/produto/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (response.status >= 200 && response.status < 300) {
        setMessage("SUCESSO: Produto cadastrado com sucesso! Redirecionando...");
        
        setTimeout(() => {
          navigate("/listarProdutos");
        }, 2000);
        
      } else {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Ignora erro de parse
        }
        
        setMessage(`ERRO: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error('Erro de rede ao cadastrar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const getDataMinima = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />
      <div className={styles.header}>
        <h2 className={styles.title}>Cadastrar Produto</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={salvarProduto}>
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

          <label className={styles.label}>Fabricante *</label>
          <input 
            className={styles.input} 
            name="fabricante"
            value={formData.fabricante} 
            onChange={handleChange}
            placeholder="Ex: Lab Farmaceutico XYZ"
            required
          />

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
          
          {formData.linkImagem && (
            <div className={styles.contadorCaracteres}>
              {formData.linkImagem.length}/255 caracteres
              {formData.linkImagem.length > 255 && (
                <span className={styles.erroContador}> - Link muito longo!</span>
              )}
            </div>
          )}

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

      {loading && <Loading />}

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