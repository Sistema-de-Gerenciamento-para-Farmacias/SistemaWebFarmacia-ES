import { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import produtosDb from "../../../../db/DbTempProdutos";
import { CarrinhoContext } from "../../../../context/CarrinhoContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import styles from "./DetalhesProdutoCliente.module.css";

export function DetalhesProdutoCliente() {
  const { id } = useParams();
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);

  const [quantidade, setQuantidade] = useState(1);
  const [mensagem, setMensagem] = useState("");

  const produto = produtosDb.find((p) => p.id === parseInt(id));

  if (!produto) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Produto não encontrado
      </div>
    );
  }

  const handleAdicionarAoCarrinho = () => {
    if (quantidade < 1 || quantidade > produto.qtd) {
      setMensagem("Quantidade inválida");
      return;
    }
    adicionarAoCarrinho(produto, quantidade);
    setMensagem("Produto adicionado ao carrinho!");
    setTimeout(() => {
      setMensagem("");
      setQuantidade(1);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <BotaoRetorno />

      <div className={styles.card}>
        <div className={styles.imageSection}>
          <img src={produto.linkImagem} alt={produto.nome} />
        </div>

        <div className={styles.detalhes}>
          <h1 className={styles.nome}>{produto.nome}</h1>
          <p className={styles.preco}>R$ {produto.preco.toFixed(2)}</p>

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <strong>Quantidade em Estoque:</strong> {produto.qtd}
            </div>
            <div className={styles.infoItem}>
              <strong>Data de Validade:</strong> {produto.dataValidade}
            </div>
            <div className={styles.infoItem}>
              <strong>Fabricante:</strong> {produto.fabricante}
            </div>
            <div className={styles.infoItem}>
              <strong>Descrição:</strong> {produto.descricao}
            </div>
          </div>

          <div className={styles.compra}>
            <p className={styles.pergunta}>Deseja comprar?</p>
            <div className={styles.quantidadeInput}>
              <label>Quantidade:</label>
              <input
                type="number"
                min="1"
                max={produto.qtd}
                value={quantidade}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setQuantidade("");
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num)) {
                      setQuantidade(Math.min(Math.max(num, 1), produto.qtd));
                    }
                  }
                }}
              />
            </div>

            <button
              className={styles.btnAdicionar}
              onClick={handleAdicionarAoCarrinho}
            >
              Adicionar ao Carrinho
            </button>
          </div>

          {mensagem && (
            <MessageBox
              message={mensagem}
              onClose={() => setMensagem("")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesProdutoCliente;
