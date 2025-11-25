// front/src/pages/Produtos/ProdutosAdministrador/CadastrarProdutos/CadastrarProdutos.jsx
// Tela de cadastro de produto

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CadastrarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";

function CadastrarProdutos() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [preco, setPreco] = useState("");
  const [qtd, setQtd] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [linkImagem, setLinkImagem] = useState("");
  const [message, setMessage] = useState("");

  const salvar = () => {
    if (!nome || !fabricante || !preco || !qtd || !dataValidade || !linkImagem) {
      setMessage("Preencha todos os campos antes de cadastrar!");
      return;
    }

    const novoProduto = {
      id: Date.now(),
      nome,
      fabricante,
      preco: parseFloat(preco),
      qtd: parseInt(qtd),
      dataValidade,
      linkImagem,
      existe: true,
    };

    console.log("Produto cadastrado:", novoProduto);

    setMessage("Produto cadastrado com sucesso!");
    setTimeout(() => {
      navigate("/listarProdutos");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />
      <div className={styles.header}>
        <h2 className={styles.title}>Cadastrar Produto</h2>
        <button className={styles.logoutTop} onClick={logout}>Logout</button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome</label>
          <input className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} />

          <label className={styles.label}>Fabricante</label>
          <input className={styles.input} value={fabricante} onChange={(e) => setFabricante(e.target.value)} />

          <label className={styles.label}>Preço</label>
          <input className={styles.input} type="number" value={preco} onChange={(e) => setPreco(e.target.value)} />

          <label className={styles.label}>Quantidade</label>
          <input className={styles.input} type="number" value={qtd} onChange={(e) => setQtd(e.target.value)} />

          <label className={styles.label}>Data de Validade</label>
          <input className={styles.input} type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />

          <label className={styles.label}>Link da Imagem</label>
          <input className={styles.input} value={linkImagem} onChange={(e) => setLinkImagem(e.target.value)} />

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={() => navigate("/listarProdutos")}>Cancelar</button>
            <button type="submit" className={styles.saveButton} onClick={salvar}>Cadastrar</button>
          </div>
        </form>
      </div>

      {message && <MessageBox message={message} onClose={() => setMessage("")} />}
    </div>
  );
}

export default CadastrarProdutos;
