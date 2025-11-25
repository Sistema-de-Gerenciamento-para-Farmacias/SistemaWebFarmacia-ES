// front/src/pages/Produtos/ProdutosAdministrador/EditarProdutos/EditarProdutos.jsx
// Tela de edição de produto

import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";

import produtosDb from "../../../../db/DbTempProdutos";

function EditarProdutos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [produto, setProduto] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const p = produtosDb.find((prod) => String(prod.id) === String(id));
    if (p) setProduto(p);
  }, [id]);

  const salvar = () => {
    if (!produto?.nome || !produto?.fabricante || !produto?.preco || !produto?.qtd || !produto?.dataValidade || !produto?.linkImagem) {
      setMessage("Preencha todos os campos antes de salvar!");
      return;
    }

    console.log("Produto atualizado:", produto);

    setMessage("Produto atualizado com sucesso!");
    setTimeout(() => {
      navigate("/listarProdutos");
    }, 1500);
  };

  if (!produto) return <div>Produto não encontrado.</div>;

  return (
    <div className={styles.container}>
      <NavBarAdm />
      <div className={styles.header}>
        <h2 className={styles.title}>Editar Produto</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome</label>
          <input className={styles.input} value={produto.nome} onChange={(e) => setProduto({ ...produto, nome: e.target.value })} />

          <label className={styles.label}>Fabricante</label>
          <input className={styles.input} value={produto.fabricante} onChange={(e) => setProduto({ ...produto, fabricante: e.target.value })} />

          <label className={styles.label}>Preço</label>
          <input className={styles.input} type="number" value={produto.preco} onChange={(e) => setProduto({ ...produto, preco: e.target.value })} />

          <label className={styles.label}>Quantidade</label>
          <input className={styles.input} type="number" value={produto.qtd} onChange={(e) => setProduto({ ...produto, qtd: e.target.value })} />

          <label className={styles.label}>Data de Validade</label>
          <input className={styles.input} type="date" value={produto.dataValidade} onChange={(e) => setProduto({ ...produto, dataValidade: e.target.value })} />

          <label className={styles.label}>Link da Imagem</label>
          <input className={styles.input} value={produto.linkImagem} onChange={(e) => setProduto({ ...produto, linkImagem: e.target.value })} />

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={() => navigate("/listarProdutos")}>Cancelar</button>
            <button type="submit" className={styles.saveButton} onClick={salvar}>Salvar</button>
          </div>
        </form>
      </div>

      {message && <MessageBox message={message} onClose={() => setMessage("")} />}
    </div>
  );
}

export default EditarProdutos;
