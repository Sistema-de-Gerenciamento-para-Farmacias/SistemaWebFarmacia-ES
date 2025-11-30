// Carrinho.jsx - VERSÃO CORRIGIDA
import { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import { AuthContext } from "../../context/AuthContext";
import NavBarCliente from "../../components/NavBarCliente/NavBarCliente";
import MessageBox from "../../components/MessageBox/MessageBox";
import Loading from "../../components/Loading/Loading";
import styles from "./Carrinho.module.css";

export function Carrinho() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { 
    carrinho, 
    removerDoCarrinho, 
    atualizarQuantidade,
    carregarCarrinho,
    limparCarrinho,
    loading 
  } = useContext(CarrinhoContext);
  
  const [selecionados, setSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [atualizando, setAtualizando] = useState({}); // Controla quais itens estão sendo atualizados

  // CORREÇÃO: Garantir que carrinho seja sempre um array
  const carrinhoArray = Array.isArray(carrinho) ? carrinho : [];

  // Carrega carrinho ao montar o componente
  useEffect(() => {
    if (token) {
      carregarCarrinho();
    }
  }, [token, carregarCarrinho]);

  // Calcula total apenas dos selecionados
  const total = useMemo(() => {
    return selecionados.reduce((acc, idItemCarrinho) => {
      const item = carrinhoArray.find((it) => it.idItemCarrinho === idItemCarrinho);
      if (item) {
        acc += item.precoUnitario * item.quantidade;
      }
      return acc;
    }, 0);
  }, [selecionados, carrinhoArray]);

  const toggleSelecao = (idItemCarrinho) => {
    setSelecionados((prev) =>
      prev.includes(idItemCarrinho) 
        ? prev.filter((id) => id !== idItemCarrinho) 
        : [...prev, idItemCarrinho]
    );
  };

  const handleRemover = async (idItemCarrinho) => {
    try {
      await removerDoCarrinho(idItemCarrinho);
      setSelecionados((prev) => prev.filter((id) => id !== idItemCarrinho));
      setMensagem("✅ Item removido do carrinho!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      setMensagem(`❌ Erro ao remover item: ${error.message}`);
    }
  };

  const handleAtualizarQuantidade = async (idItemCarrinho, novaQuantidade) => {
    if (novaQuantidade < 1) {
      setMensagem("❌ Quantidade deve ser pelo menos 1");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // CORREÇÃO: Marcar item como atualizando para evitar flickering
    setAtualizando(prev => ({ ...prev, [idItemCarrinho]: true }));

    try {
      await atualizarQuantidade(idItemCarrinho, novaQuantidade);
      // CORREÇÃO: Não mostrar mensagem para atualizações normais
    } catch (error) {
      setMensagem(`❌ Erro ao atualizar quantidade: ${error.message}`);
      setTimeout(() => setMensagem(""), 3000);
    } finally {
      // CORREÇÃO: Remover marcação de atualização
      setAtualizando(prev => ({ ...prev, [idItemCarrinho]: false }));
    }
  };

  const handleComprar = () => {
    if (selecionados.length === 0) {
      setMensagem("❌ Selecione pelo menos um item para comprar");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // Prepara dados para a venda
    const itensVenda = selecionados.map(idItemCarrinho => {
      const item = carrinhoArray.find(it => it.idItemCarrinho === idItemCarrinho);
      return {
        idProduto: item.idProduto,
        quantidade: item.quantidade
      };
    });

    navigate("/simulaPagamento", { 
      state: { 
        itensVenda,
        total,
        carrinhoItens: carrinhoArray.filter(item => selecionados.includes(item.idItemCarrinho))
      } 
    });
  };

  const handleLimparCarrinho = async () => {
    try {
      await limparCarrinho();
      setSelecionados([]);
      setMensagem("✅ Carrinho limpo com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      setMensagem(`❌ Erro ao limpar carrinho: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  if (carrinhoArray.length === 0) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.vazio}>
          <h2>🛒 Seu carrinho está vazio</h2>
          <p>Que tal explorar nossos produtos?</p>
          <button 
            className={styles.btnContinuar}
            onClick={() => navigate("/produtosCliente")}
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavBarCliente />

      <h1 className={styles.titulo}>🛒 Meu Carrinho</h1>

      <div className={styles.content}>
        <div className={styles.listaItens}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={selecionados.length === carrinhoArray.length && carrinhoArray.length > 0}
                    onChange={() => {
                      if (selecionados.length === carrinhoArray.length) {
                        setSelecionados([]);
                      } else {
                        setSelecionados(carrinhoArray.map(item => item.idItemCarrinho));
                      }
                    }}
                  />
                </th>
                <th>Produto</th>
                <th style={{ width: "120px" }}>Preço Unit.</th>
                <th style={{ width: "120px" }}>Quantidade</th>
                <th style={{ width: "120px" }}>Subtotal</th>
                <th style={{ width: "80px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carrinhoArray.map((item) => (
                <tr 
                  key={item.idItemCarrinho}
                  className={atualizando[item.idItemCarrinho] ? styles.atualizando : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(item.idItemCarrinho)}
                      onChange={() => toggleSelecao(item.idItemCarrinho)}
                    />
                  </td>
                  <td>
                    <div className={styles.infoProduto}>
                      <div>
                        <div className={styles.nomeProduto}>{item.nomeProduto}</div>
                        <div className={styles.fabricante}>{item.fabricante}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.preco}>
                    R$ {item.precoUnitario?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <div className={styles.quantidadeContainer}>
                      <button
                        className={styles.btnQuantidade}
                        onClick={() => handleAtualizarQuantidade(item.idItemCarrinho, item.quantidade - 1)}
                        disabled={item.quantidade <= 1 || atualizando[item.idItemCarrinho]}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={item.quantidade}
                        onChange={(e) => {
                          const newQty = Math.max(1, parseInt(e.target.value) || 1);
                          handleAtualizarQuantidade(item.idItemCarrinho, newQty);
                        }}
                        className={styles.inputQuantidade}
                        disabled={atualizando[item.idItemCarrinho]}
                      />
                      <button
                        className={styles.btnQuantidade}
                        onClick={() => handleAtualizarQuantidade(item.idItemCarrinho, item.quantidade + 1)}
                        disabled={atualizando[item.idItemCarrinho]}
                      >
                        +
                      </button>
                    </div>
                    {atualizando[item.idItemCarrinho] && (
                      <div className={styles.atualizandoIndicator}>⟳</div>
                    )}
                  </td>
                  <td className={styles.subtotal}>
                    R$ {((item.precoUnitario || 0) * item.quantidade).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className={styles.btnRemover}
                      onClick={() => handleRemover(item.idItemCarrinho)}
                      title="Remover item"
                      disabled={atualizando[item.idItemCarrinho]}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.acoesCarrinho}>
            <button 
              className={styles.btnLimpar}
              onClick={handleLimparCarrinho}
            >
              🧹 Limpar Carrinho
            </button>
          </div>
        </div>

        <div className={styles.resumo}>
          <h3>📋 Resumo do Pedido</h3>
          
          <div className={styles.resumoInfo}>
            <div className={styles.resumoItem}>
              <span>Itens selecionados:</span>
              <span>{selecionados.length}</span>
            </div>
            <div className={styles.resumoItem}>
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className={styles.resumoItem}>
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div className={styles.resumoDivider}></div>
            <div className={styles.resumoTotal}>
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.botoes}>
            <button
              className={styles.btnContinuar}
              onClick={() => navigate("/produtosCliente")}
            >
              ← Continuar Comprando
            </button>
            <button
              className={styles.btnComprar}
              onClick={handleComprar}
              disabled={selecionados.length === 0}
            >
              🛍️ Finalizar Compra
            </button>
          </div>

          <div className={styles.beneficios}>
            <h4>🎁 Benefícios</h4>
            <ul>
              <li>✅ Entrega grátis para compras acima de R$ 50</li>
              <li>✅ Pagamento seguro</li>
              <li>✅ Devolução em 30 dias</li>
            </ul>
          </div>
        </div>
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

export default Carrinho;