import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import DbTempVendas from "../../db/DbTempVendas";
import styles from "./SimulaPagamento.module.css";

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function SimulaPagamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { carrinho, limparCarrinho } = useContext(CarrinhoContext);
  const [processando, setProcessando] = useState(false);
  const [form, setForm] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  });

  const { selecionados, carrinhoComDetalhes } = location.state || { selecionados: [], carrinhoComDetalhes: [] };

  const itensParaComprar = carrinhoComDetalhes.filter((item) =>
    selecionados.includes(item.idProduto)
  );

  const total = itensParaComprar.reduce(
    (acc, item) => acc + item.quantidade * (item.produto?.preco || 0),
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!form.numeroCartao || form.numeroCartao.length < 13) {
      alert("Número de cartão inválido");
      return false;
    }
    if (!form.nomeCartao.trim()) {
      alert("Nome do titular inválido");
      return false;
    }
    if (!form.validade || form.validade.length !== 5) {
      alert("Validade inválida (MM/YY)");
      return false;
    }
    if (!form.cvv || form.cvv.length < 3) {
      alert("CVV inválido");
      return false;
    }
    return true;
  };

  const handleConfirmar = () => {
    if (!validarFormulario()) return;
    if (!user) {
      alert("Usuário não autenticado");
      return;
    }

    setProcessando(true);
    setTimeout(() => {
      // Criar nova venda
      const novaVenda = {
        id: DbTempVendas.length + 1,
        idCliente: user.id,
        dataCompra: formatDate(new Date()),
        itens: itensParaComprar.map((item) => ({
          idProduto: item.idProduto,
          quantidade: item.quantidade,
        })),
      };

      DbTempVendas.push(novaVenda);
      limparCarrinho();

      setProcessando(false);
      navigate("/minhasCompras", { replace: true });
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <h1>Simular Pagamento</h1>

      <div className={styles.content}>
        <div className={styles.resumo}>
          <h3>Resumo da Compra</h3>
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
              {itensParaComprar.map((item) => (
                <tr key={item.idProduto}>
                  <td>{item.produto?.nome}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {item.produto?.preco.toFixed(2)}</td>
                  <td>R$ {(item.quantidade * (item.produto?.preco || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.totalResumo}>
            <strong>Total: R$ {total.toFixed(2)}</strong>
          </div>
        </div>

        <form className={styles.formulario}>
          <h3>Dados do Cartão</h3>

          <div className={styles.formGroup}>
            <label>Número do Cartão:</label>
            <input
              type="text"
              name="numeroCartao"
              value={form.numeroCartao}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
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
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Validade (MM/YY):</label>
              <input
                type="text"
                name="validade"
                value={form.validade}
                onChange={handleChange}
                placeholder="12/25"
                maxLength="5"
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
              />
            </div>
          </div>

          <div className={styles.botoes}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={() => navigate("/carrinho")}
              disabled={processando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={processando}
            >
              {processando ? "Processando..." : "Confirmar Pagamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimulaPagamento;
