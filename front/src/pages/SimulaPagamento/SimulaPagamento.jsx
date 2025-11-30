import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import MessageBox from "../../components/MessageBox/MessageBox";
import Loading from "../../components/Loading/Loading";
import styles from "./SimulaPagamento.module.css";

export function SimulaPagamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const { limparCarrinho } = useContext(CarrinhoContext);
  
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  });

  const { itensVenda, total, carrinhoItens } = location.state || { 
    itensVenda: [], 
    total: 0, 
    carrinhoItens: [] 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === "numeroCartao") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .slice(0, 19);
    }
    
    if (name === "validade") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(?=\d)/, "$1/")
        .slice(0, 5);
    }
    
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const validarFormulario = () => {
    if (!form.numeroCartao || form.numeroCartao.replace(/\s/g, "").length < 13) {
      setMensagem("❌ Número de cartão inválido");
      return false;
    }
    if (!form.nomeCartao.trim()) {
      setMensagem("❌ Nome do titular inválido");
      return false;
    }
    if (!form.validade || form.validade.length !== 5) {
      setMensagem("❌ Validade inválida (MM/AA)");
      return false;
    }
    if (!form.cvv || form.cvv.length < 3) {
      setMensagem("❌ CVV inválido");
      return false;
    }
    return true;
  };

  // CORREÇÃO: Buscar o ID do usuário logado
  const buscarUsuarioLogado = async () => {
    try {
      const response = await fetch('http://localhost:8080/pessoa/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pessoas = await response.json();
        // Encontrar o usuário pelo email do token
        const usuarioLogado = pessoas.find(p => p.email === user?.email);
        return usuarioLogado?.id;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  };

  const criarVenda = async () => {
    try {
      // CORREÇÃO: Buscar o ID do usuário em vez de usar o email
      const idUsuario = await buscarUsuarioLogado();
      
      if (!idUsuario) {
        throw new Error('Não foi possível identificar o usuário');
      }

      const response = await fetch('http://localhost:8080/venda/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idUsuario: idUsuario, // CORREÇÃO: Enviar ID numérico
          itens: itensVenda
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar venda');
      }
    } catch (error) {
      throw error;
    }
  };

  const removerItensDoCarrinho = async () => {
    try {
      const promises = carrinhoItens.map(item => 
        fetch(`http://localhost:8080/carrinho/remover/${item.idItemCarrinho}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao remover itens do carrinho:', error);
      return false;
    }
  };

  const handleConfirmar = async () => {
    if (!validarFormulario()) {
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    if (!user || !token) {
      setMensagem("❌ Usuário não autenticado");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    if (itensVenda.length === 0) {
      setMensagem("❌ Nenhum item selecionado para compra");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    setProcessando(true);

    try {
      // 1. Criar a venda no backend
      const vendaCriada = await criarVenda();
      
      // 2. Remover itens do carrinho
      await removerItensDoCarrinho();
      
      // 3. Atualizar contexto local
      await limparCarrinho();
      
      setMensagem("✅ Compra realizada com sucesso!");
      
      setTimeout(() => {
        navigate("/minhasCompras", { 
          replace: true,
          state: { vendaRecente: vendaCriada }
        });
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar compra:', error);
      setMensagem(`❌ Erro ao processar compra: ${error.message}`);
    } finally {
      setProcessando(false);
      setTimeout(() => setMensagem(""), 5000);
    }
  };

  const handleCancelar = () => {
    navigate("/carrinho");
  };

  if (itensVenda.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.vazio}>
          <h2>🛒 Nenhum item selecionado</h2>
          <p>Volte ao carrinho para selecionar os itens desejados.</p>
          <button 
            className={styles.btnVoltar}
            onClick={() => navigate("/carrinho")}
          >
            Voltar ao Carrinho
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>💳 Finalizar Compra</h1>

      <div className={styles.content}>
        <div className={styles.resumo}>
          <h3>📦 Resumo do Pedido</h3>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrinhoItens.map((item) => (
                <tr key={item.idItemCarrinho}>
                  <td className={styles.nomeProduto}>{item.nomeProduto}</td>
                  <td className={styles.quantidade}>{item.quantidade}</td>
                  <td className={styles.precoUnitario}>R$ {item.precoUnitario?.toFixed(2)}</td>
                  <td className={styles.subtotal}>
                    R$ {((item.precoUnitario || 0) * item.quantidade).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.totalResumo}>
            <div className={styles.totalItem}>
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className={styles.totalItem}>
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div className={styles.totalFinal}>
              <strong>Total: R$ {total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <form className={styles.formulario} onSubmit={(e) => e.preventDefault()}>
          <h3>💳 Dados de Pagamento</h3>

          <div className={styles.formGroup}>
            <label>Número do Cartão:</label>
            <input
              type="text"
              name="numeroCartao"
              value={form.numeroCartao}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              disabled={processando}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nome do Titular:</label>
            <input
              type="text"
              name="nomeCartao"
              value={form.nomeCartao}
              onChange={handleChange}
              placeholder="NOME COMPLETO"
              disabled={processando}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Validade (MM/AA):</label>
              <input
                type="text"
                name="validade"
                value={form.validade}
                onChange={handleChange}
                placeholder="12/25"
                maxLength="5"
                disabled={processando}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>CVV:</label>
              <input
                type="text"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength="4"
                disabled={processando}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.infoSeguranca}>
            <div className={styles.iconeSeguranca}>🔒</div>
            <span>Pagamento 100% seguro</span>
          </div>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={handleCancelar}
              disabled={processando}
            >
              ↩️ Cancelar
            </button>
            <button
              type="button"
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={processando}
            >
              {processando ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Processando...
                </>
              ) : (
                "✅ Confirmar Pagamento"
              )}
            </button>
          </div>
        </form>
      </div>

      {mensagem && (
        <MessageBox 
          message={mensagem} 
          onClose={() => setMensagem("")}
          type={mensagem.includes('❌') ? 'error' : 'success'}
        />
      )}
    </div>
  );
}

export default SimulaPagamento;