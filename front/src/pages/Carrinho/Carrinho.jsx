import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import DbTempProdutos from "../../db/DbTempProdutos";
import NavBarCliente from "../../components/NavBarCliente/NavBarCliente";
import MessageBox from "../../components/MessageBox/MessageBox";
import styles from "./Carrinho.module.css";

export function Carrinho() {
  const navigate = useNavigate();
  const { carrinho, removerDoCarrinho, atualizarQuantidade } = useContext(CarrinhoContext);
  const [selecionados, setSelecionados] = useState([]);
  const [mensagem, setMensagem] = useState("");

  // Junta dados do carrinho com os produtos
  const carrinhoComDetalhes = carrinho.map((item) => {
    const produto = DbTempProdutos.find((p) => p.id === item.idProduto);
    return {
      ...item,
      produto,
    };
  });

  // Calcula total apenas dos selecionados
  const total = useMemo(() => {
    return selecionados.reduce((acc, idProduto) => {
      const item = carrinhoComDetalhes.find((it) => it.idProduto === idProduto);
      if (item) {
        acc += item.produto.preco * item.quantidade;
      }
      return acc;
    }, 0);
  }, [selecionados, carrinhoComDetalhes]);

  const toggleSelecao = (idProduto) => {
    setSelecionados((prev) =>
      prev.includes(idProduto) ? prev.filter((id) => id !== idProduto) : [...prev, idProduto]
    );
  };

  const handleRemover = (idProduto) => {
    removerDoCarrinho(idProduto);
    setSelecionados((prev) => prev.filter((id) => id !== idProduto));
  };

  const handleComprar = () => {
    if (selecionados.length === 0) {
      setMensagem("Selecione pelo menos um item para comprar");
      return;
    }

    // Verifica se algum item selecionado ultrapassa o estoque
    const invalido = selecionados.find((idProduto) => {
      const item = carrinhoComDetalhes.find((it) => it.idProduto === idProduto);
      return item && item.quantidade > item.produto.qtd;
    });

    if (invalido) {
      setMensagem("Quantidade maior que o estoque disponível!");
      return;
    }

    navigate("/simulaPagamento", { state: { selecionados, carrinhoComDetalhes } });
  };

  if (carrinho.length === 0) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.vazio}>
          <p>Seu carrinho está vazio</p>
          <button onClick={() => navigate("/produtosCliente")}>Continuar Comprando</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavBarCliente />

      <h1 className={styles.titulo}>🛒 Carrinho</h1>

      <div className={styles.content}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>Seleção</th>
              <th>Produto</th>
              <th style={{ width: "100px" }}>Preço Unit.</th>
              <th style={{ width: "100px" }}>Qtd</th>
              <th style={{ width: "100px" }}>Subtotal</th>
              <th style={{ width: "60px" }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {carrinhoComDetalhes.map((item) => (
              <tr key={item.idProduto}>
                <td>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(item.idProduto)}
                    onChange={() => toggleSelecao(item.idProduto)}
                  />
                </td>
                <td>{item.produto?.nome}</td>
                <td>R$ {item.produto?.preco.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={item.produto?.qtd}
                    value={item.quantidade}
                    onChange={(e) => {
                      const newQty = Math.max(1, parseInt(e.target.value) || 1);
                      if (newQty > item.produto?.qtd) {
                        setMensagem("Quantidade maior que o estoque disponível!");
                      } else {
                        atualizarQuantidade(item.idProduto, newQty);
                      }
                    }}
                    style={{ width: "60px" }}
                  />
                </td>
                <td>R$ {(item.quantidade * (item.produto?.preco || 0)).toFixed(2)}</td>
                <td>
                  <button
                    className={styles.btnRemover}
                    onClick={() => handleRemover(item.idProduto)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.resumo}>
          <h3>Resumo</h3>
          <p>Itens selecionados: {selecionados.length}</p>
          <div className={styles.total}>Total: R$ {total.toFixed(2)}</div>
          <div className={styles.botoes}>
            <button
              className={styles.btnContinuar}
              onClick={() => navigate("/produtosCliente")}
            >
              Continuar Comprando
            </button>
            <button
              className={styles.btnComprar}
              onClick={handleComprar}
              disabled={selecionados.length === 0}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>

      {mensagem && <MessageBox message={mensagem} onClose={() => setMensagem("")} />}
    </div>
  );
}

export default Carrinho;
