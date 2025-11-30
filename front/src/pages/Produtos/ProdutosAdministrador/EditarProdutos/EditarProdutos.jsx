// front/src/pages/Produtos/ProdutosAdministrador/EditarProdutos/EditarProdutos.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function EditarProdutos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarProduto();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarProduto = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8080/produto/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const produtoData = await response.json();
        
        const dataValidade = produtoData.dataValidade 
          ? new Date(produtoData.dataValidade).toISOString().split('T')[0]
          : '';
        
        setProduto({
          ...produtoData,
          dataValidade: dataValidade
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Produto não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produto'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const { nome, fabricante, preco, dataValidade } = produto;

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

    const dataValidadeObj = new Date(dataValidade);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataValidadeObj < hoje) {
      setMessage("ERRO: A data de validade deve ser hoje ou futura");
      return false;
    }

    return true;
  };

  const salvarProduto = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setMessage("");

    try {
      const dadosParaEnviar = {
        nome: produto.nome.trim(),
        fabricante: produto.fabricante.trim(),
        preco: parseFloat(produto.preco),
        descricao: produto.descricao?.trim() || "Sem descrição",
        dataValidade: produto.dataValidade + "T00:00:00.000Z",
        linkImagem: produto.linkImagem?.trim() || ""
      };

      const response = await fetch(`http://localhost:8080/produto/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (response.ok) {
        setMessage("SUCESSO: Produto atualizado com sucesso! Redirecionando...");
        
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
      console.error('Erro ao atualizar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  };

  const getDataMinima = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Produto não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listarProdutos")}
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
        <h2 className={styles.title}>Editar Produto</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome do Produto *</label>
          <input 
            className={styles.input} 
            name="nome"
            value={produto.nome || ''} 
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
            value={produto.fabricante || ''} 
            onChange={handleChange}
            placeholder="Ex: Lab Farmacêutico XYZ"
            required
          />

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Preço (R$) *</label>
              <input 
                className={styles.input} 
                type="number" 
                name="preco"
                value={produto.preco || ''} 
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
                value={produto.dataValidade || ''} 
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
            value={produto.descricao || ''} 
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
            value={produto.linkImagem || ''} 
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            type="url"
          />
          <span className={styles.hint}>Opcional - URL da imagem do produto</span>

          {produto.linkImagem && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>Preview da imagem:</span>
              <img 
                src={produto.linkImagem} 
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
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton} 
              onClick={salvarProduto}
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

export default EditarProdutos;